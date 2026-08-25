class CreateFlowStepOptions < ActiveRecord::Migration[8.1]
  def change
    create_table :flow_step_options do |t|
      t.references :flow_step, null: false, foreign_key: true
      t.string :label, null: false
      t.integer :position, null: false
      t.bigint :next_step_id

      t.timestamps
    end
    add_index :flow_step_options, :next_step_id
  end
end
