import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const plans = await prisma.pricingPlan.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const body = await req.json().catch(() => null);
  const id = String(body?.id || "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const plan = await prisma.pricingPlan.upsert({
    where: { id },
    create: {
      id,
      name: body?.name ?? id,
      priceCents: Number(body?.priceCents ?? 0),
      screenshotLimit: Number(body?.screenshotLimit ?? 0),
      active: !!body?.active,
    },
    update: {
      name: body?.name ?? id,
      priceCents: Number(body?.priceCents ?? 0),
      screenshotLimit: Number(body?.screenshotLimit ?? 0),
      active: !!body?.active,
    },
  });

  return NextResponse.json({ plan });
}

