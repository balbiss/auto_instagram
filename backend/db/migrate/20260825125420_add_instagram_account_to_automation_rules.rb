class AddInstagramAccountToAutomationRules < ActiveRecord::Migration[8.1]
  def up
    add_reference :automation_rules, :instagram_account, null: true, foreign_key: true

    # Backfill so quando a empresa tem exatamente 1 conta conectada — com 2,
    # fica ambiguo a qual pertence uma regra criada antes dessa feature existir,
    # entao fica null (o job trata null como "vale pra qualquer conta").
    execute <<~SQL
      UPDATE automation_rules
      SET instagram_account_id = sub.only_account_id
      FROM (
        SELECT account_id, MIN(id) AS only_account_id
        FROM instagram_accounts
        GROUP BY account_id
        HAVING COUNT(*) = 1
      ) sub
      WHERE automation_rules.account_id = sub.account_id
    SQL
  end

  def down
    remove_reference :automation_rules, :instagram_account, foreign_key: true
  end
end
