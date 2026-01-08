import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: { jobId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getOrCreateUser(userId);

  const job = await prisma.scrapeJob.findFirst({
    where: { id: ctx.params.jobId, userId: dbUser.id },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    error: job.error,
    screenshotCount: job.screenshotCount,
    zipUrl: job.zipUrl,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
}

