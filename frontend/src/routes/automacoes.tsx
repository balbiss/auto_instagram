import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Zap, Workflow, Instagram, Info, Link2, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaPicker, type MediaOption } from "@/components/media-picker";
import { authFetch } from "@/lib/api";

export const Route = createFileRoute("/automacoes")({
  head: () => ({
    meta: [
      { title: "Automações de comentários e DM — Auto Instagram" },
      {
        name: "description",
        content:
          "Crie regras: comentário com palavra-chave dispara resposta pública e DM privada automática no Instagram.",
      },
      { property: "og:title", content: "Automações de comentários e DM — Auto Instagram" },
      {
        property: "og:description",
        content: "Gatilhos por palavra-chave com resposta pública e mensagem direta automatizada.",
      },
    ],
  }),
  component: Automations,
});

type AutomationRule = {
  id: number;
  name: string;
  keywords: string[];
  public_reply_template: string | null;
  private_reply_template: string | null;
  active: boolean;
  comments_count: number;
  flow_id: number | null;
  instagram_account_id: number | null;
  media_id: string | null;
  media_permalink: string | null;
  media_type: string | null;
  media_thumbnail_url: string | null;
  media_caption: string | null;
  trigger_type: "comment" | "referral";
  referral_ref: string | null;
};

type FlowOption = { id: number; name: string };

type InstagramAccountOption = { id: number; username: string | null; ig_user_id: string; profile_picture_url: string | null };

type RuleFormValues = {
  name: string;
  keywords: string;
  public_reply_template: string;
  private_reply_template: string;
  active: boolean;
  flow_id: number | null;
  instagram_account_id: number | null;
  selectedMedia: MediaOption | null;
  trigger_type: "comment" | "referral";
  referral_ref: string;
};

const emptyForm: RuleFormValues = {
  name: "",
  keywords: "",
  public_reply_template: "",
  private_reply_template: "",
  active: true,
  flow_id: null,
  instagram_account_id: null,
  selectedMedia: null,
  trigger_type: "comment",
  referral_ref: "",
};

async function fetchRules(): Promise<AutomationRule[]> {
  const res = await authFetch("/automation_rules");
  if (!res.ok) throw new Error("Falha ao carregar automações");
  return res.json();
}

async function fetchFlowOptions(): Promise<FlowOption[]> {
  const res = await authFetch("/flows");
  if (!res.ok) throw new Error("Falha ao carregar fluxos");
  return res.json();
}

async function fetchAccountOptions(): Promise<InstagramAccountOption[]> {
  const res = await authFetch("/instagram_accounts");
  if (!res.ok) throw new Error("Falha ao carregar contas conectadas");
  return res.json();
}

async function fetchMediaOptions(instagramAccountId: number | null): Promise<MediaOption[]> {
  const qs = instagramAccountId ? `?instagram_account_id=${instagramAccountId}` : "";
  const res = await authFetch(`/instagram_accounts/media${qs}`);
  if (!res.ok) return [];
  return res.json();
}

function toPayload(values: RuleFormValues) {
  const m = values.selectedMedia;
  return {
    automation_rule: {
      name: values.name,
      keywords: values.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      public_reply_template: values.public_reply_template,
      private_reply_template: values.flow_id ? "" : values.private_reply_template,
      flow_id: values.flow_id,
      instagram_account_id: values.instagram_account_id,
      active: values.active,
      trigger_type: values.trigger_type,
      referral_ref: values.trigger_type === "referral" ? values.referral_ref.trim() : null,
      media_id: values.trigger_type === "comment" && m ? String(m.id) : null,
      media_permalink: values.trigger_type === "comment" ? (m?.permalink ?? null) : null,
      media_type: values.trigger_type === "comment" ? (m?.media_type ?? null) : null,
      media_thumbnail_url: values.trigger_type === "comment" ? (m?.thumbnail_url ?? null) : null,
      media_caption: values.trigger_type === "comment" ? (m?.caption ?? null) : null,
    },
  };
}

