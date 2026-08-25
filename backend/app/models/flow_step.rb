class FlowStep < ApplicationRecord
  belongs_to :flow
  has_many :flow_step_options, -> { order(:position) }, dependent: :destroy

  accepts_nested_attributes_for :flow_step_options, allow_destroy: true

  enum :step_type, { quick_replies: 0, collect_text: 1 }

  validates :message_text, presence: true
  validates :field_name, presence: true, if: :collect_text?
  validate :quick_replies_have_options

  private

  def quick_replies_have_options
    return unless quick_replies?

    has_option = flow_step_options.any? { |o| !o.marked_for_destruction? }
    errors.add(:flow_step_options, "precisa ter pelo menos um botão") unless has_option
  end
end
