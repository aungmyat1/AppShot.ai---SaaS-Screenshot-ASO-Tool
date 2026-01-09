import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { withCache } from "@/lib/analytics/cache";
import { getUserAnalytics } from "@/lib/analytics/queries";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const u = new URL(req.url);
  const days = Number(u.searchParams.get("days") || "30");

  const user = await getOrCreateUser(userId);
  const data = await withCache(`ua:${user.id}:${days}`, 15_000, () => getUserAnalytics({ userId: user.id, rangeDays: days }));
  return NextResponse.json(data);
}

