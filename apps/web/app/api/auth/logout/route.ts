import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { apiBaseUrl, clearAuthCookies } from "@/app/api/auth/_utils";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;
  if (refresh) {
    // Best-effort revoke
    await fetch(`${apiBaseUrl()}/api/v1/authx/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }
  clearAuthCookies();
  return NextResponse.json({ ok: true });
}

