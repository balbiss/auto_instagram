import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Workflow, MessageSquareText, ListChecks, Info, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { authFetch } from "@/lib/api";

export const Route = createFileRoute("/fluxos")({
  head: () => ({
    meta: [
      { title: "Fluxos automatizados — Auto Instagram" },
      {
        name: "description",
        content:
          "Crie fluxos de DM com botões de resposta rápida e coleta de dados em etapas, estilo ManyChat.",
      },
    ],
  }),
  component: Flows,
});

type StepType = "quick_replies" | "collect_text";

type FlowStepOptionResource = { id: number; label: string; position: number; next_step_id: number | null };
type FlowStepResource = {
  id: number;
  position: number;
  message_text: string;
  step_type: StepType;
  field_name: string | null;
  flow_step_options: FlowStepOptionResource[];
};
type FlowResource = { id: number; name: string; active: boolean; flow_steps: FlowStepResource[] };

type OptionForm = { id?: number; label: string; nextPosition: number | null };
type StepForm = {
  id?: number;
  position: number;
  message_text: string;
  step_type: StepType;
  field_name: string;
  options: OptionForm[];
};
type FlowForm = { name: string; active: boolean; steps: StepForm[] };

const emptyStep = (position: number): StepForm => ({
  position,
  message_text: "",
  step_type: "quick_replies",
  field_name: "",
  options: [{ label: "", nextPosition: null }],
});

const emptyForm = (): FlowForm => ({ name: "", active: true, steps: [emptyStep(1)] });

async function fetchFlows(): Promise<FlowResource[]> {
  const res = await authFetch("/flows");
  if (!res.ok) throw new Error("Falha ao carregar fluxos");
  return res.json();
}

function resourceToForm(flow: FlowResource): FlowForm {
  const positionById = new Map(flow.flow_steps.map((s) => [s.id, s.position]));
  return {
    name: flow.name,
    active: flow.active,
    steps: flow.flow_steps
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        id: s.id,
        position: s.position,
        message_text: s.message_text,
        step_type: s.step_type,
        field_name: s.field_name ?? "",
        options: s.flow_step_options
          .sort((a, b) => a.position - b.position)
          .map((o) => ({
            id: o.id,
            label: o.label,
            nextPosition: o.next_step_id != null ? (positionById.get(o.next_step_id) ?? null) : null,
          })),
      })),
  };
}

function buildBasePayload(form: FlowForm) {
  return {
    flow: {
      name: form.name,
      active: form.active,
      flow_steps_attributes: form.steps.map((s) => ({
        ...(s.id ? { id: s.id } : {}),
        position: s.position,
        message_text: s.message_text,
        step_type: s.step_type,
        field_name: s.step_type === "collect_text" ? s.field_name : null,
        flow_step_options_attributes:
          s.step_type === "quick_replies"
            ? s.options
                .filter((o) => o.label.trim())
                .map((o, oi) => ({ ...(o.id ? { id: o.id } : {}), label: o.label.trim(), position: oi + 1 }))
            : [],
      })),
    },
  };
}

