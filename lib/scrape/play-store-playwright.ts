import { chromium, type Browser, type BrowserContext } from "playwright";

import type { ScrapedApp } from "@/lib/scrape/app-store";

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function unescapePlayUrl(s: string) {
  return s
    .replace(/\\u003d/g, "=")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&");
}

/**
 * IMPORTANT: Proper Playwright lifecycle
 * - Create browser/context when needed
 * - Always close context + browser in finally to avoid leaks
 */
export class PlayStoreScraperCore {
  browser: Browser | null = null;
  context: BrowserContext | null = null;

  async initializeBrowser() {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage", "--no-sandbox"],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/120.0.0.0 Safari/537.36",
    });
  }

  async closeBrowser() {
    if (this.context) {
      await this.context.close().catch(() => undefined);
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close().catch(() => undefined);
      this.browser = null;
    }
  }
}

export async function scrapePlayStoreByPackageNamePlaywright(packageName: string): Promise<ScrapedApp> {
  const core = new PlayStoreScraperCore();
  await core.initializeBrowser();

  try {
    if (!core.context) throw new Error("Playwright context not initialized");

    const page = await core.context.newPage();
    const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}&hl=en&gl=US`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });

    // Let client-side rendering settle a bit (helps screenshots appear in DOM)
    await page.waitForTimeout(1_500);

    const html = await page.content();

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const iconMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const developerMatch = html.match(/<meta property="og:description" content="([^"]+)"/);

    const ogIcon = iconMatch?.[1] ? unescapePlayUrl(iconMatch[1]) : null;

    const matches =
      html.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+(?:=[^"\\\s<]*)?/g) ?? [];

    const screenshotUrls = uniq(matches)
      .map(unescapePlayUrl)
      .filter((m) => m.startsWith("https://play-lh.googleusercontent.com/"))
      .filter((m) => (ogIcon ? m !== ogIcon : true))
      .slice(0, 30);

    if (screenshotUrls.length === 0) {
      throw new Error("No screenshots found (Playwright render did not expose screenshot URLs).");
    }

    return {
      store: "PLAY_STORE",
      packageName,
      appName: titleMatch?.[1] ?? null,
      developer: developerMatch?.[1] ?? null,
      iconUrl: ogIcon,
      screenshotUrls,
    };
  } finally {
    await core.closeBrowser();
  }
}

