import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getEmail, authFetch } from "@/lib/api";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — Auto Instagram" }],
  }),
  component: Settings,
});

type InstagramAccountResource = {
  id: number;
  username: string | null;
  ig_user_id: string;
  profile_picture_url: string | null;
};

async function fetchAccounts(): Promise<InstagramAccountResource[]> {
  const res = await authFetch("/instagram_accounts");
  if (!res.ok) throw new Error("Falha ao carregar contas conectadas");
  return res.json();
}

function Settings() {
  const { data: accounts } = useQuery({ queryKey: ["instagram_accounts"], queryFn: fetchAccounts });
  const email = typeof window !== "undefined" ? getEmail() : null;

  return (
    <AppShell title="Configurações" description="Conta, contas conectadas e limites do plano.">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="text-base font-semibold">Conta</h2>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3">
            <Mail className="size-4 text-muted-foreground" />
            <p className="text-sm">{email ?? "..."}</p>
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-base font-semibold">Instagram</h2>
          {accounts?.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma conta conectada.</p>
          )}
          {accounts?.map((a) => (
            <div key={a.id} className="mt-3 flex items-center gap-3 rounded-xl border border-border p-3">
              {a.profile_picture_url ? (
                <img
                  src={a.profile_picture_url}
                  alt={a.username ?? a.ig_user_id}
                  className="size-6 rounded-full object-cover"
                />
              ) : (
                <Instagram className="size-4 text-brand" />
              )}
              <p className="text-sm">@{a.username ?? a.ig_user_id}</p>
            </div>
          ))}
          <Link
            to="/conectar"
            search={{ status: undefined }}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Gerenciar contas conectadas <ArrowUpRight className="size-3.5" />
          </Link>
        </section>

        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Plano e limites</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda não há um sistema de planos/cobrança configurado — todas as contas usam apenas os limites
            impostos diretamente pela API do Instagram (25 publicações por conta a cada 24h).
          </p>
        </section>
      </div>
    </AppShell>
  );
}
