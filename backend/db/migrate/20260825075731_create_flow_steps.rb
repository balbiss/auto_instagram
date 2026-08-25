class CreateFlowSteps < ActiveRecord::Migration[8.1]
  def change
    create_table :flow_steps do |t|
      t.references :flow, null: false, foreign_key: true
      t.integer :position, null: false
      t.text :message_text, null: false
      t.integer :step_type, null: false, default: 0
      t.string :field_name

      t.timestamps
    end
  end
end
