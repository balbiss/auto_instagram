class CreateAutomationRules < ActiveRecord::Migration[8.1]
  def change
    create_table :automation_rules do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name
      t.string :keywords, array: true, default: [], null: false
      t.text :public_reply_template
      t.text :private_reply_template
      t.boolean :active, null: false, default: true

      t.timestamps
    end
  end
end
