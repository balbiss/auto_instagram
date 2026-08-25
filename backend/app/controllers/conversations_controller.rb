class ConversationsController < ApplicationController
  def index
    conversations = current_account.conversations
      .includes(:contact, :messages)
      .order(updated_at: :desc)

    render json: conversations.map { |c| conversation_json(c) }
  end

  private

  def conversation_json(conversation)
    last_message = conversation.messages.order(sent_at: :desc, created_at: :desc).first
    unread_scope = conversation.messages.inbound
    unread_scope = unread_scope.where("messages.created_at > ?", conversation.last_read_at) if conversation.last_read_at
    unread_count = unread_scope.count

    {
      id: conversation.id,
      contact: {
        id: conversation.contact.id,
        igsid: conversation.contact.igsid,
        username: conversation.contact.username,
        name: conversation.contact.name,
        profile_picture_url: conversation.contact.profile_picture_url
      },
      last_message: last_message && {
        body: last_message.body,
        direction: last_message.direction,
        sent_at: last_message.sent_at
      },
      unread_count: unread_count,
      updated_at: conversation.updated_at
    }
  end
end
