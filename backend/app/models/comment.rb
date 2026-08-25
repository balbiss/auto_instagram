class Comment < ApplicationRecord
  belongs_to :account
  belongs_to :automation_rule, optional: true
  has_many :flow_sessions, dependent: :nullify

  validates :comment_id, presence: true, uniqueness: true
end
