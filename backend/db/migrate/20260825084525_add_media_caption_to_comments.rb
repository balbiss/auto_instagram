class AddMediaCaptionToComments < ActiveRecord::Migration[8.1]
  def change
    add_column :comments, :media_caption, :text
  end
end
