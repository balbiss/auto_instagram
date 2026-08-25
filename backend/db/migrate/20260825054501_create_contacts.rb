class CreateContacts < ActiveRecord::Migration[8.1]
  def change
    create_table :contacts do |t|
      t.references :account, null: false, foreign_key: true
      t.string :igsid
      t.string :username
      t.string :name

      t.timestamps
    end
    add_index :contacts, :igsid, unique: true
  end
end
