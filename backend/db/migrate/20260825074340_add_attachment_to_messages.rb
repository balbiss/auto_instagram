class AddAttachmentToMessages < ActiveRecord::Migration[8.1]
  def change
    add_column :messages, :attachment_url, :string
    add_column :messages, :attachment_type, :string
  end
end
