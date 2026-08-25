class CreateInstagramAccounts < ActiveRecord::Migration[8.1]
  def change
    create_table :instagram_accounts do |t|
      t.references :account, null: false, foreign_key: true
      t.string :ig_user_id
      t.string :username
      t.text :access_token
      t.datetime :token_expires_at

      t.timestamps
    end
    add_index :instagram_accounts, :ig_user_id, unique: true
  end
end
