class Flow < ApplicationRecord
  belongs_to :account
  has_many :flow_steps, -> { order(:position) }, dependent: :destroy
  has_many :flow_sessions, dependent: :destroy

  accepts_nested_attributes_for :flow_steps, allow_destroy: true

  validates :name, presence: true
end
