class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.references :conversation, null: false, foreign_key: true
      t.string :source_id
      t.integer :direction, null: false
      t.text :body
      t.boolean :is_echo, null: false, default: false
      t.datetime :sent_at

      t.timestamps
    end
    add_index :messages, :source_id, unique: true
  end
end
