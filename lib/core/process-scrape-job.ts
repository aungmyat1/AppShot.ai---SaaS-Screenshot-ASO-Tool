import { prisma } from "@/lib/prisma";
import { scrapeCore } from "@/lib/core/engine";
import { createZipFromImageUrls } from "@/lib/zip";
import { uploadBuffer, getDownloadUrl } from "@/lib/storage";

/**
 * Processes a queued scrape job:
 * - marks PROCESSING
 * - scrapes screenshots (cached/rate-limited)
 * - builds ZIP, uploads to storage
 * - marks COMPLETE (or FAILED + refunds credit)
 */
export async function processScrapeJob(scrapeJobId: string) {
  const job = await prisma.scrapeJob.findUnique({
    where: { id: scrapeJobId },
    include: { user: true },
  });

  if (!job) throw new Error("Scrape job not found");
  if (job.status === "COMPLETE") return job;
  if (job.status === "PROCESSING") return job;

  await prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "PROCESSING", error: null } });

  try {
    const core = await scrapeCore(job.appUrl, { forceRefresh: false });
    const screenshotUrls = core.screenshots.map((s) => s.url).slice(0, 30);

    await prisma.scrapeJob.update({
      where: { id: job.id },
      data: {
        store: core.metadata.store === "appstore" ? "APP_STORE" : "PLAY_STORE",
        appStoreId: core.metadata.store === "appstore" ? core.metadata.appId : null,
        packageName: core.metadata.store === "playstore" ? core.metadata.appId : null,
        appName: core.metadata.title ?? null,
        developer: core.metadata.developer ?? null,
        screenshotCount: screenshotUrls.length,
      },
    });

    const zip = await createZipFromImageUrls(
      screenshotUrls.map((u, idx) => ({ url: u, name: `screenshot-${String(idx + 1).padStart(2, "0")}.jpg` })),
      { maxBytes: 200 * 1024 * 1024 },
    );

    const clerkUserId = job.user.clerkId;
    const key = `${clerkUserId}/${job.id}/screenshots.zip`;
    await uploadBuffer({
      key,
      body: zip,
      contentType: "application/zip",
      cacheControl: "private, max-age=0, no-cache",
    });

    const downloadUrl = await getDownloadUrl({ key, expiresInSeconds: 3600 });

    const updated = await prisma.scrapeJob.update({
      where: { id: job.id },
      data: { status: "COMPLETE", zipObjectKey: key, zipUrl: downloadUrl, error: null },
    });

    return updated;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // Refund the reserved credit if job fails.
    await prisma.$transaction([
      prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } }),
      prisma.user.update({ where: { id: job.userId }, data: { creditsBalance: { increment: 1 } } }),
      prisma.creditLedger.create({ data: { userId: job.userId, scrapeJobId: job.id, delta: +1, reason: "REFUND_FAILED_SCRAPE" } }),
    ]);
    throw e;
  }
}

