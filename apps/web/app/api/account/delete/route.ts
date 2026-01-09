import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(userId);

  // Deletes all DB data for this user (cascade handles dependent rows).
  // Note: this does NOT delete the Clerk account; do that via Clerk dashboard/user settings.
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}

