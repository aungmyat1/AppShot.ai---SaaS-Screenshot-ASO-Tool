export const CSRF_COOKIE_NAME = "csrf_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const c of cookies) {
    const [k, ...rest] = c.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME);
}

export function withCsrfHeaders(init?: HeadersInit): HeadersInit {
  const token = getCsrfToken();
  const h = new Headers(init || {});
  if (token) h.set("x-csrf-token", token);
  return h;
}

