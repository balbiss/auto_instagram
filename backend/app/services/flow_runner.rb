# Motor de execucao dos fluxos (estilo ManyChat): manda o passo atual e decide
# qual o proximo passo quando uma resposta chega. Mantem o job do webhook enxuto.
class FlowRunner
  def initialize(instagram_account)
    @instagram_account = instagram_account
    @client = Instagram::GraphClient.new(access_token: instagram_account.access_token)
  end

  # Inicia (ou reinicia, se o lead comentar de novo) o fluxo numa conversa.
  # `comment` é opcional — guardado na sessão só pra saber depois em qual post/reel
  # o lead entrou nesse fluxo (tela de Dados coletados).
  def start(flow, conversation, comment: nil)
    first_step = flow.flow_steps.order(:position).first
    return if first_step.nil?

    session = FlowSession.find_or_initialize_by(flow: flow, conversation: conversation)
    session.update!(status: :active, current_step_id: first_step.id, data: {}, comment: comment)

    send_step(first_step, conversation)
  end

  # Processa a resposta do lead pra uma sessao ja ativa e avanca pro proximo passo.
  def advance(session, message_event)
    step = session.current_step
    return if step.nil?

    if step.quick_replies?
      advance_quick_replies(session, step, message_event)
    else
      advance_collect_text(session, step, message_event)
    end
  end

  private

  def advance_quick_replies(session, step, message_event)
    payload = message_event.dig("message", "quick_reply", "payload")
    return if payload.blank?

    option = step.flow_step_options.detect { |o| option_payload(o) == payload }
    return if option.nil?

    move_to_next(session, option.next_step_id, session.conversation)
  end

  def advance_collect_text(session, step, message_event)
    text = message_event.dig("message", "text")
    return if text.blank?

    session.update!(data: session.data.merge(step.field_name => text))

    next_step = step.flow.flow_steps.order(:position).find { |s| s.position > step.position }
    move_to_next(session, next_step&.id, session.conversation)
  end

  def move_to_next(session, next_step_id, conversation)
    if next_step_id.blank?
      session.update!(status: :completed, current_step_id: nil)
      return
    end

    next_step = FlowStep.find(next_step_id)
    session.update!(current_step_id: next_step.id)
    send_step(next_step, conversation)
  end

  def send_step(step, conversation)
    igsid = conversation.contact.igsid

    response =
      if step.quick_replies?
        quick_replies = step.flow_step_options.map { |o| { title: o.label, payload: option_payload(o) } }
        @client.send_message_with_quick_replies(
          ig_user_id: @instagram_account.ig_user_id,
          recipient_igsid: igsid,
          text: step.message_text,
          quick_replies: quick_replies
        )
      else
        @client.send_message(
          ig_user_id: @instagram_account.ig_user_id,
          recipient_igsid: igsid,
          text: step.message_text
        )
      end

    conversation.messages.create!(
      source_id: response["message_id"],
      direction: :outbound,
      body: step.message_text,
      is_echo: false,
      sent_at: Time.current
    )
  rescue Instagram::GraphClient::ApiError => e
    Rails.logger.error("FlowRunner failed to send step #{step.id}: #{e.message}")
  end

  def option_payload(option)
    "flow_opt_#{option.id}"
  end
end
