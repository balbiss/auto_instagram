class AddMediaInfoToComments < ActiveRecord::Migration[8.1]
  def change
    add_column :comments, :media_permalink, :string
    add_column :comments, :media_type, :string
    add_column :comments, :media_thumbnail_url, :string
  end
end
