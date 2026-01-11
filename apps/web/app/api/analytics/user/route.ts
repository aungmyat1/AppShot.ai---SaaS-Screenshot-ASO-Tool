import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { withCache } from "@/lib/analytics/cache";
import { getUserAnalytics } from "@/lib/analytics/queries";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const u = new URL(req.url);
  const days = Number(u.searchParams.get("days") || "30");
  const asUserId = u.searchParams.get("asUserId") || undefined;

  const actor = await getOrCreateUser(userId);
  let targetUserId = actor.id;
  if (asUserId && asUserId !== actor.id) {
    await requireAdmin(userId);
    targetUserId = asUserId;
  }

  const data = await withCache(`ua:${targetUserId}:${days}`, 15_000, () =>
    getUserAnalytics({ userId: targetUserId, rangeDays: days }),
  );
  return NextResponse.json(data);
}

