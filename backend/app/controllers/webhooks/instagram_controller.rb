module Webhooks
  class InstagramController < ActionController::API
    skip_before_action :authenticate_user!, raise: false

    # GET /webhooks/instagram — handshake exigido pela Meta
    def verify
      if params["hub.verify_token"] == ENV.fetch("INSTAGRAM_WEBHOOK_VERIFY_TOKEN")
        render plain: params["hub.challenge"]
      else
        head :forbidden
      end
    end

    # POST /webhooks/instagram — responde rapido, processa async
    def create
      ProcessInstagramWebhookJob.perform_later(params.to_unsafe_h.to_json)
      head :ok
    end
  end
end
