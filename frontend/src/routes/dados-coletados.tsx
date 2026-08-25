import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Instagram } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/media-picker";
import { authFetch } from "@/lib/api";

export const Route = createFileRoute("/dados-coletados")({
  head: () => ({
    meta: [
      { title: "Dados coletados — Auto Instagram" },
      {
        name: "description",
        content: "Leads capturados pelos seus fluxos — contato, dados coletados e post de origem.",
      },
    ],
  }),
  component: CollectedData,
});

type Lead = {
  id: number;
  status: "active" | "completed" | "abandoned";
  data: Record<string, string>;
  created_at: string;
  conversation_id: number;
  contact: { igsid: string; username: string | null; name: string | null; profile_picture_url: string | null };
  flow: { id: number; name: string };
  comment: { id: number; media_permalink: string; media_type: string; media_thumbnail_url: string } | null;
};

type PostOption = {
  id: number;
  media_id: string;
  permalink: string;
  media_type: string;
  thumbnail_url: string;
  caption: string | null;
};

type InstagramAccountOption = { id: number; username: string | null; ig_user_id: string };

async function fetchLeads(params: {
  dateFrom: string;
  dateTo: string;
  commentId: string;
  instagramAccountId: string;
}): Promise<Lead[]> {
  const search = new URLSearchParams();
  if (params.dateFrom) search.set("date_from", params.dateFrom);
  if (params.dateTo) search.set("date_to", `${params.dateTo}T23:59:59`);
  if (params.commentId) search.set("comment_id", params.commentId);
  if (params.instagramAccountId) search.set("instagram_account_id", params.instagramAccountId);
  const res = await authFetch(`/leads?${search.toString()}`);
  if (!res.ok) throw new Error("Falha ao carregar dados coletados");
  return res.json();
}

async function fetchPostOptions(): Promise<PostOption[]> {
  const res = await authFetch("/leads/posts");
  if (!res.ok) throw new Error("Falha ao carregar posts");
  return res.json();
}

async function fetchAccountOptions(): Promise<InstagramAccountOption[]> {
  const res = await authFetch("/instagram_accounts");
  if (!res.ok) throw new Error("Falha ao carregar contas conectadas");
  return res.json();
}

const statusLabel: Record<Lead["status"], string> = {
  active: "Em andamento",
  completed: "Completo",
  abandoned: "Abandonado",
};

const statusClass: Record<Lead["status"], string> = {
  active: "bg-brand-tint text-brand",
  completed: "bg-gradient-brand text-on-brand",
  abandoned: "bg-muted text-muted-foreground",
};

function CollectedData() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [commentId, setCommentId] = useState("");
  const [instagramAccountId, setInstagramAccountId] = useState("");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", dateFrom, dateTo, commentId, instagramAccountId],
    queryFn: () => fetchLeads({ dateFrom, dateTo, commentId, instagramAccountId }),
  });

  const { data: postOptions } = useQuery({ queryKey: ["leads", "posts"], queryFn: fetchPostOptions });
  const { data: accountOptions } = useQuery({ queryKey: ["instagram_accounts"], queryFn: fetchAccountOptions });

  const fieldNames = useMemo(() => {
    const names = new Set<string>();
    leads?.forEach((l) => Object.keys(l.data ?? {}).forEach((k) => names.add(k)));
    return Array.from(names);
  }, [leads]);

  function exportCsv() {
    if (!leads || leads.length === 0) return;
    const headers = ["username", "nome", "fluxo", "status", "data", ...fieldNames];
    const rows = leads.map((l) => [
      l.contact.username ?? l.contact.igsid,
      l.contact.name ?? "",
      l.flow.name,
      statusLabel[l.status],
      new Date(l.created_at).toLocaleString("pt-BR"),
      ...fieldNames.map((f) => l.data?.[f] ?? ""),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dados-coletados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      title="Dados coletados"
      description="Leads capturados pelos seus fluxos — filtre por data e por post/reel de origem."
      actions={
        <Button variant="brandOutline" onClick={exportCsv} disabled={!leads?.length}>
          <Download /> Exportar CSV
        </Button>
      }
    >
      <div className="card-surface mb-4 flex flex-wrap items-end gap-4 p-4">
        <div className="w-40 space-y-1.5">
          <Label htmlFor="date-from" className="text-xs">
            De
          </Label>
          <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="w-40 space-y-1.5">
          <Label htmlFor="date-to" className="text-xs">
            Até
          </Label>
          <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="min-w-[280px] flex-1 space-y-1.5 sm:flex-none">
          <Label className="text-xs">Post/Reel</Label>
          <MediaPicker
            options={postOptions ?? []}
            value={commentId}
            onChange={setCommentId}
            emptyLabel="Todos os posts/reels"
          />
        </div>
        {accountOptions && accountOptions.length > 1 && (
          <div className="w-52 space-y-1.5">
            <Label htmlFor="account-filter" className="text-xs">
              Conta
            </Label>
            <select
              id="account-filter"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={instagramAccountId}
              onChange={(e) => setInstagramAccountId(e.target.value)}
            >
              <option value="">Todas as contas</option>
              {accountOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.username ?? a.ig_user_id}
                </option>
              ))}
            </select>
          </div>
        )}
        {(dateFrom || dateTo || commentId || instagramAccountId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setCommentId("");
              setInstagramAccountId("");
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="card-surface overflow-hidden">
        {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && leads?.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Nenhum dado coletado ainda. Quando um lead completar um fluxo com passo de coleta, aparece aqui.
          </p>
        )}
        {leads && leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Fluxo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dados coletados</th>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {l.contact.profile_picture_url ? (
                          <img
                            src={l.contact.profile_picture_url}
                            alt={l.contact.username ?? l.contact.igsid}
                            className="size-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {(l.contact.username ?? l.contact.igsid).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="font-medium">{l.contact.username ?? l.contact.igsid}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.flow.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass[l.status]}`}>
                        {statusLabel[l.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(l.data ?? {}).map(([field, value]) => (
                          <span
                            key={field}
                            className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand"
                          >
                            {field}: {value}
                          </span>
                        ))}
                        {Object.keys(l.data ?? {}).length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {l.comment ? (
                        <a
                          href={l.comment.media_permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                        >
                          <Instagram className="size-3.5" /> {l.comment.media_type === "VIDEO" ? "Reel" : "Post"}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
