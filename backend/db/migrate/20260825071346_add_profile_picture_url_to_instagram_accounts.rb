class AddProfilePictureUrlToInstagramAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :instagram_accounts, :profile_picture_url, :string
  end
end
