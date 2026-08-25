class CreateComments < ActiveRecord::Migration[8.1]
  def change
    create_table :comments do |t|
      t.references :account, null: false, foreign_key: true
      t.string :comment_id
      t.string :media_id
      t.text :text
      t.string :commenter_igsid
      t.string :commenter_username
      t.references :automation_rule, null: true, foreign_key: true
      t.boolean :replied_publicly, null: false, default: false
      t.boolean :replied_privately, null: false, default: false

      t.timestamps
    end
    add_index :comments, :comment_id, unique: true
  end
end
