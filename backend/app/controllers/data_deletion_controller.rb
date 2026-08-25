class DataDeletionController < ActionController::API
  # POST /data_deletion_callback — a Meta chama isso quando um usuario pede
  # exclusao de dados pelas configuracoes de apps dele (fora do nosso controle).
  # Formato exigido: https://developers.facebook.com/docs/development/create-an-app/data-deletion-callback
  def callback
    data = parse_signed_request(params[:signed_request])
    return render json: { error: "invalid signed_request" }, status: :bad_request unless data

    ig_user_id = data["user_id"]
    InstagramAccount.where(ig_user_id: ig_user_id).destroy_all

    confirmation_code = deletion_verifier.generate({ "ig_user_id" => ig_user_id, "ts" => Time.current.to_i })

    render json: {
      url: "#{ENV.fetch('API_HOST')}/data_deletion_status?id=#{CGI.escape(confirmation_code)}",
      confirmation_code: confirmation_code
    }
  end

  # POST /instagram_deauthorize — a Meta chama isso quando o usuario remove o
  # app pelas configuracoes dele, sem necessariamente pedir exclusao de dados.
  # Mesmo formato de signed_request do callback de exclusao.
  def deauthorize
    data = parse_signed_request(params[:signed_request])
    return render json: { error: "invalid signed_request" }, status: :bad_request unless data

    InstagramAccount.where(ig_user_id: data["user_id"]).destroy_all

    head :ok
  end

  # GET /data_deletion_status?id=... — pagina que a Meta/usuario pode conferir
  # o andamento do pedido (aqui a exclusao ja acontece de forma sincrona acima).
  def status
    verified = begin
      deletion_verifier.verify(params[:id])
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      nil
    end

    if verified
      render plain: "Solicitação de exclusão de dados concluída."
    else
      render plain: "Código de confirmação inválido.", status: :not_found
    end
  end

  private

  def parse_signed_request(signed_request)
    return nil if signed_request.blank?

    encoded_sig, payload = signed_request.split(".", 2)
    return nil if payload.nil?

    sig = url_decode64(encoded_sig)
    data = JSON.parse(url_decode64(payload))
    return nil unless data["algorithm"] == "HMAC-SHA256"

    expected_sig = OpenSSL::HMAC.digest("SHA256", ENV.fetch("INSTAGRAM_APP_SECRET"), payload)
    return nil unless ActiveSupport::SecurityUtils.secure_compare(sig, expected_sig)

    data
  rescue StandardError
    nil
  end

  def url_decode64(str)
    str += "=" * ((4 - str.length % 4) % 4)
    Base64.urlsafe_decode64(str)
  end

  def deletion_verifier
    Rails.application.message_verifier(:data_deletion)
  end
end
