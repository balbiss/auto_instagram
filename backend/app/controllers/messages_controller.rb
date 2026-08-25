class MessagesController < ApplicationController
  before_action :set_conversation
  before_action :set_instagram_account, only: [ :create ]

  MAX_ATTACHMENT_SIZE = 25.megabytes

  def index
    @conversation.update!(last_read_at: Time.current)
    render json: @conversation.messages.order(:sent_at, :created_at)
  end

  # Envio manual (corretor/atendente respondendo pelo painel) — texto ou anexo (imagem/video)
  def create
    file = params.dig(:message, :file)
    file.present? ? create_with_attachment(file) : create_text
  end

  private

  def create_text
    text = params.expect(message: [ :body ])[:body]
    client = Instagram::GraphClient.new(access_token: @instagram_account.access_token)
    response = client.send_message(
      ig_user_id: @instagram_account.ig_user_id,
      recipient_igsid: @conversation.contact.igsid,
      text: text
    )

    message = @conversation.messages.create!(
      source_id: response["message_id"],
      direction: :outbound,
      body: text,
      is_echo: false,
      sent_at: Time.current
    )

    render json: message, status: :created
  rescue Instagram::GraphClient::ApiError => e
    render json: { error: e.message }, status: :bad_gateway
  end

  def create_with_attachment(file)
    attachment_type = attachment_type_for(file.content_type)
    if attachment_type.nil?
      return render json: { error: "Formato nao suportado. Envie imagem ou video." }, status: :unprocessable_content
    end
    if file.size > MAX_ATTACHMENT_SIZE
      return render json: { error: "Arquivo maior que #{MAX_ATTACHMENT_SIZE / 1.megabyte}MB" }, status: :unprocessable_content
    end

    message = @conversation.messages.create!(direction: :outbound, is_echo: false, sent_at: Time.current)
    message.media.attach(file)

    public_url = Rails.application.routes.url_helpers.rails_blob_url(
      message.media,
      host: media_host,
      protocol: media_protocol
    )

    client = Instagram::GraphClient.new(access_token: @instagram_account.access_token)
    response = client.send_attachment(
      ig_user_id: @instagram_account.ig_user_id,
      recipient_igsid: @conversation.contact.igsid,
      url: public_url,
      type: attachment_type
    )

    message.update!(source_id: response["message_id"], attachment_url: public_url, attachment_type: attachment_type)
    render json: message, status: :created
  rescue Instagram::GraphClient::ApiError => e
    message&.destroy
    render json: { error: e.message }, status: :bad_gateway
  end

  def attachment_type_for(content_type)
    return "image" if content_type.start_with?("image/")
    return "video" if content_type.start_with?("video/")

    nil
  end

  def media_host
    URI.parse(ENV.fetch("API_HOST")).host
  end

  def media_protocol
    URI.parse(ENV.fetch("API_HOST")).scheme
  end

  def set_conversation
    @conversation = current_account.conversations.find(params[:conversation_id])
  end

  def set_instagram_account
    @instagram_account = @conversation.instagram_account
    render json: { error: "no_instagram_account_connected" }, status: :unprocessable_content if @instagram_account.nil?
  end
end
