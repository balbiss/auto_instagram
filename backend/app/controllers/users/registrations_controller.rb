module Users
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    private

    def sign_up_params
      params.expect(user: [ :email, :password, :password_confirmation, :account_name ])
    end

    def build_resource(hash = {})
      account_name = hash.delete(:account_name)
      account = Account.create!(name: account_name.presence || hash[:email])
      super(hash)
      resource.account = account
    end

    def respond_with(resource, _opts = {})
      if resource.persisted?
        render json: { user: { id: resource.id, email: resource.email } }, status: :created
      else
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_content
      end
    end
  end
end
