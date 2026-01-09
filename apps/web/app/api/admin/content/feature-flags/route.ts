import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ flags });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const body = await req.json().catch(() => null);
  const key = String(body?.key || "").trim();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const flag = await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled: !!body?.enabled, description: body?.description ?? null },
    update: { enabled: !!body?.enabled, description: body?.description ?? null },
  });
  return NextResponse.json({ flag });
}

