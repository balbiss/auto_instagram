class ScheduledPost < ApplicationRecord
  belongs_to :account
  belongs_to :instagram_account
  has_one_attached :media

  enum :post_type, { feed: 0, reels: 1, story: 2 }
  enum :status, { scheduled: 0, publishing: 1, published: 2, failed: 3 }

  validates :scheduled_for, presence: true
  validate :media_attached
  validate :post_type_matches_media_kind
  validate :instagram_account_belongs_to_account

  # "IMAGE"/"VIDEO"/"REELS"/"STORIES" — o que a API do Instagram espera em
  # media_type ao criar o container.
  def graph_media_type
    if story?
      "STORIES"
    elsif reels?
      "REELS"
    else
      "IMAGE"
    end
  end

  def video?
    media.attached? && media.content_type.to_s.start_with?("video/")
  end

  private

  def media_attached
    errors.add(:media, "não pode ficar em branco") unless media.attached?
  end

  def post_type_matches_media_kind
    return unless media.attached?

    if video? && feed?
      errors.add(:post_type, "vídeo não pode ser publicado no feed — escolha Reels ou Story")
    elsif !video? && reels?
      errors.add(:post_type, "Reels precisa de um arquivo de vídeo")
    end
  end

  def instagram_account_belongs_to_account
    return if instagram_account.nil?

    errors.add(:instagram_account, "não pertence a essa empresa") if instagram_account.account_id != account_id
  end
end
