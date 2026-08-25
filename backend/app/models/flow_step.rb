class FlowStep < ApplicationRecord
  belongs_to :flow
  has_many :flow_step_options, -> { order(:position) }, dependent: :destroy

  accepts_nested_attributes_for :flow_step_options, allow_destroy: true

  enum :step_type, { quick_replies: 0, collect_text: 1 }

  validates :message_text, presence: true
  validates :field_name, presence: true, if: :collect_text?
end
