import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";

export async function requireAdminApi() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  try {
    const admin = await requireAdmin(userId);
    return { admin };
  } catch {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
}

