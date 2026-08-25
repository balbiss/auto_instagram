class AddInstagramAccountToConversations < ActiveRecord::Migration[8.1]
  def up
    add_reference :conversations, :instagram_account, null: true, foreign_key: true

    # Backfill: hoje cada account so tem 1 instagram_account (ou nenhum, se ja
    # desconectou depois de ja ter conversas) — nao da pra garantir NOT NULL.
    execute <<~SQL
      UPDATE conversations
      SET instagram_account_id = instagram_accounts.id
      FROM instagram_accounts
      WHERE instagram_accounts.account_id = conversations.account_id
    SQL
  end

  def down
    remove_reference :conversations, :instagram_account, foreign_key: true
  end
end
