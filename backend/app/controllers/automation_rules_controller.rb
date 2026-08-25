class AutomationRulesController < ApplicationController
  before_action :set_automation_rule, only: [ :update, :destroy ]

  def index
    rules = current_account.automation_rules.left_joins(:comments)
      .select("automation_rules.*, COUNT(comments.id) AS comments_count")
      .group("automation_rules.id")
      .order("automation_rules.created_at DESC")
    render json: rules.map { |r| rule_json(r) }
  end

  def create
    rule = current_account.automation_rules.new(automation_rule_params)
    if rule.save
      render json: rule_json(rule), status: :created
    else
      render json: { errors: rule.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @automation_rule.update(automation_rule_params)
      render json: rule_json(@automation_rule)
    else
      render json: { errors: @automation_rule.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @automation_rule.destroy!
    head :no_content
  end

  private

  def set_automation_rule
    @automation_rule = current_account.automation_rules.find(params[:id])
  end

  def automation_rule_params
    params.expect(automation_rule: [
      :name, :public_reply_template, :private_reply_template, :active, :flow_id, :instagram_account_id,
      :media_id, :media_permalink, :media_type, :media_thumbnail_url, :media_caption,
      :trigger_type, :referral_ref,
      { keywords: [] }
    ])
  end

  def rule_json(rule)
    count = rule.respond_to?(:comments_count) ? rule.comments_count.to_i : rule.comments.count
    rule.as_json.merge("comments_count" => count)
  end
end
