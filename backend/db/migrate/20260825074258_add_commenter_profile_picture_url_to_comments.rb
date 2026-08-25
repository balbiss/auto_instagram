class AddCommenterProfilePictureUrlToComments < ActiveRecord::Migration[8.1]
  def change
    add_column :comments, :commenter_profile_picture_url, :string
  end
end
