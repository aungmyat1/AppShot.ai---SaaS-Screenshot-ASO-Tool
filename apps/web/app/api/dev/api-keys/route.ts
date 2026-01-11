import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiBaseUrl } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

function bearer() {
  const token = cookies().get("access_token")?.value;
  if (!token) return null;
  return `Bearer ${token}`;
}

export async function GET() {
  const authz = bearer();
  if (!authz) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${apiBaseUrl()}/api/v1/api-keys`, { headers: { authorization: authz }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Failed" }, { status: res.status });
  return NextResponse.json({ keys: data });
}

export async function POST(req: Request) {
  const authz = bearer();
  if (!authz) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const res = await fetch(`${apiBaseUrl()}/api/v1/api-keys`, {
    method: "POST",
    headers: { authorization: authz, "content-type": "application/json" },
    body: JSON.stringify({ name: body?.name ?? null, permissions: {}, expires_at: null }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Failed" }, { status: res.status });
  return NextResponse.json({ secret: data.secret, api_key: data.api_key });
}

