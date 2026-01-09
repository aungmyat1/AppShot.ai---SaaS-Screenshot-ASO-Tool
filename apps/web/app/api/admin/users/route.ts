import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").trim().toLowerCase();
  const plan = u.searchParams.get("plan");
  const suspended = u.searchParams.get("suspended");

  const where: any = {};
  if (q) where.email = { contains: q, mode: "insensitive" };
  if (plan) where.plan = plan;
  if (suspended === "true") where.suspendedAt = { not: null };
  if (suspended === "false") where.suspendedAt = null;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ users });
}

