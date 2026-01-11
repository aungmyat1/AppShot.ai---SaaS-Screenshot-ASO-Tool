import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ announcements });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const body = await req.json().catch(() => null);
  const title = String(body?.title || "").trim();
  const b = String(body?.body || "").trim();
  if (!title || !b) return NextResponse.json({ error: "title and body required" }, { status: 400 });
  const a = await prisma.announcement.create({ data: { title, body: b, active: body?.active ?? true } });
  return NextResponse.json({ announcement: a });
}

