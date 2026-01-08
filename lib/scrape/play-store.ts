import axios from "axios";

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

export async function scrapePlayStoreByPackageName(packageName: string): Promise<ScrapedApp> {
  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}&hl=en&gl=US`;
  const resp = await axios.get(url, {
    timeout: 20_000,
    headers: {
      // Reduce bot-blocking a bit; still may be blocked depending on environment.
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  const html: string = resp.data;

  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const iconMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const developerMatch = html.match(/<meta property="og:description" content="([^"]+)"/);

  const ogIcon = iconMatch?.[1] ? unescapePlayUrl(iconMatch[1]) : null;

  // Google Play is not an official API; HTML scraping can be brittle.
  // We combine two approaches:
  // 1) Find play-lh.googleusercontent.com URLs anywhere in HTML
  // 2) Prefer URLs that appear in AF_initDataCallback blobs (more screenshot-heavy)
  const allMatches =
    html.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+(?:=[^"\\\s<]*)?/g) ?? [];

  const afBlobs = html.match(/AF_initDataCallback\(\{[\s\S]*?\}\);/g) ?? [];
  const afMatches = afBlobs
    .join("\n")
    .match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+(?:=[^"\\\s<]*)?/g);

  const combined = uniq([...(afMatches ?? []), ...allMatches])
    .map(unescapePlayUrl)
    .filter((m) => m.startsWith("https://play-lh.googleusercontent.com/"))
    .filter((m) => (ogIcon ? m !== ogIcon : true))
    // Avoid obvious non-screenshot assets by preferring URLs with size directives (common for screenshots)
    .sort((a, b) => (b.includes("=w") ? 1 : 0) - (a.includes("=w") ? 1 : 0));

  const screenshotUrls = combined.slice(0, 30);

  if (screenshotUrls.length === 0) {
    throw new Error("No screenshots found (Play Store HTML may have changed or blocked the request).");
  }

  return {
    store: "PLAY_STORE",
    packageName,
    appName: titleMatch?.[1] ?? null,
    developer: developerMatch?.[1] ?? null,
    iconUrl: iconMatch?.[1] ?? null,
    screenshotUrls,
  };
}

