import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getOrCreateUser(userId);
  const invoices = await prisma.invoice.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ invoices });
}

