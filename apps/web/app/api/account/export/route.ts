import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(userId);
  const [jobs, ledger, invoices] = await Promise.all([
    prisma.scrapeJob.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.creditLedger.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 1000 }),
    prisma.invoice.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    },
    scrapeJobs: jobs,
    creditLedger: ledger,
    invoices,
  };

  return NextResponse.json(payload, {
    headers: {
      "content-disposition": 'attachment; filename="getappshots-export.json"',
    },
  });
}

