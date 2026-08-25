class ScheduledPostsController < ApplicationController
  before_action :set_scheduled_post, only: [ :update, :destroy ]

  def index
    render json: current_account.scheduled_posts.order(scheduled_for: :desc).map { |p| post_json(p) }
  end

  def create
    post = current_account.scheduled_posts.new(scheduled_post_params)
    post.media.attach(params.dig(:scheduled_post, :media)) if params.dig(:scheduled_post, :media).present?

    if post.save
      render json: post_json(post), status: :created
    else
      render json: { errors: post.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    return render json: { error: "Só é possível editar posts ainda agendados" }, status: :unprocessable_content unless @scheduled_post.scheduled?

    if @scheduled_post.update(scheduled_post_params)
      render json: post_json(@scheduled_post)
    else
      render json: { errors: @scheduled_post.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @scheduled_post.destroy!
    head :no_content
  end

  private

  def set_scheduled_post
    @scheduled_post = current_account.scheduled_posts.find(params[:id])
  end

  def scheduled_post_params
    params.expect(scheduled_post: [ :instagram_account_id, :caption, :post_type, :scheduled_for ])
  end

  def post_json(post)
    post.as_json.merge(
      "media_url" => post.media.attached? ? url_for(post.media) : nil,
      "media_content_type" => post.media.attached? ? post.media.content_type : nil
    )
  end
end
