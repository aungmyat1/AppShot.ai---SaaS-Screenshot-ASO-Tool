import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { scrapeRequestSchema } from "@/lib/app-url";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeScreenshots } from "@/lib/scrape";
import { uploadBuffer, getDownloadUrl } from "@/lib/storage";
import { createZipFromImageUrls } from "@/lib/zip";

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

  const job = await prisma.scrapeJob.create({
    data: {
      userId: dbUser.id,
      store: "APP_STORE", // placeholder, updated after scrape detection
      appUrl: url,
      status: "PROCESSING",
    },
  });

  try {
    const scraped = await scrapeScreenshots(url);
    const screenshotUrls = scraped.screenshotUrls.slice(0, 30);

    await prisma.scrapeJob.update({
      where: { id: job.id },
      data: {
        store: scraped.store,
        appStoreId: scraped.appStoreId ?? null,
        packageName: scraped.packageName ?? null,
        appName: scraped.appName ?? null,
        developer: scraped.developer ?? null,
        iconUrl: scraped.iconUrl ?? null,
        screenshotCount: screenshotUrls.length,
      },
    });

    const zip = await createZipFromImageUrls(
      screenshotUrls.map((u, idx) => ({ url: u, name: `screenshot-${String(idx + 1).padStart(2, "0")}.jpg` })),
      { maxBytes: 200 * 1024 * 1024 }, // 200MB safety cap
    );

    const key = `${userId}/${job.id}/screenshots.zip`;
    await uploadBuffer({
      key,
      body: zip,
      contentType: "application/zip",
      cacheControl: "private, max-age=0, no-cache",
    });

    const downloadUrl = await getDownloadUrl({ key, expiresInSeconds: 3600 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbUser.id },
        data: { creditsBalance: { decrement: 1 } },
      }),
      prisma.creditLedger.create({
        data: { userId: dbUser.id, scrapeJobId: job.id, delta: -1, reason: "SCRAPE_ZIP" },
      }),
      prisma.scrapeJob.update({
        where: { id: job.id },
        data: { status: "COMPLETE", zipObjectKey: key, zipUrl: downloadUrl },
      }),
    ]);

    return NextResponse.json({ jobId: job.id, zipUrl: downloadUrl, screenshotCount: screenshotUrls.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await prisma.scrapeJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: message },
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

