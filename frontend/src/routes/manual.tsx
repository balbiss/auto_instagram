import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Plug,
  Zap,
  Workflow,
  Database,
  LayoutDashboard,
  Settings,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [{ title: "Manual — Auto Instagram" }],
  }),
  component: Manual,
});

const sections = [
  { id: "conectar", label: "Conectar sua conta", icon: Plug },
  { id: "automacoes", label: "Automações de comentário", icon: Zap },
  { id: "referral", label: "Automação por link (referral)", icon: Zap },
  { id: "fluxos", label: "Fluxos (botões e coleta de dados)", icon: Workflow },
  { id: "dados", label: "Dados coletados", icon: Database },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "configuracoes", label: "Configurações", icon: Settings },
  { id: "agendamento", label: "Agendamento", icon: CalendarClock },
  { id: "limitacoes", label: "Limitações da API do Instagram", icon: AlertTriangle },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card-surface scroll-mt-20 p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Manual() {
  return (
    <AppShell
      title="Manual"
      description="Como funciona cada parte do Auto Instagram, passo a passo."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <nav className="card-surface h-fit space-y-1 p-3 lg:sticky lg:top-20 lg:col-span-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <s.icon className="size-4 shrink-0 text-brand" />
              {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-4 lg:col-span-3">
          <Section id="conectar" title="1. Conectar sua conta do Instagram">
            <p>
              Vai em <strong>Conectar conta</strong> no menu e clica em <strong>"Conectar Instagram"</strong>.
              Você é redirecionado pro Instagram, loga com a conta e autoriza as permissões — a senha nunca
              passa pelo Auto Instagram, é tudo direto no domínio oficial do Instagram.
            </p>
            <p>
              <strong>Requisitos da conta:</strong> precisa ser uma conta Instagram <strong>Business ou
              Creator</strong> (não funciona com conta pessoal comum — dá pra trocar isso nas configurações do
              próprio Instagram, é gratuito).
            </p>
            <p>
              <strong>Limite de 2 contas por empresa.</strong> Dá pra conectar até duas contas do Instagram no
              mesmo painel — útil se a empresa tem mais de um perfil (ex: duas marcas). Pra desconectar uma e
              liberar espaço pra outra, usa o ícone de lixeira ao lado da conta em "Contas conectadas".
            </p>
            <p>
              Se aparecer erro na hora de conectar, o motivo mais comum é a conta ainda não ter sido liberada
              como testadora do aplicativo — isso é configurado por quem administra o Auto Instagram, não é
              algo que você resolve sozinho.
            </p>
          </Section>

          <Section id="automacoes" title="2. Automações de comentário">
            <p>
              Em <strong>Automações</strong>, você cria regras que respondem sozinhas quando alguém comenta
              nos seus posts ou reels. Cada regra tem:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Conta</strong> — se você tem 2 contas conectadas, escolhe pra qual delas essa regra
                vale.
              </li>
              <li>
                <strong>Palavras-chave</strong> — a regra só dispara se o comentário contiver uma delas (ex:
                "quero, link, preço"). Deixe em branco pra disparar em <em>qualquer</em> comentário.
              </li>
              <li>
                <strong>Post/reel específico (opcional)</strong> — trava a regra pra rodar só naquele post, em
                vez de em todos.
              </li>
              <li>
                <strong>Resposta pública</strong> — texto que aparece como resposta pública ao comentário (todo
                mundo vê).
              </li>
              <li>
                <strong>DM privada ou Fluxo</strong> — o que é enviado na mensagem direta pra quem comentou. Se
                você escolher um Fluxo, ele substitui o texto fixo por uma conversa com botões (ver seção
                Fluxos abaixo).
              </li>
            </ul>
            <p>
              Se duas regras poderiam disparar pro mesmo comentário, a que está travada num post específico
              sempre ganha da regra genérica.
            </p>
            <p>
              <strong>Variável de nome:</strong> em qualquer texto de resposta (pública, DM privada, ou dentro
              de um passo de Fluxo), escreva <code className="rounded bg-muted px-1 py-0.5">{"{{nome}}"}</code>{" "}
              que o Auto Instagram substitui pelo @usuário de quem comentou/mandou a mensagem na hora de
              enviar. Ex: "Oi {"{{nome}}"}, vi seu comentário!" vira "Oi @joaosilva, vi seu comentário!".
            </p>
          </Section>

          <Section id="referral" title="3. Automação por link (referral)">
            <p>
              Além de comentário, dá pra disparar uma automação quando alguém clica num <strong>link
              especial do Instagram</strong> (formato <code className="rounded bg-muted px-1 py-0.5">ig.me/m/sua_conta?ref=codigo</code>) — na bio, num
              anúncio ou num story. A pessoa cai direto numa conversa de DM com você, e o Auto Instagram já
              sabe por qual link ela entrou <em>antes</em> dela digitar qualquer coisa.
            </p>
            <p>
              Pra criar: em Automações, escolhe o gatilho <strong>"Link (ig.me)"</strong> em vez de
              "Comentário", define um código (ex: <code className="rounded bg-muted px-1 py-0.5">promo-verao</code>), escolhe a conta, e o link
              pronto aparece na tela com um botão de copiar.
            </p>
            <p>
              <strong>Serve pra:</strong> ter um link diferente por campanha/anúncio/story, cada um já abrindo
              o fluxo ou mensagem certa — e saber de onde cada lead veio, sem precisar perguntar.
            </p>
          </Section>

          <Section id="fluxos" title="4. Fluxos (botões e coleta de dados)">
            <p>
              Em <strong>Fluxos</strong>, você monta conversas automáticas em etapas, estilo ManyChat. Cada
              fluxo tem um ou mais passos, e cada passo é de um desses dois tipos:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Botões (resposta rápida)</strong> — manda uma mensagem com até alguns botões
                clicáveis. Cada botão pode levar pra um passo diferente do fluxo (ramificação de verdade, não
                é só uma sequência reta).
              </li>
              <li>
                <strong>Coletar resposta</strong> — pede um texto livre (e-mail, telefone, nome) e salva a
                resposta da pessoa.
              </li>
            </ul>
            <p>
              Todo passo de <strong>Botões</strong> precisa de pelo menos um botão de verdade (com texto
              preenchido) — se salvar um passo de botões vazio, o Auto Instagram bloqueia e avisa o erro na
              tela.
            </p>
            <p>
              Depois de montado, o fluxo só entra em ação quando ligado a uma automação (comentário ou link) —
              ele mesmo não dispara sozinho.
            </p>
          </Section>

          <Section id="dados" title="5. Dados coletados">
            <p>
              Sempre que alguém completa um passo de "coletar resposta" dentro de um fluxo, isso vira uma
              linha em <strong>Dados coletados</strong> — com contato, fluxo, status (em andamento, completo
              ou abandonado), os dados preenchidos, o post de origem (se veio de comentário) e a data.
            </p>
            <p>
              Dá pra filtrar por período, por post/reel de origem, e (se tiver mais de uma conta conectada)
              por conta. O botão <strong>Exportar CSV</strong> baixa tudo que está filtrado na tela pra uma
              planilha.
            </p>
          </Section>

          <Section id="dashboard" title="6. Dashboard">
            <p>A tela inicial mostra, das últimas 24h:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><strong>Comentários respondidos hoje</strong> e <strong>DMs enviadas hoje</strong>.</li>
              <li><strong>Contas conectadas</strong> — quantas das 2 possíveis estão ativas.</li>
              <li>
                <strong>Novos seguidores hoje</strong> — comparação com o dia anterior. A API do Instagram não
                revela QUEM te seguiu, só o número total, então é sempre uma contagem, nunca uma lista de
                nomes. No primeiro dia depois de conectar, aparece "aguardando dados de amanhã" — é normal,
                ainda não há um dia anterior pra comparar.
              </li>
            </ul>
            <p>
              A lista de <strong>Atividade recente</strong> mostra os últimos comentários e mensagens
              recebidos, com link pro post/reel de origem quando aplicável.
            </p>
          </Section>

          <Section id="configuracoes" title="7. Configurações">
            <p>
              Mostra seu e-mail de login e a lista de contas do Instagram conectadas (mesma informação de
              "Conectar conta", visão resumida). Ainda não existe cobrança/plano configurado — hoje o único
              limite é o da própria API do Instagram (25 publicações por conta a cada 24h, quando o
              agendamento estiver disponível).
            </p>
          </Section>

          <Section id="agendamento" title="8. Agendamento">
            <p>
              Publicação agendada de posts, reels e stories ainda <strong>não está disponível</strong> — é a
              próxima etapa do produto. Por enquanto, o Auto Instagram cobre automação de comentário/DM e
              coleta de leads via Fluxos.
            </p>
          </Section>

          <Section id="limitacoes" title="9. Limitações reais da API do Instagram">
            <p>Algumas coisas não são bug do Auto Instagram — são bloqueios da própria Meta, sem contorno:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Curtida em post/reel não gera automação.</strong> A API do Instagram simplesmente não
                avisa ninguém quando alguém curte um post — só comentário, menção, mensagem direta e link de
                referral.
              </li>
              <li>
                <strong>Foto/nome de quem comenta ou manda DM pode não aparecer</strong> se essa pessoa nunca
                interagiu antes com a conta — a Meta bloqueia a busca desse dado por privacidade quando o app
                não passou por revisão completa. Não afeta o funcionamento da automação, só a exibição do
                nome/foto no painel.
              </li>
              <li>
                <strong>Novo seguidor</strong> só aparece como número no Dashboard — a API não revela quem
                seguiu, então não dá pra mandar mensagem automática pra "quem acabou de seguir".
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
