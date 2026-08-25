import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [{ title: "Política de Privacidade — Auto Instagram" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <BrandLogo className="h-20" />
        </div>

        <div className="card-surface p-8">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Voltar
          </Link>

          <h1 className="mt-4 text-2xl font-bold">Política de Privacidade</h1>
          <p className="mt-1 text-sm text-muted-foreground">Última atualização: 25 de agosto de 2026.</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold">1. Quem somos</h2>
              <p className="mt-1 text-muted-foreground">
                O Auto Instagram é um serviço de automação de comentários e mensagens diretas para contas
                Instagram Business/Creator, operado pela InoovaWeb. Esta política explica quais dados
                coletamos quando você conecta sua conta do Instagram e como esses dados são usados.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">2. Dados que coletamos</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Informações públicas do perfil da conta conectada (nome de usuário, foto de perfil, ID da conta).</li>
                <li>Conteúdo de comentários e mensagens diretas trocados através das automações configuradas por você.</li>
                <li>Dados enviados voluntariamente por quem interage com seus fluxos automatizados (ex.: e-mail, telefone), quando você configura essa coleta.</li>
                <li>Tokens de acesso à API do Instagram, necessários para operar as automações em seu nome.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold">3. Como usamos esses dados</h2>
              <p className="mt-1 text-muted-foreground">
                Os dados são usados exclusivamente para operar as automações que você mesmo configura no
                painel: responder comentários, enviar mensagens diretas, conduzir fluxos de conversa e
                exibir o histórico de leads coletados. Não vendemos nem compartilhamos esses dados com
                terceiros para fins de publicidade.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">4. Compartilhamento com terceiros</h2>
              <p className="mt-1 text-muted-foreground">
                O único terceiro envolvido é a Meta Platforms, Inc. (Instagram), cuja API oficial é usada
                para enviar e receber comentários e mensagens em seu nome, conforme as permissões que você
                autoriza durante a conexão da conta.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">5. Retenção e exclusão de dados</h2>
              <p className="mt-1 text-muted-foreground">
                Os dados são mantidos enquanto sua conta estiver ativa no Auto Instagram. Você pode
                desconectar sua conta do Instagram a qualquer momento pelo painel, o que remove os tokens
                de acesso armazenados. Você também pode solicitar a exclusão dos seus dados diretamente
                pelas configurações "Apps e Sites" da sua conta Meta — isso aciona automaticamente nosso
                processo de exclusão.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">6. Contato</h2>
              <p className="mt-1 text-muted-foreground">
                Dúvidas sobre esta política podem ser enviadas para{" "}
                <a href="mailto:contato@inoovaweb.com.br" className="text-brand hover:underline">
                  contato@inoovaweb.com.br
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
