class InstagramAccountsController < ApplicationController
  def index
    render json: current_account.instagram_accounts.map { |a| account_json(a) }
  end

  def destroy
    current_account.instagram_accounts.find(params[:id]).destroy!
    head :no_content
  end

  # Posts/reels recentes — de uma conta especifica (params[:instagram_account_id])
  # ou de TODAS as conectadas (ate 2 por empresa) quando nao filtrado, pra
  # escolher um post especifico ao criar uma automacao (em vez de "qualquer post").
  def media
    accounts = if params[:instagram_account_id].present?
      current_account.instagram_accounts.where(id: params[:instagram_account_id])
    else
      current_account.instagram_accounts
    end
    return render json: { error: "no_instagram_account_connected" }, status: :unprocessable_content if accounts.empty?

    client = Instagram::GraphClient.new
    items = accounts.flat_map do |account|
      response = client.fetch_recent_media(ig_user_id: account.ig_user_id, token: account.access_token)
      (response["data"] || []).map do |m|
        {
          id: m["id"],
          permalink: m["permalink"],
          media_type: m["media_type"],
          thumbnail_url: m["thumbnail_url"] || m["media_url"],
          caption: m["caption"]
        }
      end
    rescue Instagram::GraphClient::ApiError => e
      Rails.logger.error("Failed to fetch media for InstagramAccount##{account.id}: #{e.message}")
      []
    end
    render json: items
  end

  private

  # access_token nunca deve sair do backend para o cliente.
  def account_json(account)
    account.as_json(except: [ :access_token ])
  end
end
