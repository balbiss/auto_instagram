class DashboardController < ApplicationController
  def summary
    today = Time.zone.now.all_day
    deltas = current_account.instagram_accounts.map(&:new_followers_today).compact

    render json: {
      comments_replied_today: current_account.comments.where(created_at: today).where(replied_publicly: true).count,
      dms_sent_today: Message.joins(:conversation)
        .where(conversations: { account_id: current_account.id })
        .where(direction: :outbound, created_at: today)
        .count,
      connected_accounts: current_account.instagram_accounts.count,
      posts_scheduled: 0,
      new_followers_today: deltas.any? ? deltas.sum : nil
    }
  end

  # Feed unico combinando comentarios e mensagens recentes, para a tela inicial.
  def activity
    comments = current_account.comments.order(created_at: :desc).limit(10).map do |c|
      {
        type: "comment",
        who: c.commenter_username || c.commenter_igsid,
        avatar_url: c.commenter_profile_picture_url,
        text: c.text,
        replied: c.replied_publicly || c.replied_privately,
        media_permalink: c.media_permalink,
        media_type: c.media_type,
        media_thumbnail_url: c.media_thumbnail_url,
        at: c.created_at
      }
    end

    messages = Message.joins(conversation: :contact)
      .where(conversations: { account_id: current_account.id }, direction: :inbound)
      .order(created_at: :desc)
      .limit(10)
      .includes(conversation: :contact)
      .map do |m|
        {
          type: "message",
          who: m.conversation.contact.username || m.conversation.contact.igsid,
          avatar_url: m.conversation.contact.profile_picture_url,
          text: m.body,
          replied: nil,
          media_permalink: nil,
          media_type: nil,
          media_thumbnail_url: nil,
          at: m.created_at
        }
      end

    render json: (comments + messages).sort_by { |a| a[:at] }.reverse.first(10)
  end
end
