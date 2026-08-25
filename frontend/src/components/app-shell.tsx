import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Zap,
  CalendarClock,
  Plug,
  Settings,
  Menu,
  X,
  LogOut,
  Workflow,
  Database,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEmail, isAuthenticated, signOut } from "@/lib/api";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fluxos", label: "Fluxos", icon: Workflow },
  { to: "/automacoes", label: "Automações", icon: Zap },
  { to: "/dados-coletados", label: "Dados coletados", icon: Database },
  { to: "/agendamento", label: "Agendamento", icon: CalendarClock },
  { to: "/conectar", label: "Conectar conta", icon: Plug },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          activeProps={{
            className:
              "bg-gradient-brand text-on-brand shadow-brand hover:opacity-90 [&_svg]:text-on-brand",
          }}
        >
          <Icon className="size-[18px] shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function QuotaBadge() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">Cota diária</p>
        <p className="text-xs font-semibold">0/25</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-0 rounded-full bg-gradient-brand" />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Posts publicados hoje</p>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  // getEmail() le localStorage — so pode rodar depois de montar no client,
  // senao o texto renderizado no servidor (sem valor) diverge do client e
  // quebra a hidratacao do React.
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
    if (!isAuthenticated()) {
      navigate({ to: "/entrar" });
    }
  }, [navigate]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/entrar" });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden w-[264px] flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
        <div className="space-y-4">
          <div className="flex justify-center">
            <BrandLogo className="h-14" />
          </div>
          <NavLinks />
        </div>
        <div className="space-y-3">
          <QuotaBadge />
          <div className="flex items-center gap-3 rounded-xl p-1">
            <span className="ring-brand-gradient rounded-full">
              <span className="flex size-8 items-center justify-center rounded-full bg-card text-xs font-semibold">
                {(email ?? "??").slice(0, 2).toUpperCase()}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{email ?? "..."}</p>
              <p className="text-[11px] text-muted-foreground">Plano Growth</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleSignOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <BrandLogo className="h-9" />
        <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <Menu />
        </Button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col justify-between bg-sidebar p-4 shadow-soft">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <BrandLogo />
                <Button variant="ghost" size="icon" aria-label="Fechar" onClick={() => setOpen(false)}>
                  <X />
                </Button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="space-y-3">
              <QuotaBadge />
              <div className="flex items-center gap-3 rounded-xl p-1">
                <span className="ring-brand-gradient rounded-full">
                  <span className="flex size-8 items-center justify-center rounded-full bg-card text-xs font-semibold">
                    {(email ?? "??").slice(0, 2).toUpperCase()}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{email ?? "..."}</p>
                  <p className="text-[11px] text-muted-foreground">Plano Growth</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-[264px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:py-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
              {description && (
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          <div className={cn("mt-5")}>{children}</div>
        </div>
      </main>
    </div>
  );
}
