class CreateScheduledPosts < ActiveRecord::Migration[8.1]
  def change
    create_table :scheduled_posts do |t|
      t.references :account, null: false, foreign_key: true
      t.references :instagram_account, null: false, foreign_key: true
      t.text :caption
      t.integer :post_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.datetime :scheduled_for, null: false
      t.string :container_id
      t.string :ig_media_id
      t.text :error_message

      t.timestamps
    end
    add_index :scheduled_posts, [ :status, :scheduled_for ]
  end
end
