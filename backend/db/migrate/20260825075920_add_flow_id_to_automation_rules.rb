class AddFlowIdToAutomationRules < ActiveRecord::Migration[8.1]
  def change
    add_reference :automation_rules, :flow, null: true, foreign_key: true
  end
end
