class FetchFollowersCountJob < ApplicationJob
  queue_as :default

  def perform
    InstagramAccount.where.not(access_token: nil).where.not(ig_user_id: nil).find_each do |account|
      next if account.token_expired?

      client = Instagram::GraphClient.new(access_token: account.access_token)
      response = client.fetch_followers_count(ig_user_id: account.ig_user_id, token: account.access_token)
      count = response["followers_count"]
      next if count.nil?

      account.follower_snapshots.create!(count: count, recorded_at: Time.zone.now)
    rescue Instagram::GraphClient::ApiError => e
      Rails.logger.error("FetchFollowersCountJob falhou pra InstagramAccount##{account.id}: #{e.message}")
    end
  end
end
