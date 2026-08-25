import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { BrandLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/api";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [{ title: "Criar conta — Auto Instagram" }],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ accountName, email, password, passwordConfirmation });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex animate-in fade-in zoom-in-95 justify-center duration-700">
          <BrandLogo className="h-28 sm:h-32" />
        </div>
        <div className="card-surface relative animate-in fade-in slide-in-from-bottom-4 overflow-hidden p-8 delay-150 duration-700 fill-mode-backwards">
          <div className="absolute inset-x-0 top-0 h-1 animate-shimmer bg-gradient-brand bg-[length:200%_100%]" />
          <h1 className="text-xl font-bold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece a automatizar comentários e DMs do seu Instagram.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="account-name">Nome da empresa/marca</Label>
              <Input
                id="account-name"
                placeholder="Ex: Ateliê Marina"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password-confirmation">Confirmar senha</Label>
              <Input
                id="password-confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button variant="brand" type="submit" className="w-full" disabled={loading}>
              <UserPlus /> {loading ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/entrar" className="font-medium text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
