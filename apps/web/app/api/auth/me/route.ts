import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiBaseUrl } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

export async function GET() {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Minimal "me" by decoding token on backend would be better; for now call FastAPI v1 users/me from bearer token.
  const res = await fetch(`${apiBaseUrl()}/api/v1/users/me`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Unauthorized" }, { status: res.status });
  return NextResponse.json(data);
}

