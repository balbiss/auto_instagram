class AddMediaScopeToAutomationRules < ActiveRecord::Migration[8.1]
  def change
    add_column :automation_rules, :media_id, :string
    add_column :automation_rules, :media_permalink, :string
    add_column :automation_rules, :media_type, :string
    add_column :automation_rules, :media_thumbnail_url, :string
    add_column :automation_rules, :media_caption, :text
  end
end
