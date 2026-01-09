import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { requireAdmin } from "@/lib/auth";
import { withCache } from "@/lib/analytics/cache";
import { getAdminAnalytics } from "@/lib/analytics/queries";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await requireAdmin(userId);

  const u = new URL(req.url);
  const days = Number(u.searchParams.get("days") || "30");

  const data = await withCache(`aa:${days}`, 20_000, () => getAdminAnalytics({ rangeDays: days }));
  return NextResponse.json(data);
}

