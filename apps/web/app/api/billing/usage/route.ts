import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { getUsageSummary } from "@/lib/limits";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(userId);
  const usage = await getUsageSummary({ userId: user.id, plan: user.plan });
  return NextResponse.json({ plan: user.plan, usage, stripeStatus: user.stripeStatus });
}

