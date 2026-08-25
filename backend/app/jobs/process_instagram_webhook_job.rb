# Processa o payload cru do webhook do Instagram fora do ciclo de request
# (a Meta espera 200 rapido; toda logica de negocio roda aqui).
class ProcessInstagramWebhookJob < ApplicationJob
  queue_as :default

  def perform(raw_payload)
    payload = JSON.parse(raw_payload)

    Array(payload["entry"]).each { |entry| process_entry(entry) }
  end

  private

  def process_entry(entry)
    instagram_account = InstagramAccount.find_by(ig_user_id: entry["id"])
    return if instagram_account.nil?

    Array(entry["messaging"]).each { |event| process_messaging_event(instagram_account, event) }
    Array(entry["changes"]).each do |change|
      process_comment_event(instagram_account, change["value"]) if change["field"] == "comments"
    end
  end

  # "referral" chega sem "message" — e o evento de alguem abrindo o DM por um
  # link ig.me/m/usuario?ref=codigo, antes de digitar qualquer coisa.
  def process_messaging_event(instagram_account, event)
    if event["referral"].present?
      process_referral_event(instagram_account, event)
    else
      process_message_event(instagram_account, event)
    end
  end

  def process_referral_event(instagram_account, event)
    ref = event.dig("referral", "ref")
    sender_igsid = event.dig("sender", "id")
    return if ref.blank? || sender_igsid.blank?

    rule = instagram_account.account.automation_rules.active.referral
      .find_by(instagram_account_id: instagram_account.id, referral_ref: ref)
    return if rule.nil?

    contact = find_or_create_contact(instagram_account, sender_igsid)
    conversation = Conversation.find_or_create_by!(account: instagram_account.account, contact: contact) do |c|
      c.instagram_account = instagram_account
    end

    if rule.flow.present?
      FlowRunner.new(instagram_account).start(rule.flow, conversation)
    elsif rule.private_reply_template.present?
      Instagram::GraphClient.new(access_token: instagram_account.access_token).send_message(
        ig_user_id: instagram_account.ig_user_id,
        recipient_igsid: sender_igsid,
        text: rule.private_reply_template
      )
    end
  rescue Instagram::GraphClient::ApiError => e
    Rails.logger.error("Instagram referral dispatch failed for ref #{ref}: #{e.message}")
  end

  def process_message_event(instagram_account, event)
    message = event["message"]
    return if message.nil? || message["mid"].blank?
    return if Message.exists?(source_id: message["mid"])

    is_echo = message["is_echo"].present?
    contact_igsid = is_echo ? event.dig("recipient", "id") : event.dig("sender", "id")
    return if contact_igsid.blank?

    contact = find_or_create_contact(instagram_account, contact_igsid)
    conversation = Conversation.find_or_create_by!(account: instagram_account.account, contact: contact) do |c|
      c.instagram_account = instagram_account
    end
    attachment = Array(message["attachments"]).first

    conversation.messages.create!(
      source_id: message["mid"],
      direction: is_echo ? :outbound : :inbound,
      body: message["text"],
      is_echo: is_echo,
      attachment_url: attachment&.dig("payload", "url"),
      attachment_type: attachment&.dig("type"),
      sent_at: Time.zone.at(event["timestamp"].to_i / 1000.0)
    )

    # Resposta de verdade do lead (nao eco do proprio bot) numa conversa com
    # fluxo ativo — decide o proximo passo e ja manda.
    return if is_echo

    session = conversation.active_flow_session
    FlowRunner.new(instagram_account).advance(session, event) if session.present?
  end

  def process_comment_event(instagram_account, value)
    return if value.nil? || value["id"].blank?
    return if Comment.exists?(comment_id: value["id"])

    commenter_profile = fetch_commenter_profile(instagram_account, value.dig("from", "id"))
    media = fetch_media_info(instagram_account, value.dig("media", "id"))

    comment = Comment.create!(
      account: instagram_account.account,
      comment_id: value["id"],
      media_id: value.dig("media", "id"),
      text: value["text"],
      commenter_igsid: value.dig("from", "id"),
      commenter_username: value.dig("from", "username") || commenter_profile["username"],
      commenter_profile_picture_url: commenter_profile["profile_pic"],
      media_permalink: media["permalink"],
      media_type: media["media_type"],
      media_thumbnail_url: media["thumbnail_url"] || media["media_url"],
      media_caption: media["caption"]
    )

    rule = find_matching_rule(instagram_account, comment)
    return if rule.nil?

    comment.update!(automation_rule: rule)
    dispatch_rule(instagram_account, comment, rule)
  end

  def dispatch_rule(instagram_account, comment, rule)
    client = Instagram::GraphClient.new(access_token: instagram_account.access_token)

    if rule.public_reply_template.present?
      text = MessageTemplate.render(rule.public_reply_template, comment.commenter_username)
      client.reply_to_comment(comment_id: comment.comment_id, text: text)
      comment.update!(replied_publicly: true)
    end

    if rule.flow.present?
      contact = find_or_create_contact(instagram_account, comment.commenter_igsid)
      conversation = Conversation.find_or_create_by!(account: instagram_account.account, contact: contact) do |c|
        c.instagram_account = instagram_account
      end
      FlowRunner.new(instagram_account).start(rule.flow, conversation, comment: comment)
      comment.update!(replied_privately: true)
    elsif rule.private_reply_template.present?
      text = MessageTemplate.render(rule.private_reply_template, comment.commenter_username)
      client.send_private_reply_to_comment(
        ig_user_id: instagram_account.ig_user_id,
        comment_id: comment.comment_id,
        text: text
      )
      comment.update!(replied_privately: true)
    end
  rescue Instagram::GraphClient::ApiError => e
    # Nao deixa uma falha parcial (ex: janela de private reply expirada) derrubar o job
    # inteiro e reprocessar do zero — o comment ja foi persistido, so a resposta que falhou.
    Rails.logger.error("Instagram automation dispatch failed for comment #{comment.comment_id}: #{e.message}")
  end

  # Regra travada num post especifico ganha da regra generica (qualquer post)
  # quando as duas baterem no mesmo comentario. So considera regras da MESMA
  # conta que recebeu o comentario (instagram_account_id nulo = regra antiga,
  # criada antes de existir mais de 1 conta — vale pra qualquer uma).
  def find_matching_rule(instagram_account, comment)
    candidates = instagram_account.account.automation_rules.active
      .where(instagram_account_id: [ instagram_account.id, nil ])
      .select { |r| r.matches?(comment.text) && r.matches_media?(comment.media_id) }
    candidates.find { |r| r.media_id.present? } || candidates.first
  end

  def find_or_create_contact(instagram_account, igsid)
    contact = instagram_account.account.contacts.find_by(igsid: igsid)
    return contact if contact.present?

    profile = fetch_contact_profile(instagram_account, igsid)
    instagram_account.account.contacts.create!(
      igsid: igsid,
      username: profile["username"],
      name: profile["name"],
      profile_picture_url: profile["profile_pic"]
    )
  end

  def fetch_contact_profile(instagram_account, igsid)
    # A conta comentando/mandando DM pra si mesma (teste do proprio dono) nao
    # aceita o campo "profile_pic" nesse endpoint — usa os dados que ja temos.
    if igsid == instagram_account.ig_user_id
      return { "username" => instagram_account.username, "name" => instagram_account.username, "profile_pic" => instagram_account.profile_picture_url }
    end

    client = Instagram::GraphClient.new(access_token: instagram_account.access_token)
    client.fetch_participant_profile(igsid: igsid, token: instagram_account.access_token)
  rescue Instagram::GraphClient::ApiError => e
    Rails.logger.error("Failed to fetch contact profile for #{igsid}: #{e.message}")
    {}
  end

  def fetch_commenter_profile(instagram_account, igsid)
    return {} if igsid.blank?

    fetch_contact_profile(instagram_account, igsid)
  end

  def fetch_media_info(instagram_account, media_id)
    return {} if media_id.blank?

    client = Instagram::GraphClient.new(access_token: instagram_account.access_token)
    client.fetch_media(media_id: media_id, token: instagram_account.access_token)
  rescue Instagram::GraphClient::ApiError => e
    Rails.logger.error("Failed to fetch media #{media_id}: #{e.message}")
    {}
  end
end
