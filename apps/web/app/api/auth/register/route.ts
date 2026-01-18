import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const res = await fetch(`${apiBaseUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: body?.email, password: body?.password }),
  });
  const data = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Registration failed" }, { status: res.status });
  return NextResponse.json({ ok: true });
}

