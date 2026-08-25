import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircleReply,
  Send,
  CalendarCheck,
  Users,
  UserPlus,
  Plus,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Auto Instagram | Automação de Instagram" },
      {
        name: "description",
        content:
          "Acompanhe comentários respondidos, DMs enviadas, posts agendados e uso de cota da sua automação de Instagram em um só painel.",
      },
      { property: "og:title", content: "Dashboard — Auto Instagram" },
      {
        property: "og:description",
        content: "Painel de automação de comentários, DMs e agendamento para contas Instagram Business.",
      },
    ],
  }),
  component: Dashboard,
});

type Summary = {
  comments_replied_today: number;
  dms_sent_today: number;
  connected_accounts: number;
  posts_scheduled: number;
  new_followers_today: number | null;
};

type ActivityItem = {
  type: "comment" | "message";
  who: string;
  avatar_url: string | null;
  text: string | null;
  replied: boolean | null;
  media_permalink: string | null;
  media_type: string | null;
  media_thumbnail_url: string | null;
  at: string;
};

async function fetchSummary(): Promise<Summary> {
  const res = await authFetch("/dashboard/summary");
  if (!res.ok) throw new Error("Falha ao carregar resumo");
  return res.json();
}

async function fetchActivity(): Promise<ActivityItem[]> {
  const res = await authFetch("/dashboard/activity");
  if (!res.ok) throw new Error("Falha ao carregar atividade");
  return res.json();
}

function Dashboard() {
  const { data: summary } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
    refetchInterval: 8000,
  });
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: fetchActivity,
    refetchInterval: 8000,
  });

  const metrics = [
    {
      label: "Comentários respondidos hoje",
      value: summary?.comments_replied_today ?? "—",
      icon: MessageCircleReply,
      accent: "text-ig-purple",
    },
    {
      label: "DMs enviadas hoje",
      value: summary?.dms_sent_today ?? "—",
      icon: Send,
      accent: "text-ig-pink",
    },
    {
      label: "Posts agendados",
      value: summary?.posts_scheduled ?? "—",
      note: "Agendamento ainda não está disponível",
      icon: CalendarCheck,
      accent: "text-ig-orange",
    },
    {
      label: "Contas conectadas",
      value: summary?.connected_accounts ?? "—",
      icon: Users,
      accent: "text-ig-blue",
    },
    {
      label: "Novos seguidores hoje",
      value: summary?.new_followers_today ?? "—",
      ...(summary && summary.new_followers_today == null
        ? { note: "Aguardando dados de amanhã" }
        : {}),
      icon: UserPlus,
      accent: "text-ig-purple",
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      description="Visão geral das suas automações de Instagram."
      actions={
        <>
          <Button variant="brand" asChild>
            <Link to="/agendamento">
              <Plus /> Agendar post
            </Link>
          </Button>
          <Button variant="brand" asChild>
            <Link to="/automacoes">
              <Zap /> Nova automação
            </Link>
          </Button>
        </>
      }
    >
      <div className="sticky top-14 z-20 grid gap-3 bg-background pb-3 sm:grid-cols-2 xl:grid-cols-5 lg:top-0">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface p-4">
            <div className="flex items-start justify-between">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-on-brand shadow-brand">
                <m.icon className="size-4" />
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                24h
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{m.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
            {m.note && <p className="mt-2 text-xs text-muted-foreground">{m.note}</p>}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <section className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Atividade recente</h2>
          </div>

          {activityLoading && <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>}
          {!activityLoading && activity?.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhuma atividade ainda — conecte sua conta do Instagram para começar a receber comentários e DMs
              aqui.
            </p>
          )}

          <ul className="mt-3 max-h-[420px] divide-y divide-border overflow-y-auto">
            {activity?.map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className="ring-brand-gradient rounded-full">
                  {a.avatar_url ? (
                    <img src={a.avatar_url} alt={a.who} className="size-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full bg-card text-xs font-semibold">
                      {(a.who || "??").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.type === "comment" ? "comentou" : "mandou DM"}
                      {a.text ? `: "${a.text}"` : ""}
                    </span>
                    {a.media_permalink && (
                      <>
                        {" "}
                        <a
                          href={a.media_permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-brand hover:underline"
                        >
                          ver {a.media_type === "VIDEO" ? "reel" : "post"}
                        </a>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(a.at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                {a.media_thumbnail_url && (
                  <img
                    src={a.media_thumbnail_url}
                    alt="Post"
                    className="size-10 shrink-0 rounded-lg object-cover"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
