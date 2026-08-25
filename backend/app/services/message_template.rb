# Substitui a variavel de nome/usuario nos textos de automacao/fluxo.
# Aceita tanto a sintaxe documentada ({{nome}}) quanto a que o cliente ja usava
# na propria automacao em producao ([@usuário]) — os dois viram @username.
module MessageTemplate
  VARIABLE_PATTERN = /\[@?usu[áa]rio\]|\{\{\s*(?:nome|usuario|usuário|username)\s*\}\}/i

  def self.render(text, username)
    return text if text.blank?

    display = username.present? ? "@#{username}" : ""
    text.gsub(VARIABLE_PATTERN, display)
  end
end
