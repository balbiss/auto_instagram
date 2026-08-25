class FlowStepOption < ApplicationRecord
  belongs_to :flow_step

  validates :label, presence: true, length: { maximum: 20 }

  def next_step
    return nil if next_step_id.blank?

    FlowStep.find_by(id: next_step_id)
  end
end
