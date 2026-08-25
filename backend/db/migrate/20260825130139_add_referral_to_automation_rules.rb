class AddReferralToAutomationRules < ActiveRecord::Migration[8.1]
  def change
    add_column :automation_rules, :trigger_type, :integer, default: 0, null: false
    add_column :automation_rules, :referral_ref, :string
    add_index :automation_rules, [ :instagram_account_id, :referral_ref ], unique: true
  end
end
