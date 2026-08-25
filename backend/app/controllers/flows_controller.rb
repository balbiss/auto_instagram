class FlowsController < ApplicationController
  before_action :set_flow, only: [ :show, :update, :destroy ]

  def index
    flows = current_account.flows.includes(flow_steps: :flow_step_options).order(created_at: :desc)
    render json: flows.map { |f| flow_json(f) }
  end

  def show
    render json: flow_json(@flow)
  end

  def create
    flow = current_account.flows.new(flow_params)
    if flow.save
      render json: flow_json(flow), status: :created
    else
      render json: { errors: nested_errors(flow) }, status: :unprocessable_content
    end
  end

  def update
    if @flow.update(flow_params)
      render json: flow_json(@flow)
    else
      render json: { errors: nested_errors(@flow) }, status: :unprocessable_content
    end
  end

  def destroy
    @flow.destroy!
    head :no_content
  end

  private

  def set_flow
    @flow = current_account.flows.find(params[:id])
  end

  def flow_params
    params.expect(flow: [
      :name, :active,
      flow_steps_attributes: [
        [ :id, :position, :message_text, :step_type, :field_name, :_destroy,
          flow_step_options_attributes: [ [ :id, :label, :position, :next_step_id, :_destroy ] ] ]
      ]
    ])
  end

  # accepts_nested_attributes_for so poe um erro generico ("Flow step is
  # invalid") no pai — junta as mensagens de verdade dos passos filhos tambem.
  def nested_errors(flow)
    step_errors = flow.flow_steps.flat_map do |step|
      step.errors.full_messages.map { |m| "Passo #{step.position}: #{m}" }
    end
    (flow.errors.full_messages + step_errors).uniq
  end

  def flow_json(flow)
    flow.as_json.merge(
      "flow_steps" => flow.flow_steps.map do |step|
        step.as_json.merge("flow_step_options" => step.flow_step_options.map(&:as_json))
      end
    )
  end
end
