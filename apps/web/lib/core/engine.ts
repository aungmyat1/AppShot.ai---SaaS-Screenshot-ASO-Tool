import { CacheManager } from "@/lib/core/cache";
import { RateLimiter } from "@/lib/core/rateLimiter";
import type { AppMetadata, Screenshot, Store } from "@/lib/core/types";
import { parseAppStoreId, parsePlayPackageName, detectStore } from "@/lib/app-url";
import { scrapeAppStoreById } from "@/lib/scrape/app-store";
import { scrapePlayStoreByPackageName } from "@/lib/scrape/play-store";
import { scrapePlayStoreByPackageNamePlaywright } from "@/lib/scrape/play-store-playwright";

const cache = new CacheManager();
const limiter = new RateLimiter({ requestsPerMinute: Number(process.env.SCRAPE_RPM || 30) });

function toCoreStore(store: "APP_STORE" | "PLAY_STORE"): Store {
  return store === "APP_STORE" ? "appstore" : "playstore";
}

function nowIso() {
  return new Date().toISOString();
}

export async function scrapeCore(appUrl: string, opts?: { forceRefresh?: boolean }): Promise<{
  screenshots: Screenshot[];
  metadata: AppMetadata;
}> {
  const store = detectStore(appUrl);
  const coreStore = toCoreStore(store);

  const appId = store === "APP_STORE" ? parseAppStoreId(appUrl) : parsePlayPackageName(appUrl);

  if (!opts?.forceRefresh) {
    const cached = await cache.getCached(appId, coreStore);
    if (cached) return cached;
  }

  await limiter.wait();

  try {
    if (store === "APP_STORE") {
      const scraped = await scrapeAppStoreById(appId);
      const screenshots: Screenshot[] = scraped.screenshotUrls.map((url, index) => ({
        url,
        store: "appstore",
        appId,
        index,
        scrapedAt: nowIso(),
      }));
      const metadata: AppMetadata = {
        appId,
        store: "appstore",
        title: scraped.appName,
        developer: scraped.developer,
        screenshotCount: screenshots.length,
        lastUpdated: nowIso(),
      };
      await cache.setCached(appId, "appstore", screenshots, metadata);
      limiter.resetBackoff();
      return { screenshots, metadata };
    }

    const mode = (process.env.PLAY_SCRAPE_MODE || "html").toLowerCase();
    const doPlaywright = mode === "playwright";
    const allowFallback =
      process.env.PLAY_SCRAPE_FALLBACK_PLAYWRIGHT === "1" || process.env.PLAY_SCRAPE_FALLBACK_PLAYWRIGHT === "true";

    const scraped = doPlaywright
      ? await scrapePlayStoreByPackageNamePlaywright(appId)
      : await scrapePlayStoreByPackageName(appId).catch(async (e) => {
          if (!allowFallback) throw e;
          return scrapePlayStoreByPackageNamePlaywright(appId);
        });

    const screenshots: Screenshot[] = scraped.screenshotUrls.map((url, index) => ({
      url,
      store: "playstore",
      appId,
      index,
      scrapedAt: nowIso(),
    }));
    const metadata: AppMetadata = {
      appId,
      store: "playstore",
      title: scraped.appName,
      developer: scraped.developer,
      screenshotCount: screenshots.length,
      lastUpdated: nowIso(),
    };
    await cache.setCached(appId, "playstore", screenshots, metadata);
    limiter.resetBackoff();
    return { screenshots, metadata };
  } catch (e) {
    limiter.increaseBackoff();
    throw e;
  }
}

