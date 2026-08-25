class CreateFollowerSnapshots < ActiveRecord::Migration[8.1]
  def change
    create_table :follower_snapshots do |t|
      t.references :instagram_account, null: false, foreign_key: true
      t.integer :count, null: false
      t.datetime :recorded_at, null: false

      t.timestamps
    end
    add_index :follower_snapshots, [ :instagram_account_id, :recorded_at ]
  end
end
