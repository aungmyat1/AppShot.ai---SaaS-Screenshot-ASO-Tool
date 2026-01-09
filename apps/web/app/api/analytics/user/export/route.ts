import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getOrCreateUser } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/analytics/queries";

export const runtime = "nodejs";

function toCsv(rows: Array<Record<string, string | number>>) {
  const headers = Object.keys(rows[0] || {});
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h] ?? "")).join(","));
  return lines.join("\n");
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const u = new URL(req.url);
  const days = Number(u.searchParams.get("days") || "30");

  const user = await getOrCreateUser(userId);
  const data = await getUserAnalytics({ userId: user.id, rangeDays: days });

  const csv = toCsv(data.screenshotsPerDay.map((p) => ({ date: p.t, screenshots: p.v })));

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="usage-${days}d.csv"`,
    },
  });
}

