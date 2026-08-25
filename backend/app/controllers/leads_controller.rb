class LeadsController < ApplicationController
  def index
    sessions = FlowSession.joins(:flow, :conversation)
      .where(flows: { account_id: current_account.id })
      .includes(:flow, :comment, conversation: :contact)
      .order(created_at: :desc)

    sessions = sessions.where("flow_sessions.created_at >= ?", params[:date_from]) if params[:date_from].present?
    sessions = sessions.where("flow_sessions.created_at <= ?", params[:date_to]) if params[:date_to].present?
    sessions = sessions.where(comment_id: params[:comment_id]) if params[:comment_id].present?
    if params[:instagram_account_id].present?
      sessions = sessions.where(conversations: { instagram_account_id: params[:instagram_account_id] })
    end

    render json: sessions.map { |s| lead_json(s) }
  end

  # Lista de posts/reels distintos que ja geraram capturas, para popular o filtro.
  def posts
    comments = Comment.joins(flow_sessions: :flow)
      .where(flows: { account_id: current_account.id })
      .where.not(media_id: nil)
      .select("DISTINCT ON (comments.media_id) comments.*")

    render json: comments.map { |c| { id: c.id, media_id: c.media_id, permalink: c.media_permalink, media_type: c.media_type, thumbnail_url: c.media_thumbnail_url, caption: c.media_caption } }
  end

  private

  def lead_json(session)
    contact = session.conversation.contact
    {
      id: session.id,
      status: session.status,
      data: session.data,
      created_at: session.created_at,
      conversation_id: session.conversation_id,
      contact: {
        igsid: contact.igsid,
        username: contact.username,
        name: contact.name,
        profile_picture_url: contact.profile_picture_url
      },
      flow: { id: session.flow.id, name: session.flow.name },
      comment: session.comment && {
        id: session.comment.id,
        media_permalink: session.comment.media_permalink,
        media_type: session.comment.media_type,
        media_thumbnail_url: session.comment.media_thumbnail_url
      }
    }
  end
end
