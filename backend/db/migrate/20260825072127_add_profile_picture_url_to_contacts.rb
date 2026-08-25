class AddProfilePictureUrlToContacts < ActiveRecord::Migration[8.1]
  def change
    add_column :contacts, :profile_picture_url, :string
  end
end
