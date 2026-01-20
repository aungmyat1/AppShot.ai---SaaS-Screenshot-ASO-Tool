import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await ctx.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      scrapeJobs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  const data: any = {};
  if (body?.plan) data.plan = body.plan;
  if (typeof body?.isAdmin === "boolean") data.isAdmin = body.isAdmin;
  if (typeof body?.suspended === "boolean") data.suspendedAt = body.suspended ? new Date() : null;

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ user });
}

