import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { scrapeRequestSchema } from "@/lib/app-url";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isQueueEnabled, getScrapeQueue } from "@/lib/queue";
import { processScrapeJob } from "@/lib/core/process-scrape-job";
import { enforcePlanLimits } from "@/lib/limits";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = scrapeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const url = parsed.data.url;

  const dbUser = await getOrCreateUser(userId);
  let screenshotLimit = 30;
  try {
    const decision = await enforcePlanLimits({ userId: dbUser.id, plan: dbUser.plan });
    screenshotLimit = decision.screenshotLimit;
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Limit reached" }, { status: 402 });
  }

  const job = await prisma.scrapeJob.create({
    data: {
      userId: dbUser.id,
      store: "APP_STORE",
      appUrl: url,
      status: isQueueEnabled() ? "QUEUED" : "PROCESSING",
    },
  });

  try {
    if (isQueueEnabled()) {
      const q = getScrapeQueue();
      try {
        await q.add(
          "scrape",
          { scrapeJobId: job.id },
          { removeOnComplete: true, removeOnFail: true, attempts: 2, backoff: { type: "exponential", delay: 2000 } },
        );
        return NextResponse.json({ jobId: job.id, status: "QUEUED", screenshotLimit });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to enqueue job";
        await prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } }).catch(() => undefined);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    // Synchronous processing path
    const updated = await processScrapeJob(job.id, { screenshotLimit });
    return NextResponse.json({
      jobId: job.id,
      status: updated.status,
      zipUrl: updated.zipUrl,
      screenshotCount: updated.screenshotCount,
      screenshotLimit,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } }).catch(() => undefined);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

