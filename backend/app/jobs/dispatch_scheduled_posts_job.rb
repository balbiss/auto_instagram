# Roda periodicamente (config/recurring.yml) so pra achar o que ja passou do
# horario e enfileirar a publicacao de cada um — mantem o job pesado separado.
class DispatchScheduledPostsJob < ApplicationJob
  queue_as :default

  def perform
    ScheduledPost.scheduled.where("scheduled_for <= ?", Time.current).find_each do |post|
      PublishScheduledPostJob.perform_later(post.id)
    end
  end
end
