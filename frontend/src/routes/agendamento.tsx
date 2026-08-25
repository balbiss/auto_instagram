import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarClock, Image as ImageIcon, Film, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authFetch } from "@/lib/api";

export const Route = createFileRoute("/agendamento")({
  head: () => ({
    meta: [
      { title: "Agendamento de posts, reels e stories — Auto Instagram" },
      {
        name: "description",
        content: "Organize feed, reels e stories, faça upload de mídia e agende o horário de publicação.",
      },
    ],
  }),
  component: Schedule,
});

type PostType = "feed" | "reels" | "story";
type PostStatus = "scheduled" | "publishing" | "published" | "failed";

type ScheduledPostResource = {
  id: number;
  caption: string | null;
  post_type: PostType;
  status: PostStatus;
  scheduled_for: string;
  ig_media_id: string | null;
  error_message: string | null;
  media_url: string | null;
  media_content_type: string | null;
  instagram_account_id: number;
};

type InstagramAccountOption = { id: number; username: string | null; ig_user_id: string };

async function fetchPosts(): Promise<ScheduledPostResource[]> {
  const res = await authFetch("/scheduled_posts");
  if (!res.ok) throw new Error("Falha ao carregar posts agendados");
  return res.json();
}

async function fetchAccountOptions(): Promise<InstagramAccountOption[]> {
  const res = await authFetch("/instagram_accounts");
  if (!res.ok) throw new Error("Falha ao carregar contas conectadas");
  return res.json();
}

const statusLabel: Record<PostStatus, string> = {
  scheduled: "Agendado",
  publishing: "Publicando",
  published: "Publicado",
  failed: "Falhou",
};

const statusClass: Record<PostStatus, string> = {
  scheduled: "bg-brand-tint text-brand",
  publishing: "bg-ig-orange/15 text-ig-orange",
  published: "bg-gradient-brand text-on-brand",
  failed: "bg-destructive/10 text-destructive",
};

const postTypeLabel: Record<PostType, string> = { feed: "Feed", reels: "Reels", story: "Story" };

type FormValues = {
  instagram_account_id: number | null;
  caption: string;
  post_type: PostType;
  scheduled_for: string;
  file: File | null;
};

// datetime-local usa hora LOCAL do navegador — toISOString() converte pra UTC
// e desalinha o "min"/valor enviado quando o fuso não é UTC (ex: Brasil).
function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const emptyForm: FormValues = {
  instagram_account_id: null,
  caption: "",
  post_type: "feed",
  scheduled_for: "",
  file: null,
};

