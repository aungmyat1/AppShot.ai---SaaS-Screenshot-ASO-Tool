import axios from "axios";

import type { ScrapedApp } from "@/lib/scrape/app-store";

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
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

  // Google Play is not an official API; HTML parsing is brittle.
  // This heuristic finds the image CDN URLs commonly used for screenshots.
  const matches = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+(?:=[^"\\\s<]*)?/g) ?? [];
  const screenshotUrls = uniq(
    matches
      .map((m) => m.replace(/\\u0026/g, "&"))
      .filter((m) => m.startsWith("https://play-lh.googleusercontent.com/")),
  ).slice(0, 30);

  if (screenshotUrls.length === 0) {
    throw new Error("No screenshots found (Play Store HTML may have changed or blocked the request).");
  }

  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const iconMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const developerMatch = html.match(/<meta property="og:description" content="([^"]+)"/);

  return {
    store: "PLAY_STORE",
    packageName,
    appName: titleMatch?.[1] ?? null,
    developer: developerMatch?.[1] ?? null,
    iconUrl: iconMatch?.[1] ?? null,
    screenshotUrls,
  };
}

