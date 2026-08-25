class ApplicationController < ActionController::API
  include ActionController::MimeResponds

  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "not_found" }, status: :not_found
  end

  private

  def current_account
    current_user&.account
  end
end
