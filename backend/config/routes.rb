Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "users/registrations", sessions: "users/sessions" }

  get "instagram_oauth/authorize_url", to: "instagram_oauth#authorize_url"
  get "instagram_oauth/callback", to: "instagram_oauth#callback"

  namespace :webhooks do
    get "instagram", to: "instagram#verify"
    post "instagram", to: "instagram#create"
  end

  post "data_deletion_callback", to: "data_deletion#callback"
  get "data_deletion_status", to: "data_deletion#status"
  post "instagram_deauthorize", to: "data_deletion#deauthorize"

  resources :automation_rules, only: [ :index, :create, :update, :destroy ]
  resources :flows, only: [ :index, :show, :create, :update, :destroy ]
  resources :instagram_accounts, only: [ :index, :destroy ]
  get "instagram_accounts/media", to: "instagram_accounts#media"
  resources :conversations, only: [ :index ] do
    resources :messages, only: [ :index, :create ]
  end
  get "dashboard/summary", to: "dashboard#summary"
  get "dashboard/activity", to: "dashboard#activity"
  get "leads", to: "leads#index"
  get "leads/posts", to: "leads#posts"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
