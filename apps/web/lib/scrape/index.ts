import { detectStore, parseAppStoreId, parsePlayPackageName } from "@/lib/app-url";
import { scrapeAppStoreById } from "@/lib/scrape/app-store";
import { scrapePlayStoreByPackageName } from "@/lib/scrape/play-store";
import { scrapePlayStoreByPackageNamePlaywright } from "@/lib/scrape/play-store-playwright";

export async function scrapeScreenshots(appUrl: string) {
  const store = detectStore(appUrl);
  if (store === "APP_STORE") {
    const id = parseAppStoreId(appUrl);
    return scrapeAppStoreById(id);
  }
  const packageName = parsePlayPackageName(appUrl);

  const mode = (process.env.PLAY_SCRAPE_MODE || "html").toLowerCase();
  if (mode === "playwright") return scrapePlayStoreByPackageNamePlaywright(packageName);

  // Default: HTML scraping, with optional Playwright fallback.
  try {
    return await scrapePlayStoreByPackageName(packageName);
  } catch (err) {
    const allowFallback =
      process.env.PLAY_SCRAPE_FALLBACK_PLAYWRIGHT === "1" || process.env.PLAY_SCRAPE_FALLBACK_PLAYWRIGHT === "true";
    if (!allowFallback) throw err;
    return scrapePlayStoreByPackageNamePlaywright(packageName);
  }
}

