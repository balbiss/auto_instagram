const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";
const TOKEN_KEY = "instaflow_token";
const EMAIL_KEY = "instaflow_email";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

function setEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) window.localStorage.setItem(EMAIL_KEY, email);
  else window.localStorage.removeItem(EMAIL_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

type ApiErrorBody = { errors?: string[]; error?: string };

async function parseErrors(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body.errors?.length) return body.errors.join(", ");
    if (body.error) return body.error;
  } catch {
    // resposta sem corpo JSON
  }
  return "Algo deu errado. Tente novamente.";
}

export async function signUp(params: {
  accountName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: {
        account_name: params.accountName,
        email: params.email,
        password: params.password,
        password_confirmation: params.passwordConfirmation,
      },
    }),
  });

  if (!response.ok) throw new Error(await parseErrors(response));

  const authHeader = response.headers.get("Authorization");
  if (authHeader) setToken(authHeader.replace(/^Bearer\s+/i, ""));
  setEmail(params.email);

  return response.json();
}

export async function signIn(params: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/users/sign_in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: params }),
  });

  if (!response.ok) throw new Error(await parseErrors(response));

  const authHeader = response.headers.get("Authorization");
  if (authHeader) setToken(authHeader.replace(/^Bearer\s+/i, ""));
  setEmail(params.email);

  return response.json();
}

export async function signOut() {
  const token = getToken();
  setToken(null);
  setEmail(null);
  if (!token) return;

  await fetch(`${API_URL}/users/sign_out`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    // já limpamos o token localmente, ignora falha de rede aqui
  });
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  // FormData (upload de arquivo) precisa que o browser defina o Content-Type
  // sozinho (multipart + boundary) — setar manualmente quebra o upload.
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
