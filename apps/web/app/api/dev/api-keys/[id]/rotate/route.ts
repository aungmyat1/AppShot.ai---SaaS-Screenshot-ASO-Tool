import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiBaseUrl } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const res = await fetch(`${apiBaseUrl()}/api/v1/api-keys/${id}/rotate`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Failed" }, { status: res.status });
  return NextResponse.json({ secret: data.secret, api_key: data.api_key });
}

