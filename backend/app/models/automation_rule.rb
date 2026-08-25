class AutomationRule < ApplicationRecord
  belongs_to :account
  belongs_to :instagram_account, optional: true
  belongs_to :flow, optional: true
  has_many :comments, dependent: :nullify

  enum :trigger_type, { comment: 0, referral: 1 }

  validates :name, presence: true
  validates :referral_ref, presence: true, if: :referral?
  validate :instagram_account_belongs_to_account

  scope :active, -> { where(active: true) }

  # Sem palavras-chave = dispara em qualquer comentario.
  # Com palavras-chave = precisa conter pelo menos uma (ignora acento/caixa).
  def matches?(comment_text)
    return false if comment_text.blank?
    return true if keywords.blank?

    normalized_text = normalize(comment_text)
    keywords.any? { |keyword| normalized_text.include?(normalize(keyword)) }
  end

  # Sem media_id = vale pra qualquer post/reel. Com media_id = só vale pra esse.
  def matches_media?(comment_media_id)
    media_id.blank? || media_id == comment_media_id
  end

  private

  def normalize(text)
    I18n.transliterate(text.to_s).downcase
  end

  def instagram_account_belongs_to_account
    return if instagram_account.nil?

    errors.add(:instagram_account, "não pertence a essa empresa") if instagram_account.account_id != account_id
  end
end
