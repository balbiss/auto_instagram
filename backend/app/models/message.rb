class Message < ApplicationRecord
  belongs_to :conversation
  has_one_attached :media

  enum :direction, { inbound: 0, outbound: 1 }

  validates :source_id, uniqueness: true, allow_nil: true
end
