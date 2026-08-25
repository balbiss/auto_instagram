import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [{ title: "Termos de Serviço — Auto Instagram" }],
  }),
  component: TermsOfService,
});

function TermsOfService() {
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

          <h1 className="mt-4 text-2xl font-bold">Termos de Serviço</h1>
          <p className="mt-1 text-sm text-muted-foreground">Última atualização: 25 de agosto de 2026.</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="font-semibold">1. Aceite dos termos</h2>
              <p className="mt-1 text-muted-foreground">
                Ao criar uma conta e conectar seu Instagram ao Auto Instagram, você concorda com estes
                termos e com nossa{" "}
                <Link to="/privacidade" className="text-brand hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="font-semibold">2. O que o serviço faz</h2>
              <p className="mt-1 text-muted-foreground">
                O Auto Instagram automatiza respostas a comentários e mensagens diretas na sua conta
                Instagram Business/Creator, com base em regras e fluxos que você mesmo configura. O
                serviço age em seu nome apenas dentro dos limites das permissões que você autoriza através
                do login oficial do Instagram.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">3. Responsabilidades do usuário</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Manter o conteúdo das automações em conformidade com as políticas da Meta/Instagram.</li>
                <li>Não usar o serviço para envio de spam, mensagens não solicitadas em massa, ou conteúdo enganoso.</li>
                <li>Garantir que possui autorização para conectar a conta Instagram utilizada.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold">4. Limitações da API do Instagram</h2>
              <p className="mt-1 text-muted-foreground">
                O serviço opera dentro das regras e limites técnicos impostos pela API oficial da Meta
                (janelas de resposta, limites de mensagens, permissões concedidas). Mudanças feitas pela
                Meta na API podem afetar a disponibilidade de funcionalidades sem aviso prévio de nossa
                parte.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">5. Cancelamento</h2>
              <p className="mt-1 text-muted-foreground">
                Você pode desconectar sua conta do Instagram e encerrar o uso do serviço a qualquer
                momento pelo painel, sem multa ou aviso prévio.
              </p>
            </section>

            <section>
              <h2 className="font-semibold">6. Contato</h2>
              <p className="mt-1 text-muted-foreground">
                Dúvidas sobre estes termos podem ser enviadas para{" "}
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
