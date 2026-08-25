class InstagramAccount < ApplicationRecord
  belongs_to :account
  has_many :follower_snapshots, dependent: :destroy
  has_many :conversations, dependent: :nullify

  validates :ig_user_id, uniqueness: true, allow_nil: true
  validate :account_instagram_accounts_limit, on: :create

  def token_expired?
    token_expires_at.present? && token_expires_at.past?
  end

  # Delta oficial (so contagem, nao identifica quem seguiu — a API do Instagram
  # nao expoe lista de seguidores, so o total). nil enquanto nao ha snapshot de
  # antes de hoje pra comparar.
  def new_followers_today
    today_start = Time.zone.now.beginning_of_day
    latest = follower_snapshots.order(recorded_at: :desc).first&.count
    baseline = follower_snapshots.where("recorded_at < ?", today_start).order(recorded_at: :desc).first&.count
    return nil if latest.nil? || baseline.nil?

    latest - baseline
  end

  private

  def account_instagram_accounts_limit
    return if account.nil?

    if account.instagram_accounts.where.not(id: id).count >= Account::MAX_INSTAGRAM_ACCOUNTS
      errors.add(:base, "Limite de #{Account::MAX_INSTAGRAM_ACCOUNTS} contas do Instagram conectadas por empresa")
    end
  end
end
