import { NextResponse } from "next/server";

import { apiBaseUrl, setAuthCookies } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const res = await fetch(`${apiBaseUrl()}/api/v1/authx/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: body?.email,
      password: body?.password,
      totp_code: body?.totpCode,
      device_fingerprint: body?.deviceFingerprint,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; refresh_token?: string; detail?: string; error?: string };
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Login failed" }, { status: res.status });
  if (!data.access_token || !data.refresh_token) {
    return NextResponse.json({ error: "Invalid login response" }, { status: 500 });
  }
  await setAuthCookies({ accessToken: data.access_token, refreshToken: data.refresh_token });
  return NextResponse.json({ ok: true });
}

