class InstagramOauthController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :callback ]

  SCOPES = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish".freeze

  # GET /instagram_oauth/authorize_url
  def authorize_url
    state = state_verifier.generate({ "account_id" => current_account.id, "ts" => Time.current.to_i }, expires_in: 10.minutes)

    params = {
      client_id: ENV.fetch("INSTAGRAM_APP_ID"),
      redirect_uri: callback_url,
      scope: SCOPES,
      response_type: "code",
      state: state
    }

    render json: { url: "https://www.instagram.com/oauth/authorize?#{params.to_query}" }
  end

  # GET /instagram_oauth/callback (redirect do navegador vindo da Meta, sem auth)
  def callback
    account_id = verify_state!(params[:state])

    client = Instagram::GraphClient.new
    token_data = client.exchange_code_for_token(code: params[:code], redirect_uri: callback_url)
    long_lived = client.exchange_for_long_lived_token(short_lived_token: token_data["access_token"])
    identity = client.fetch_ig_identity(token: long_lived["access_token"])

    account = Account.find(account_id)
    # Reconectar (mesma conta ja vinculada) sempre pode; conta NOVA respeita o
    # limite de Account::MAX_INSTAGRAM_ACCOUNTS por empresa.
    instagram_account = account.instagram_accounts.find_by(ig_user_id: identity["user_id"]) ||
      account.instagram_accounts.build

    instagram_account.update!(
      ig_user_id: identity["user_id"],
      username: identity["username"],
      profile_picture_url: identity["profile_picture_url"],
      access_token: long_lived["access_token"],
      token_expires_at: long_lived["expires_in"].to_i.seconds.from_now
    )

    redirect_to "#{ENV.fetch('FRONTEND_URL')}/conectar?status=success", allow_other_host: true
  rescue ActiveRecord::RecordInvalid
    redirect_to "#{ENV.fetch('FRONTEND_URL')}/conectar?status=limit", allow_other_host: true
  rescue ActiveSupport::MessageVerifier::InvalidSignature, KeyError, ActiveRecord::RecordNotFound, Instagram::GraphClient::ApiError => e
    Rails.logger.error("Instagram OAuth callback failed: #{e.class} #{e.message}")
    redirect_to "#{ENV.fetch('FRONTEND_URL')}/conectar?status=error", allow_other_host: true
  end

  private

  def callback_url
    "#{ENV.fetch('API_HOST')}/instagram_oauth/callback"
  end

  def state_verifier
    Rails.application.message_verifier(:instagram_oauth)
  end

  def verify_state!(raw_state)
    state_verifier.verify(raw_state).fetch("account_id")
  end
end
