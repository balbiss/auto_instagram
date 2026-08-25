module Users
  class SessionsController < Devise::SessionsController
    respond_to :json

    private

    def respond_with(resource, _opts = {})
      render json: { user: { id: resource.id, email: resource.email, account_id: resource.account_id } }, status: :ok
    end

    def respond_to_on_destroy
      head :no_content
    end
  end
end