function Flows() {
  const queryClient = useQueryClient();
  const { data: flows, isLoading } = useQuery({ queryKey: ["flows"], queryFn: fetchFlows });
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<FlowForm>(emptyForm());

  useEffect(() => {
    if (editingId === "new" || editingId === null) return;
    const flow = flows?.find((f) => f.id === editingId);
    if (flow) setForm(resourceToForm(flow));
  }, [editingId, flows]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["flows"] });

  function startCreate() {
    setForm(emptyForm());
    setEditingId("new");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  const saveMutation = useMutation({
    mutationFn: async (values: FlowForm) => {
      const basePayload = buildBasePayload(values);
      const url = editingId === "new" ? "/flows" : `/flows/${editingId}`;
      const method = editingId === "new" ? "POST" : "PATCH";
      const res = await authFetch(url, { method, body: JSON.stringify(basePayload) });
      if (!res.ok) throw new Error("Falha ao salvar fluxo");
      const saved: FlowResource = await res.json();

      // 2a etapa: agora que os passos tem id real, resolve "vai para o passo N"
      // (posicao) pro next_step_id de verdade e salva de novo.
      const idByPosition = new Map(saved.flow_steps.map((s) => [s.position, s.id]));
      const wireSteps = values.steps
        .map((s, i) => {
          const savedStep = saved.flow_steps.find((ss) => ss.position === s.position) ?? saved.flow_steps[i];
          const savedOptions = savedStep?.flow_step_options ?? [];
          if (s.step_type !== "quick_replies") return null;
          const filledOptions = s.options.filter((o) => o.label.trim());
          const optionsAttrs = filledOptions
            .map((o, oi) => {
              const savedOption = savedOptions[oi];
              if (!savedOption) return null;
              const nextId = o.nextPosition != null ? (idByPosition.get(o.nextPosition) ?? null) : null;
              return { id: savedOption.id, next_step_id: nextId };
            })
            .filter(Boolean);
          if (!savedStep || optionsAttrs.length === 0) return null;
          return { id: savedStep.id, flow_step_options_attributes: optionsAttrs };
        })
        .filter(Boolean);

      if (wireSteps.length > 0) {
        await authFetch(`/flows/${saved.id}`, {
          method: "PATCH",
          body: JSON.stringify({ flow: { flow_steps_attributes: wireSteps } }),
        });
      }

      return saved;
    },
    onSuccess: () => {
      invalidate();
      cancelEdit();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(`/flows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir fluxo");
    },
    onSuccess: () => {
      invalidate();
      if (typeof editingId === "number") cancelEdit();
    },
  });

  function updateStep(index: number, patch: Partial<StepForm>) {
    setForm((f) => ({ ...f, steps: f.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  }

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, emptyStep(f.steps.length + 1)] }));
  }

  function removeStep(index: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i + 1 })),
    }));
  }

  function updateOption(stepIndex: number, optIndex: number, patch: Partial<OptionForm>) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) =>
        i === stepIndex
          ? { ...s, options: s.options.map((o, oi) => (oi === optIndex ? { ...o, ...patch } : o)) }
          : s,
      ),
    }));
  }

  function addOption(stepIndex: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) =>
        i === stepIndex ? { ...s, options: [...s.options, { label: "", nextPosition: null }] } : s,
      ),
    }));
  }

  function removeOption(stepIndex: number, optIndex: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) =>
        i === stepIndex ? { ...s, options: s.options.filter((_, oi) => oi !== optIndex) } : s,
      ),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(form);
  }

  return (
    <AppShell
      title="Fluxos"
      description="Sequências de mensagem com botões e coleta de dados, disparadas por uma automação de comentário."
      actions={
        <Button variant="brand" onClick={startCreate}>
          <Plus /> Criar fluxo
        </Button>
      }
    >
      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-brand-tint bg-brand-tint/50 p-3.5 text-sm text-brand">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Crie o fluxo aqui primeiro (perguntas, botões, coleta de dados). Depois vá em{" "}
          <Link to="/automacoes" className="inline-flex items-center gap-0.5 font-semibold underline">
            Automações <ArrowRight className="size-3" />
          </Link>{" "}
          e escolha esse fluxo no campo "Iniciar fluxo" da regra — é lá que ele passa a rodar de verdade.
        </p>
      </div>

      <div className={editingId !== null ? "grid gap-4 lg:grid-cols-5" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
        <div className={editingId !== null ? "space-y-3 lg:col-span-2" : "contents"}>
          {isLoading && <p className="text-sm text-muted-foreground">Carregando fluxos...</p>}
          {flows?.length === 0 && (
            <div className="card-surface p-6 text-center text-sm text-muted-foreground">
              Nenhum fluxo criado ainda.
            </div>
          )}
          {flows?.map((f) => (
            <article key={f.id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-on-brand shadow-brand">
                    <Workflow className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">{f.name}</h2>
                    <p className="text-xs text-muted-foreground">{f.flow_steps.length} passo(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setEditingId(f.id)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => deleteMutation.mutate(f.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <ol className="mt-3 space-y-1.5">
                {f.flow_steps
                  .sort((a, b) => a.position - b.position)
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {s.step_type === "quick_replies" ? (
                        <ListChecks className="size-3.5 shrink-0 text-ig-purple" />
                      ) : (
                        <MessageSquareText className="size-3.5 shrink-0 text-ig-pink" />
                      )}
                      <span className="truncate">{s.message_text}</span>
                    </li>
                  ))}
              </ol>
            </article>
          ))}
        </div>

        {editingId !== null && (
          <section className="card-surface h-fit p-5 lg:col-span-3">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{editingId === "new" ? "Novo fluxo" : "Editar fluxo"}</h2>
                <div className="flex items-center gap-2">
                  <Label htmlFor="flow-active" className="text-xs">
                    Ativo
                  </Label>
                  <Switch
                    id="flow-active"
                    checked={form.active}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="flow-name">Nome do fluxo</Label>
                <Input
                  id="flow-name"
                  placeholder="Ex: Desconto 10%"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                {form.steps.map((step, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand">
                        {i + 1}
                      </span>
                      <select
                        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                        value={step.step_type}
                        onChange={(e) => updateStep(i, { step_type: e.target.value as StepType })}
                      >
                        <option value="quick_replies">Botões de resposta rápida</option>
                        <option value="collect_text">Coletar resposta (texto livre)</option>
                      </select>
                      {form.steps.length > 1 && (
                        <Button variant="ghost" size="icon" type="button" onClick={() => removeStep(i)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <Textarea
                      className="mt-2"
                      rows={2}
                      placeholder="Mensagem que será enviada nesse passo..."
                      value={step.message_text}
                      onChange={(e) => updateStep(i, { message_text: e.target.value })}
                      required
                    />

                    {step.step_type === "collect_text" ? (
                      <div className="mt-2 space-y-1.5">
                        <Label className="text-xs">Nome do campo coletado (ex: email, telefone)</Label>
                        <Input
                          placeholder="email"
                          value={step.field_name}
                          onChange={(e) => updateStep(i, { field_name: e.target.value })}
                          required
                        />
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {step.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-1.5">
                            <Input
                              className="flex-1"
                              placeholder="Texto do botão (máx 20 caracteres)"
                              maxLength={20}
                              value={opt.label}
                              onChange={(e) => updateOption(i, oi, { label: e.target.value })}
                            />
                            <select
                              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                              value={opt.nextPosition ?? ""}
                              onChange={(e) =>
                                updateOption(i, oi, {
                                  nextPosition: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                            >
                              <option value="">Encerra o fluxo</option>
                              {form.steps
                                .filter((s) => s.position !== step.position)
                                .map((s) => (
                                  <option key={s.position} value={s.position}>
                                    vai pro passo {s.position}
                                  </option>
                                ))}
                            </select>
                            {step.options.length > 1 && (
                              <Button variant="ghost" size="icon" type="button" onClick={() => removeOption(i, oi)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" type="button" onClick={() => addOption(i)}>
                          <Plus className="size-3.5" /> Adicionar botão
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                <Button variant="brandOutline" type="button" className="w-full" onClick={addStep}>
                  <Plus /> Adicionar passo
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="brand" type="submit" className="flex-1" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar fluxo"}
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
