module Instagram
  # Client unico para toda chamada a API oficial do Instagram (OAuth + Graph API).
  # Ver plano em .claude/plans — armadilhas documentadas (ASID vs IGSID, etc) vieram
  # de uma integracao já validada em produção em outro projeto (VisitaIA).
  class GraphClient
    GRAPH_VERSION = "v21.0".freeze

    class ApiError < StandardError; end

    def initialize(access_token: nil)
      @access_token = access_token
    end

    # --- OAuth: troca o "code" do redirect por um token de curta duração ---
    def exchange_code_for_token(code:, redirect_uri:)
      response = oauth_connection.post("access_token") do |req|
        req.body = {
          client_id: ENV.fetch("INSTAGRAM_APP_ID"),
          client_secret: ENV.fetch("INSTAGRAM_APP_SECRET"),
          grant_type: "authorization_code",
          redirect_uri: redirect_uri,
          code: code
        }
      end
      parse(response)
    end

    # --- Troca o token de curta duração por um de longa duração (~60 dias) ---
    def exchange_for_long_lived_token(short_lived_token:)
      response = graph_connection.get("access_token") do |req|
        req.params["grant_type"] = "ig_exchange_token"
        req.params["client_secret"] = ENV.fetch("INSTAGRAM_APP_SECRET")
        req.params["access_token"] = short_lived_token
      end
      parse(response)
    end

    # IMPORTANTE: o "user_id" devolvido na troca inicial de token e um ASID
    # (escopo app+usuario). O IGSID de verdade (usado pelo webhook e pelas
    # mensagens) só vem daqui.
    def fetch_ig_identity(token:)
      response = graph_connection.get("me") do |req|
        req.params["fields"] = "user_id,username,profile_picture_url"
        req.params["access_token"] = token
      end
      parse(response)
    end

    # Perfil de quem esta do outro lado da conversa (contato/lead) — nome, username
    # e foto. Precisa do token da CONTA CONECTADA (nao existe token proprio do lead).
    def fetch_participant_profile(igsid:, token:)
      response = graph_connection.get(igsid.to_s) do |req|
        req.params["fields"] = "name,username,profile_pic"
        req.params["access_token"] = token
      end
      parse(response)
    end

    # Dados do post/reel onde um comentario foi feito — usado pra mostrar
    # "comentou no seu Reel X" em vez de so o texto do comentario.
    def fetch_media(media_id:, token:)
      response = graph_connection.get(media_id.to_s) do |req|
        req.params["fields"] = "permalink,media_type,thumbnail_url,media_url,caption"
        req.params["access_token"] = token
      end
      parse(response)
    end

    # Posts/reels recentes da conta conectada — usado pra deixar o usuario
    # escolher um post especifico ANTES de alguem comentar nele.
    def fetch_recent_media(ig_user_id:, token:, limit: 25)
      response = graph_connection.get("#{ig_user_id}/media") do |req|
        req.params["fields"] = "id,permalink,media_type,thumbnail_url,media_url,caption,timestamp"
        req.params["limit"] = limit
        req.params["access_token"] = token
      end
      parse(response)
    end

    # Total de seguidores da conta conectada (a API oficial nao expoe QUEM
    # seguiu, so esse agregado — ver FollowerSnapshot/InstagramAccount#new_followers_today).
    def fetch_followers_count(ig_user_id:, token:)
      response = graph_connection.get(ig_user_id.to_s) do |req|
        req.params["fields"] = "followers_count"
        req.params["access_token"] = token
      end
      parse(response)
    end

    # --- DM com botoes de resposta rapida (estilo ManyChat) ---
    def send_message_with_quick_replies(ig_user_id:, recipient_igsid:, text:, quick_replies:)
      post_authenticated("#{ig_user_id}/messages", {
        recipient: { id: recipient_igsid },
        message: {
          text: text,
          quick_replies: quick_replies.map { |qr| { content_type: "text", title: qr[:title], payload: qr[:payload] } }
        }
      })
    end

    # --- Envio de DM ---
    def send_message(ig_user_id:, recipient_igsid:, text:)
      post_authenticated("#{ig_user_id}/messages", {
        recipient: { id: recipient_igsid },
        message: { text: text }
      })
    end

    # --- Envio de imagem/video por URL publica (a API do Instagram nao aceita upload binario) ---
    def send_attachment(ig_user_id:, recipient_igsid:, url:, type:)
      post_authenticated("#{ig_user_id}/messages", {
        recipient: { id: recipient_igsid },
        message: { attachment: { type: type, payload: { url: url } } }
      })
    end

    # --- DM privada em resposta a um comentario (janela de tempo limitada pela Meta) ---
    def send_private_reply_to_comment(ig_user_id:, comment_id:, text:)
      post_authenticated("#{ig_user_id}/messages", {
        recipient: { comment_id: comment_id },
        message: { text: text }
      })
    end

    # --- Resposta publica a um comentario ---
    def reply_to_comment(comment_id:, text:)
      post_authenticated("#{comment_id}/replies", { message: text })
    end

    def send_presence_update(ig_user_id:, recipient_igsid:, presence:)
      post_authenticated("#{ig_user_id}/messages", {
        recipient: { id: recipient_igsid },
        sender_action: presence
      })
    end

    # --- Publicacao de conteudo (feed/reels/stories) ---
    # Fluxo oficial em 2 passos: cria um "container" com a URL publica da midia,
    # espera processar (container_status), depois publica de fato.
    # media_type: "IMAGE" | "VIDEO" | "REELS" | "STORIES" (STORIES aceita tanto
    # image_url quanto video_url, por isso o video: precisa vir explicito).
    def create_media_container(ig_user_id:, token:, media_url:, media_type:, video:, caption: nil)
      body = { media_type: media_type, access_token: token }
      body[video ? :video_url : :image_url] = media_url
      body[:caption] = caption if caption.present? && media_type != "STORIES"

      response = graph_connection.post("#{ig_user_id}/media") do |req|
        req.headers["Content-Type"] = "application/json"
        req.body = body.to_json
      end
      parse(response)
    end

    def container_status(container_id:, token:)
      response = graph_connection.get(container_id.to_s) do |req|
        req.params["fields"] = "status_code,status"
        req.params["access_token"] = token
      end
      parse(response)
    end

    def publish_container(ig_user_id:, token:, creation_id:)
      post_authenticated("#{ig_user_id}/media_publish", { creation_id: creation_id, access_token: token })
    end

    private

    def post_authenticated(path, body)
      response = graph_connection.post(path) do |req|
        req.headers["Authorization"] = "Bearer #{@access_token}"
        req.headers["Content-Type"] = "application/json"
        req.body = body.to_json
      end
      parse(response)
    end

    def parse(response)
      body = response.body.is_a?(String) ? JSON.parse(response.body) : response.body
      raise ApiError, "Instagram API error #{response.status}: #{body}" unless response.success?

      body
    end

    def oauth_connection
      @oauth_connection ||= Faraday.new(url: "https://api.instagram.com/oauth/") do |f|
        f.request :url_encoded
        f.adapter Faraday.default_adapter
      end
    end

    def graph_connection
      @graph_connection ||= Faraday.new(url: "https://graph.instagram.com/#{GRAPH_VERSION}/") do |f|
        f.adapter Faraday.default_adapter
      end
    end
  end
end
