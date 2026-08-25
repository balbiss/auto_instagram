class CreateFlows < ActiveRecord::Migration[8.1]
  def change
    create_table :flows do |t|
      t.references :account, null: false, foreign_key: true
      t.string :name, null: false
      t.boolean :active, null: false, default: true

      t.timestamps
    end
  end
end
