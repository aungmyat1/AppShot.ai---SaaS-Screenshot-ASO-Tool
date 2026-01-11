import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/api/admin/_auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").trim();

  const rows = await prisma.scrapeJob.findMany({
    where: {
      status: "FAILED",
      ...(q ? { error: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      appUrl: true,
      store: true,
      error: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ errors: rows });
}