function Schedule() {
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery({ queryKey: ["scheduled_posts"], queryFn: fetchPosts });
  const { data: accountOptions } = useQuery({ queryKey: ["instagram_accounts"], queryFn: fetchAccountOptions });

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const onlyAccount = accountOptions?.length === 1 ? accountOptions[0] : null;
    if (creating && onlyAccount && form.instagram_account_id == null) {
      setForm((f) => ({ ...f, instagram_account_id: onlyAccount.id }));
    }
  }, [creating, accountOptions, form.instagram_account_id]);

  const isVideo = form.file?.type.startsWith("video/") ?? false;
  const availablePostTypes: PostType[] = isVideo ? [ "reels", "story" ] : [ "feed", "story" ];

  function handleFile(file: File | null) {
    setForm((f) => ({
      ...f,
      file,
      post_type: file?.type.startsWith("video/") ? "reels" : "feed",
    }));
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function startCreate() {
    setForm(emptyForm);
    setPreview(null);
    setCreating(true);
  }

  function cancel() {
    setCreating(false);
    setForm(emptyForm);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["scheduled_posts"] });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const body = new FormData();
      if (values.instagram_account_id) body.set("scheduled_post[instagram_account_id]", String(values.instagram_account_id));
      body.set("scheduled_post[caption]", values.caption);
      body.set("scheduled_post[post_type]", values.post_type);
      // values.scheduled_for é "YYYY-MM-DDTHH:mm" em hora local — new Date(...)
      // interpreta como local e toISOString() converte pra UTC de verdade,
      // pra não depender do fuso configurado no servidor.
      body.set("scheduled_post[scheduled_for]", new Date(values.scheduled_for).toISOString());
      if (values.file) body.set("scheduled_post[media]", values.file);

      const res = await authFetch("/scheduled_posts", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.errors?.join(", ") ?? "Falha ao agendar post");
      }
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      cancel();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`/scheduled_posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
    },
    onSuccess: invalidate,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate(form);
  }

  const canSubmit = form.instagram_account_id != null && form.file != null && form.scheduled_for !== "";

  return (
    <AppShell
      title="Agendamento"
      description="Planeje feed, reels e stories com antecedência — publicamos automaticamente no horário escolhido."
      actions={
        <Button variant="brand" onClick={startCreate}>
          <Plus /> Novo post
        </Button>
      }
    >
      <div className={creating ? "grid gap-4 lg:grid-cols-5" : ""}>
        <div className={creating ? "space-y-3 lg:col-span-3" : "space-y-3"}>
          {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {posts?.length === 0 && (
            <div className="card-surface p-6 text-center text-sm text-muted-foreground">
              Nenhum post agendado ainda. Clique em "Novo post" para começar.
            </div>
          )}
          {posts?.map((p) => (
            <article key={p.id} className="card-surface flex flex-wrap items-center gap-3 p-3">
              {p.media_url ? (
                p.media_content_type?.startsWith("video/") ? (
                  <video src={p.media_url} className="size-14 shrink-0 rounded-lg object-cover" muted />
                ) : (
                  <img src={p.media_url} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
                )
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {postTypeLabel[p.post_type]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm">{p.caption || <span className="text-muted-foreground">Sem legenda</span>}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(p.scheduled_for).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
                {p.status === "failed" && p.error_message && (
                  <p className="mt-1 flex items-start gap-1 text-xs text-destructive">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {p.error_message}
                  </p>
                )}
              </div>

              {p.status === "scheduled" && (
                <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => deleteMutation.mutate(p.id)}>
                  <Trash2 />
                </Button>
              )}
            </article>
          ))}
        </div>

        {creating && (
          <section className="card-surface h-fit p-5 lg:col-span-2">
            <h2 className="text-base font-semibold">Novo post</h2>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              {accountOptions && accountOptions.length > 1 && (
                <div className="space-y-1.5">
                  <Label htmlFor="post-account">Conta do Instagram</Label>
                  <select
                    id="post-account"
                    required
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={form.instagram_account_id ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, instagram_account_id: e.target.value ? Number(e.target.value) : null }))
                    }
                  >
                    <option value="" disabled>
                      Escolha a conta
                    </option>
                    {accountOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        @{a.username ?? a.ig_user_id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="post-media">Imagem ou vídeo</Label>
                <input
                  id="post-media"
                  type="file"
                  accept="image/jpeg,video/mp4,video/quicktime"
                  required
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-brand-tint file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Imagem: JPEG. Vídeo: MP4/MOV. Formato define se pode ser Feed/Story (imagem) ou Reels/Story
                  (vídeo).
                </p>
                {preview &&
                  (isVideo ? (
                    <video src={preview} controls className="mt-2 max-h-48 rounded-lg" />
                  ) : (
                    <img src={preview} alt="Prévia" className="mt-2 max-h-48 rounded-lg object-contain" />
                  ))}
              </div>

              <div className="space-y-1.5">
                <Label>Tipo de post</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePostTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, post_type: t }))}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-left text-sm font-medium ${
                        form.post_type === t ? "border-brand bg-brand-tint text-brand" : "border-input text-muted-foreground"
                      }`}
                    >
                      {isVideo ? <Film className="size-3.5" /> : <ImageIcon className="size-3.5" />}
                      {postTypeLabel[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="post-caption">Legenda</Label>
                <Textarea
                  id="post-caption"
                  rows={3}
                  placeholder="Escreva a legenda do post..."
                  value={form.caption}
                  onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="post-datetime">Data e hora</Label>
                <input
                  id="post-datetime"
                  type="datetime-local"
                  required
                  min={toLocalInputValue(new Date())}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={form.scheduled_for}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_for: e.target.value }))}
                />
              </div>

              {createMutation.isError && (
                <p className="text-sm text-destructive">{(createMutation.error as Error).message}</p>
              )}

              <div className="flex gap-2">
                <Button variant="brand" type="submit" className="flex-1" disabled={!canSubmit || createMutation.isPending}>
                  <CalendarClock /> {createMutation.isPending ? "Agendando..." : "Agendar post"}
                </Button>
                <Button variant="outline" type="button" onClick={cancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>
    </AppShell>
  );
}
