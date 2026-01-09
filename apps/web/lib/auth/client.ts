export type AuthUser = {
  id: string;
  email: string;
  role: string;
  subscription_tier: string;
};

export async function apiLogin(payload: { email: string; password: string; totpCode?: string; deviceFingerprint?: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function apiRegister(payload: { email: string; password: string }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function apiMe(): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  const data = (await res.json()) as AuthUser & { error?: string };
  if (!res.ok) throw new Error(data.error || "Not authenticated");
  return data;
}

export async function apiLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

