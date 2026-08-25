# Publica de fato um ScheduledPost na API oficial do Instagram: cria o
# container, espera processar, publica. Qualquer erro marca o post como
# failed em vez de derrubar o job (mesmo padrao do webhook job).
class PublishScheduledPostJob < ApplicationJob
  queue_as :default

  class ContainerNotReadyError < StandardError; end

  MAX_STATUS_CHECKS = 30
  STATUS_CHECK_INTERVAL = 2.seconds

  def perform(scheduled_post_id)
    post = ScheduledPost.find_by(id: scheduled_post_id)
    return if post.nil? || !post.scheduled?

    post.update!(status: :publishing)

    instagram_account = post.instagram_account
    client = Instagram::GraphClient.new(access_token: instagram_account.access_token)

    media_url = Rails.application.routes.url_helpers.rails_blob_url(
      post.media,
      host: media_host,
      protocol: media_protocol
    )

    container = client.create_media_container(
      ig_user_id: instagram_account.ig_user_id,
      token: instagram_account.access_token,
      media_url: media_url,
      media_type: post.graph_media_type,
      video: post.video?,
      caption: post.caption
    )
    container_id = container["id"]
    post.update!(container_id: container_id)

    wait_until_ready!(client, container_id, instagram_account.access_token)

    published = client.publish_container(
      ig_user_id: instagram_account.ig_user_id,
      token: instagram_account.access_token,
      creation_id: container_id
    )
    post.update!(status: :published, ig_media_id: published["id"])
  rescue Instagram::GraphClient::ApiError, ContainerNotReadyError => e
    post&.update!(status: :failed, error_message: e.message)
    Rails.logger.error("PublishScheduledPostJob falhou pro ScheduledPost##{scheduled_post_id}: #{e.message}")
  end

  private

  def wait_until_ready!(client, container_id, token)
    MAX_STATUS_CHECKS.times do
      status = client.container_status(container_id: container_id, token: token)
      case status["status_code"]
      when "FINISHED"
        return
      when "ERROR", "EXPIRED"
        raise ContainerNotReadyError, "Container #{status['status_code']}: #{status['status']}"
      end
      sleep STATUS_CHECK_INTERVAL
    end
    raise ContainerNotReadyError, "Container não processou a tempo (timeout)"
  end

  def media_host
    URI.parse(ENV.fetch("API_HOST")).host
  end

  def media_protocol
    URI.parse(ENV.fetch("API_HOST")).scheme
  end
end
