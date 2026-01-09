import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiBaseUrl } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const token = cookies().get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${apiBaseUrl()}/api/v1/api-keys/${ctx.params.id}/revoke`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: data.detail || data.error || "Failed" }, { status: res.status });
  return NextResponse.json(data);
}