function Automations() {
  const queryClient = useQueryClient();
  const { data: rules, isLoading, isError } = useQuery({ queryKey: ["automation_rules"], queryFn: fetchRules });
  const { data: flowOptions } = useQuery({ queryKey: ["flows", "options"], queryFn: fetchFlowOptions });
  const { data: accountOptions } = useQuery({ queryKey: ["instagram_accounts"], queryFn: fetchAccountOptions });

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<RuleFormValues>(emptyForm);

  const { data: mediaOptions } = useQuery({
    queryKey: ["instagram_accounts", "media", form.instagram_account_id],
    queryFn: () => fetchMediaOptions(form.instagram_account_id),
    enabled: form.instagram_account_id != null,
  });

  useEffect(() => {
    if (editing === "new" || editing === null) return;
    const rule = rules?.find((r) => r.id === editing);
    if (rule) {
      setForm({
        name: rule.name,
        keywords: rule.keywords.join(", "),
        public_reply_template: rule.public_reply_template ?? "",
        private_reply_template: rule.private_reply_template ?? "",
        active: rule.active,
        flow_id: rule.flow_id,
        instagram_account_id: rule.instagram_account_id,
        trigger_type: rule.trigger_type,
        referral_ref: rule.referral_ref ?? "",
        selectedMedia: rule.media_id
          ? {
              id: rule.media_id,
              media_type: rule.media_type ?? "IMAGE",
              thumbnail_url: rule.media_thumbnail_url ?? "",
              caption: rule.media_caption,
              ...(rule.media_permalink ? { permalink: rule.media_permalink } : {}),
            }
          : null,
      });
    }
  }, [editing, rules]);

  // Com so 1 conta conectada, seleciona sozinho — nao faz sentido pedir escolha.
  useEffect(() => {
    const onlyAccount = accountOptions?.length === 1 ? accountOptions[0] : null;
    if (editing === "new" && onlyAccount && form.instagram_account_id == null) {
      setForm((f) => ({ ...f, instagram_account_id: onlyAccount.id }));
    }
  }, [editing, accountOptions, form.instagram_account_id]);

  function startCreate() {
    setForm(emptyForm);
    setEditing("new");
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["automation_rules"] });

  const createMutation = useMutation({
    mutationFn: async (values: RuleFormValues) => {
      const res = await authFetch("/automation_rules", { method: "POST", body: JSON.stringify(toPayload(values)) });
      if (!res.ok) throw new Error("Falha ao criar regra");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      cancelEdit();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: RuleFormValues }) => {
      const res = await authFetch(`/automation_rules/${id}`, { method: "PATCH", body: JSON.stringify(toPayload(values)) });
      if (!res.ok) throw new Error("Falha ao salvar regra");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      cancelEdit();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (rule: AutomationRule) => {
      const res = await authFetch(`/automation_rules/${rule.id}`, {
        method: "PATCH",
        body: JSON.stringify({ automation_rule: { active: !rule.active } }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar regra");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`/automation_rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir regra");
    },
    onSuccess: () => {
      invalidate();
      if (typeof editing === "number") cancelEdit();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing === "new") createMutation.mutate(form);
    else if (typeof editing === "number") updateMutation.mutate({ id: editing, values: form });
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  // garante que o post ja selecionado apareça no picker mesmo se não estiver
  // entre os ~25 posts mais recentes buscados da conta.
  const mediaPickerOptions =
    form.selectedMedia && !mediaOptions?.some((m) => String(m.id) === String(form.selectedMedia?.id))
      ? [form.selectedMedia, ...(mediaOptions ?? [])]
      : (mediaOptions ?? []);

  return (
    <AppShell
      title="Automações"
      description="Cada regra escuta comentários dos seus posts e reage com resposta pública e DM privada."
      actions={
        <Button variant="brand" onClick={startCreate}>
          <Plus /> Criar regra
        </Button>
      }
    >
      <div className={editing !== null ? "grid gap-4 lg:grid-cols-5" : ""}>
        <div className={editing !== null ? "space-y-3 lg:col-span-3" : "space-y-3"}>
          {isLoading && <p className="text-sm text-muted-foreground">Carregando automações...</p>}
          {isError && <p className="text-sm text-destructive">Não foi possível carregar as automações.</p>}
          {rules?.length === 0 && (
            <div className="card-surface p-6 text-center text-sm text-muted-foreground">
              Nenhuma automação criada ainda. Clique em "Criar regra" para começar.
            </div>
          )}
          {rules?.map((r) => (
            <article key={r.id} className="card-surface flex flex-wrap items-center gap-3 p-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-on-brand shadow-brand">
                <Zap className="size-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="truncate text-sm font-semibold">{r.name}</h2>
                  <span
                    className={
                      r.active
                        ? "shrink-0 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold text-on-brand"
                        : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                    }
                  >
                    {r.active ? "Ativa" : "Pausada"}
                  </span>
                  {r.trigger_type === "referral" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-medium text-brand">
                      <Link2 className="size-2.5" /> link ig.me
                    </span>
                  ) : r.media_id ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-medium text-brand">
                      <Instagram className="size-2.5" /> {r.media_type === "VIDEO" ? "reel" : "post"} específico
                    </span>
                  ) : null}
                  {accountOptions?.find((a) => a.id === r.instagram_account_id) ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      @{accountOptions.find((a) => a.id === r.instagram_account_id)?.username}
                    </span>
                  ) : null}
                  {r.flow_id ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Workflow className="size-2.5 text-ig-orange" />
                      {flowOptions?.find((f) => f.id === r.flow_id)?.name ?? "Fluxo"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {r.comments_count} disparos
                  {r.trigger_type === "referral" && r.referral_ref && <> · ref: {r.referral_ref}</>}
                  {r.trigger_type === "comment" && r.keywords.length > 0 && <> · gatilho: {r.keywords.join(", ")}</>}
                  {r.public_reply_template && <> · resposta: {r.public_reply_template}</>}
                  {!r.flow_id && r.private_reply_template && <> · DM: {r.private_reply_template}</>}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  checked={r.active}
                  onCheckedChange={() => toggleMutation.mutate(r)}
                  aria-label="Ativar regra"
                />
                <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setEditing(r.id)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => deleteMutation.mutate(r.id)}>
                  <Trash2 />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {editing !== null && (
          <section className="card-surface h-fit p-5 lg:col-span-2">
            <h2 className="text-base font-semibold">{editing === "new" ? "Nova regra" : "Editar regra"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {form.trigger_type === "comment"
                ? "Gatilho por palavra-chave em comentários de qualquer post ou reel. Deixe em branco para disparar em qualquer comentário."
                : "Gatilho por link ig.me — quem clicar já entra no fluxo/DM configurado, antes de digitar qualquer coisa."}
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="rule-name">Nome da regra</Label>
                <Input
                  id="rule-name"
                  placeholder="Ex: Lançamento coleção"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              {accountOptions && accountOptions.length > 1 && (
                <div className="space-y-1.5">
                  <Label htmlFor="rule-account">Conta do Instagram</Label>
                  <select
                    id="rule-account"
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
                <Label>Gatilho</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, trigger_type: "comment" }))}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${
                      form.trigger_type === "comment"
                        ? "border-brand bg-brand-tint text-brand"
                        : "border-input text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Instagram className="size-3.5" /> Comentário
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, trigger_type: "referral" }))}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${
                      form.trigger_type === "referral"
                        ? "border-brand bg-brand-tint text-brand"
                        : "border-input text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Link2 className="size-3.5" /> Link (ig.me)
                    </span>
                  </button>
                </div>
              </div>

              {form.trigger_type === "comment" ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="rule-keywords">Palavras-chave</Label>
                    <Input
                      id="rule-keywords"
                      placeholder="quero, link, preço"
                      value={form.keywords}
                      onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Separe por vírgula. Ignora acentos e caixa.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Restringir a um post/reel (opcional)</Label>
                    <MediaPicker
                      options={mediaPickerOptions}
                      value={form.selectedMedia ? String(form.selectedMedia.id) : ""}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          selectedMedia: v ? (mediaPickerOptions.find((m) => String(m.id) === v) ?? null) : null,
                        }))
                      }
                      emptyLabel="Qualquer post/reel"
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em "Qualquer post/reel" pra disparar em todos, ou trave num post específico pra rodar só
                      ali.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rule-reply">Resposta pública</Label>
                    <Textarea
                      id="rule-reply"
                      rows={2}
                      placeholder="Te mandei na DM 💌"
                      value={form.public_reply_template}
                      onChange={(e) => setForm((f) => ({ ...f, public_reply_template: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="rule-ref">Código de referência</Label>
                  <Input
                    id="rule-ref"
                    placeholder="promo-verao"
                    required
                    value={form.referral_ref}
                    onChange={(e) => setForm((f) => ({ ...f, referral_ref: e.target.value }))}
                  />
                  {form.instagram_account_id && form.referral_ref.trim() ? (
                    <ReferralLinkPreview
                      username={accountOptions?.find((a) => a.id === form.instagram_account_id)?.username ?? null}
                      ref_={form.referral_ref.trim()}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Escolha a conta e um código pra gerar o link — dá pra criar um código diferente por
                      campanha/anúncio.
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="rule-flow">Iniciar fluxo (opcional)</Label>
                <select
                  id="rule-flow"
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={form.flow_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, flow_id: e.target.value ? Number(e.target.value) : null }))
                  }
                >
                  <option value="">Nenhum — usar DM privada de texto fixo</option>
                  {flowOptions?.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                {flowOptions?.length === 0 ? (
                  <p className="flex items-start gap-1.5 rounded-lg bg-brand-tint/50 p-2 text-xs text-brand">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    Você ainda não criou nenhum fluxo.{" "}
                    <Link to="/fluxos" className="font-semibold underline">
                      Crie um em Fluxos
                    </Link>{" "}
                    e volte aqui pra escolher.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Se escolher um fluxo, ele substitui a DM privada — manda botões/coleta dados em etapas.
                  </p>
                )}
              </div>
              {!form.flow_id && (
                <div className="space-y-1.5">
                  <Label htmlFor="rule-dm">DM privada</Label>
                  <Textarea
                    id="rule-dm"
                    rows={3}
                    placeholder="Oi! Aqui está o link..."
                    value={form.private_reply_template}
                    onChange={(e) => setForm((f) => ({ ...f, private_reply_template: e.target.value }))}
                  />
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Ativar ao salvar</p>
                  <p className="text-xs text-muted-foreground">A regra começa a rodar imediatamente.</p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
                  aria-label="Ativar ao salvar"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="brand" type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar regra"}
                </Button>
                <Button variant="outline" type="button" onClick={cancelEdit}>
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

function ReferralLinkPreview({ username, ref_ }: { username: string | null; ref_: string }) {
  const [copied, setCopied] = useState(false);
  const link = `https://ig.me/m/${username ?? "sua_conta"}?ref=${encodeURIComponent(ref_)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponivel (ex: contexto sem permissao) — usuario copia manualmente
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-2">
      <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{link}</p>
      <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={copy} aria-label="Copiar link">
        {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}
