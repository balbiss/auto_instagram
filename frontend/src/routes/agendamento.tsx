import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/agendamento")({
  head: () => ({
    meta: [
      { title: "Agendamento de posts, reels e stories — Auto Instagram" },
      {
        name: "description",
        content:
          "Organize feed, reels e stories em calendário ou lista, faça upload de mídia e veja a prévia antes de publicar.",
      },
      { property: "og:title", content: "Agendamento de posts — Auto Instagram" },
      {
        property: "og:description",
        content: "Calendário e lista de publicações agendadas com upload de mídia e prévia do post.",
      },
    ],
  }),
  component: Schedule,
});

function Schedule() {
  return (
    <AppShell
      title="Agendamento"
      description="Planeje feed, reels e stories com antecedência — publicamos automaticamente no horário escolhido."
    >
      <div className="card-surface flex flex-col items-center justify-center gap-3 p-12 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-brand text-on-brand shadow-brand-lg">
          <CalendarClock className="size-7" />
        </span>
        <h2 className="mt-2 text-lg font-semibold">Agendamento ainda não está disponível</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Publicação agendada de posts, reels e stories é a próxima fase do produto. Por enquanto, foque em
          conectar sua conta e configurar as automações de comentário e DM.
        </p>
      </div>
    </AppShell>
  );
}
