# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_25_130139) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "accounts", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "automation_rules", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.bigint "flow_id"
    t.bigint "instagram_account_id"
    t.string "keywords", default: [], null: false, array: true
    t.text "media_caption"
    t.string "media_id"
    t.string "media_permalink"
    t.string "media_thumbnail_url"
    t.string "media_type"
    t.string "name"
    t.text "private_reply_template"
    t.text "public_reply_template"
    t.string "referral_ref"
    t.integer "trigger_type", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_automation_rules_on_account_id"
    t.index ["flow_id"], name: "index_automation_rules_on_flow_id"
    t.index ["instagram_account_id", "referral_ref"], name: "idx_on_instagram_account_id_referral_ref_7810b0a611", unique: true
    t.index ["instagram_account_id"], name: "index_automation_rules_on_instagram_account_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "automation_rule_id"
    t.string "comment_id"
    t.string "commenter_igsid"
    t.string "commenter_profile_picture_url"
    t.string "commenter_username"
    t.datetime "created_at", null: false
    t.text "media_caption"
    t.string "media_id"
    t.string "media_permalink"
    t.string "media_thumbnail_url"
    t.string "media_type"
    t.boolean "replied_privately", default: false, null: false
    t.boolean "replied_publicly", default: false, null: false
    t.text "text"
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_comments_on_account_id"
    t.index ["automation_rule_id"], name: "index_comments_on_automation_rule_id"
    t.index ["comment_id"], name: "index_comments_on_comment_id", unique: true
  end

  create_table "contacts", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.datetime "created_at", null: false
    t.string "igsid"
    t.string "name"
    t.string "profile_picture_url"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["account_id"], name: "index_contacts_on_account_id"
    t.index ["igsid"], name: "index_contacts_on_igsid", unique: true
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "contact_id", null: false
    t.datetime "created_at", null: false
    t.bigint "instagram_account_id"
    t.datetime "last_read_at"
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_conversations_on_account_id"
    t.index ["contact_id"], name: "index_conversations_on_contact_id"
    t.index ["instagram_account_id"], name: "index_conversations_on_instagram_account_id"
  end

  create_table "flow_sessions", force: :cascade do |t|
    t.bigint "comment_id"
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.bigint "current_step_id"
    t.jsonb "data", default: {}, null: false
    t.bigint "flow_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["comment_id"], name: "index_flow_sessions_on_comment_id"
    t.index ["conversation_id"], name: "index_flow_sessions_on_conversation_id"
    t.index ["current_step_id"], name: "index_flow_sessions_on_current_step_id"
    t.index ["flow_id"], name: "index_flow_sessions_on_flow_id"
  end

  create_table "flow_step_options", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "flow_step_id", null: false
    t.string "label", null: false
    t.bigint "next_step_id"
    t.integer "position", null: false
    t.datetime "updated_at", null: false
    t.index ["flow_step_id"], name: "index_flow_step_options_on_flow_step_id"
    t.index ["next_step_id"], name: "index_flow_step_options_on_next_step_id"
  end

  create_table "flow_steps", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "field_name"
    t.bigint "flow_id", null: false
    t.text "message_text", null: false
    t.integer "position", null: false
    t.integer "step_type", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["flow_id"], name: "index_flow_steps_on_flow_id"
  end

  create_table "flows", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_flows_on_account_id"
  end

  create_table "follower_snapshots", force: :cascade do |t|
    t.integer "count", null: false
    t.datetime "created_at", null: false
    t.bigint "instagram_account_id", null: false
    t.datetime "recorded_at", null: false
    t.datetime "updated_at", null: false
    t.index ["instagram_account_id", "recorded_at"], name: "idx_on_instagram_account_id_recorded_at_13df463403"
    t.index ["instagram_account_id"], name: "index_follower_snapshots_on_instagram_account_id"
  end

  create_table "instagram_accounts", force: :cascade do |t|
    t.text "access_token"
    t.bigint "account_id", null: false
    t.datetime "created_at", null: false
    t.string "ig_user_id"
    t.string "profile_picture_url"
    t.datetime "token_expires_at"
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["account_id"], name: "index_instagram_accounts_on_account_id"
    t.index ["ig_user_id"], name: "index_instagram_accounts_on_ig_user_id", unique: true
  end

  create_table "messages", force: :cascade do |t|
    t.string "attachment_type"
    t.string "attachment_url"
    t.text "body"
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.integer "direction", null: false
    t.boolean "is_echo", default: false, null: false
    t.datetime "sent_at"
    t.string "source_id"
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["source_id"], name: "index_messages_on_source_id", unique: true
  end

  create_table "solid_queue_batch_executions", force: :cascade do |t|
    t.bigint "batch_id", null: false
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.index ["batch_id"], name: "index_solid_queue_batch_executions_on_batch_id"
    t.index ["job_id"], name: "index_solid_queue_batch_executions_on_job_id", unique: true
  end

  create_table "solid_queue_batches", force: :cascade do |t|
    t.string "active_job_batch_id"
    t.integer "completed_jobs", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "description"
    t.datetime "enqueued_at"
    t.datetime "failed_at"
    t.integer "failed_jobs", default: 0, null: false
    t.datetime "finished_at"
    t.text "metadata"
    t.text "on_failure"
    t.text "on_finish"
    t.text "on_success"
    t.integer "total_jobs", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_batch_id"], name: "index_solid_queue_batches_on_active_job_batch_id", unique: true
    t.index ["finished_at"], name: "index_solid_queue_batches_on_finished_at"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.bigint "batch_id"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["batch_id"], name: "index_solid_queue_jobs_on_batch_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_users_on_account_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "automation_rules", "accounts"
  add_foreign_key "automation_rules", "flows"
  add_foreign_key "automation_rules", "instagram_accounts"
  add_foreign_key "comments", "accounts"
  add_foreign_key "comments", "automation_rules"
  add_foreign_key "contacts", "accounts"
  add_foreign_key "conversations", "accounts"
  add_foreign_key "conversations", "contacts"
  add_foreign_key "conversations", "instagram_accounts"
  add_foreign_key "flow_sessions", "comments"
  add_foreign_key "flow_sessions", "conversations"
  add_foreign_key "flow_sessions", "flows"
  add_foreign_key "flow_step_options", "flow_steps"
  add_foreign_key "flow_steps", "flows"
  add_foreign_key "flows", "accounts"
  add_foreign_key "follower_snapshots", "instagram_accounts"
  add_foreign_key "instagram_accounts", "accounts"
  add_foreign_key "messages", "conversations"
  add_foreign_key "solid_queue_batch_executions", "solid_queue_batches", column: "batch_id", on_delete: :cascade
  add_foreign_key "solid_queue_batch_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "users", "accounts"
end
