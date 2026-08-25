class CreateFlowSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :flow_sessions do |t|
      t.references :flow, null: false, foreign_key: true
      t.references :conversation, null: false, foreign_key: true
      t.bigint :current_step_id
      t.integer :status, null: false, default: 0
      t.jsonb :data, null: false, default: {}

      t.timestamps
    end
    add_index :flow_sessions, :current_step_id
  end
end
