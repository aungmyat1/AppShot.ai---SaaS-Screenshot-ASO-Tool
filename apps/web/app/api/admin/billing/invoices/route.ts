import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const u = new URL(req.url);
  const status = u.searchParams.get("status");

  const invoices = await prisma.invoice.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return NextResponse.json({ invoices });
}

