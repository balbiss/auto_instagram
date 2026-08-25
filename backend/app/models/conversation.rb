class Conversation < ApplicationRecord
  belongs_to :account
  belongs_to :contact
  belongs_to :instagram_account, optional: true
  has_many :messages, dependent: :destroy
  has_many :flow_sessions, dependent: :destroy

  def active_flow_session
    flow_sessions.active.order(created_at: :desc).first
  end
end
