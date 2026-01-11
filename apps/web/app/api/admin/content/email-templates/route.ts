import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/app/api/admin/_auth";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const templates = await prisma.emailTemplate.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const subject = String(body?.subject || "");
  const bodyText = String(body?.bodyText || "");
  const bodyHtml = body?.bodyHtml ? String(body.bodyHtml) : null;

  const template = await prisma.emailTemplate.upsert({
    where: { slug },
    create: { slug, subject, bodyText, bodyHtml },
    update: { subject, bodyText, bodyHtml },
  });
  return NextResponse.json({ template });
}

