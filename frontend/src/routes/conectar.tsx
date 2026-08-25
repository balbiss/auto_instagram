import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, ShieldCheck, Instagram, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";

export const Route = createFileRoute("/conectar")({
  head: () => ({
    meta: [
      { title: "Conectar conta Instagram Business — Auto Instagram" },
      {
        name: "description",
        content:
          "Conecte sua conta Instagram Business via OAuth para liberar respostas automáticas, DMs e publicação agendada.",
      },
      { property: "og:title", content: "Conectar conta Instagram Business — Auto Instagram" },
      {
        property: "og:description",
        content: "Fluxo OAuth seguro para autorizar automações na sua conta Instagram Business.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search["status"] === "string" ? (search["status"] as string) : undefined,
  }),
  component: Connect,
});

const permissions = [
  "Ler e responder comentários dos seus posts",
  "Enviar e receber mensagens diretas",
  "Publicar feed, reels e stories em seu nome (em breve)",
];

const steps = [
  { title: "Autorizar no Instagram", desc: "Login direto com a conta Instagram Business — sem precisar de Página do Facebook." },
  { title: "Confirmar permissões", desc: "Você revisa e aprova o que a automação pode fazer pela conta." },
  { title: "Ativar automações", desc: "Volte aqui e crie suas regras de comentário e DM." },
];

type InstagramAccountResource = {
  id: number;
  ig_user_id: string;
  username: string | null;
  token_expires_at: string | null;
  profile_picture_url: string | null;
};

async function fetchAccounts(): Promise<InstagramAccountResource[]> {
  const res = await authFetch("/instagram_accounts");
  if (!res.ok) throw new Error("Falha ao carregar contas conectadas");
  return res.json();
}

function Connect() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/conectar" });
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const { data: accounts, isLoading } = useQuery({ queryKey: ["instagram_accounts"], queryFn: fetchAccounts });
  const limitReached = (accounts?.length ?? 0) >= 2;

  useEffect(() => {
    if (search.status === "success") {
      toast.success("Conta do Instagram conectada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["instagram_accounts"] });
      navigate({ to: "/conectar", search: { status: undefined }, replace: true });
    } else if (search.status === "limit") {
      toast.error("Limite de 2 contas do Instagram conectadas por empresa atingido.");
      navigate({ to: "/conectar", search: { status: undefined }, replace: true });
    } else if (search.status === "error") {
      toast.error("Não foi possível conectar a conta do Instagram. Tente novamente.");
      navigate({ to: "/conectar", search: { status: undefined }, replace: true });
    }
  }, [search.status, navigate, queryClient]);

  const disconnectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`/instagram_accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao desconectar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram_accounts"] });
      toast.success("Conta desconectada.");
    },
  });

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await authFetch("/instagram_oauth/authorize_url");
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Não foi possível iniciar a conexão. Tente novamente.");
      setConnecting(false);
    }
  }

  return (
    <AppShell
      title="Conectar conta"
      description="Autorize sua conta Instagram Business para que as automações possam responder por você."
    >
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card-surface relative overflow-hidden p-6 lg:col-span-3">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" />
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-on-brand shadow-brand-lg">
            <Instagram className="size-6" />
          </span>
          <h2 className="mt-4 text-xl font-bold">Instagram Business</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Usamos a API oficial do Instagram. Nunca pedimos sua senha e você pode revogar o acesso a
            qualquer momento.
          </p>

          <ul className="mt-4 space-y-2">
            {permissions.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>

          <Button
            variant="brand"
            size="lg"
            className="mt-5 w-full sm:w-auto"
            onClick={handleConnect}
            disabled={connecting || limitReached}
          >
            <Instagram /> {connecting ? "Redirecionando..." : "Conectar Instagram"}
          </Button>
          {limitReached ? (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Limite de 2 contas conectadas atingido — remova uma pra conectar outra.
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Conexão via OAuth 2.0 oficial da Meta.
            </p>
          )}
        </section>

        <div className="space-y-4 lg:col-span-2">
          <section className="card-surface p-5">
            <h2 className="text-base font-semibold">Como funciona</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-base font-semibold">Contas conectadas</h2>
            {isLoading && <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>}
            {!isLoading && accounts?.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma conta conectada ainda.</p>
            )}
            <ul className="mt-3 space-y-3">
              {accounts?.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="ring-brand-gradient rounded-full">
                    {a.profile_picture_url ? (
                      <img
                        src={a.profile_picture_url}
                        alt={a.username ?? a.ig_user_id}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-9 items-center justify-center rounded-full bg-card text-xs font-semibold">
                        {(a.username ?? a.ig_user_id).slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">@{a.username ?? a.ig_user_id}</p>
                    {a.token_expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Token expira em {new Date(a.token_expires_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover"
                    onClick={() => disconnectMutation.mutate(a.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
