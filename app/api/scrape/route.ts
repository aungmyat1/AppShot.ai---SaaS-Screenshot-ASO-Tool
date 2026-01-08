import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { scrapeRequestSchema } from "@/lib/app-url";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isQueueEnabled, getScrapeQueue } from "@/lib/queue";
import { processScrapeJob } from "@/lib/core/process-scrape-job";

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
  if (dbUser.creditsBalance <= 0) {
    return NextResponse.json({ error: "Out of credits. Upgrade your plan to continue." }, { status: 402 });
  }

  // Reserve 1 credit immediately to prevent queue abuse; refund on failure.
  const job = await prisma.$transaction(async (tx) => {
    const j = await tx.scrapeJob.create({
      data: {
        userId: dbUser.id,
        store: "APP_STORE", // placeholder, updated later
        appUrl: url,
        status: isQueueEnabled() ? "QUEUED" : "PROCESSING",
      },
    });

    await tx.user.update({ where: { id: dbUser.id }, data: { creditsBalance: { decrement: 1 } } });
    await tx.creditLedger.create({ data: { userId: dbUser.id, scrapeJobId: j.id, delta: -1, reason: "SCRAPE_ZIP_RESERVED" } });

    return j;
  });

  try {
    if (isQueueEnabled()) {
      const q = getScrapeQueue();
      try {
        await q.add("scrape", { scrapeJobId: job.id }, { removeOnComplete: true, removeOnFail: true });
        return NextResponse.json({ jobId: job.id, status: "QUEUED" });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to enqueue job";
        // Refund reserved credit if enqueue fails.
        await prisma.$transaction([
          prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } }),
          prisma.user.update({ where: { id: dbUser.id }, data: { creditsBalance: { increment: 1 } } }),
          prisma.creditLedger.create({
            data: { userId: dbUser.id, scrapeJobId: job.id, delta: +1, reason: "REFUND_ENQUEUE_FAILED" },
          }),
        ]);
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    // Synchronous processing path
    const updated = await processScrapeJob(job.id);
    return NextResponse.json({
      jobId: job.id,
      status: updated.status,
      zipUrl: updated.zipUrl,
      screenshotCount: updated.screenshotCount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // In sync mode, `processScrapeJob` already marked FAILED + refunded.
    if (!isQueueEnabled()) {
      // ensure status reflects failure (best-effort)
      await prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } }).catch(() => undefined);
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

