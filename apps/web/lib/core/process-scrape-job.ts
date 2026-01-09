import { prisma } from "@/lib/prisma";
import { scrapeCore } from "@/lib/core/engine";
import { createZipFromImageUrls } from "@/lib/zip";
import { uploadBuffer, getDownloadUrl } from "@/lib/storage";
import { recordStripeUsage } from "@/lib/billing/usage-record";

/**
 * Processes a queued scrape job:
 * - marks PROCESSING
 * - scrapes screenshots (cached/rate-limited)
 * - builds ZIP, uploads to storage
 * - marks COMPLETE (or FAILED)
 */
export async function processScrapeJob(scrapeJobId: string, opts?: { screenshotLimit?: number }) {
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
    const screenshotLimit = opts?.screenshotLimit ?? (job.user.plan === "FREE" ? 5 : 30);
    const screenshotUrls = core.screenshots.map((s) => s.url).slice(0, screenshotLimit);

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

    // Usage-based pricing (optional): report screenshot usage to Stripe metered billing item.
    if (
      (process.env.STRIPE_USAGE_ENABLED === "1" || process.env.STRIPE_USAGE_ENABLED === "true") &&
      job.user.plan === "PRO" &&
      job.user.stripeSubscriptionItemId
    ) {
      await recordStripeUsage({ subscriptionItemId: job.user.stripeSubscriptionItemId, quantity: screenshotUrls.length }).catch(
        () => undefined,
      );
    }

    return updated;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await prisma.scrapeJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } });
    throw e;
  }
}

