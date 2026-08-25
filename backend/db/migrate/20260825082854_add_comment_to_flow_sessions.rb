class AddCommentToFlowSessions < ActiveRecord::Migration[8.1]
  def change
    add_reference :flow_sessions, :comment, null: true, foreign_key: true
  end
end
