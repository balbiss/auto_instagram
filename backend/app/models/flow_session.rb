class FlowSession < ApplicationRecord
  belongs_to :flow
  belongs_to :conversation
  belongs_to :comment, optional: true

  enum :status, { active: 0, completed: 1, abandoned: 2 }

  def current_step
    return nil if current_step_id.blank?

    FlowStep.find_by(id: current_step_id)
  end
end
