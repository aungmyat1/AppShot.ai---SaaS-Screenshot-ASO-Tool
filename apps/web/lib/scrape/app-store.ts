import axios from "axios";

export interface ScrapedApp {
  store: "APP_STORE" | "PLAY_STORE";
  appName: string | null;
  developer: string | null;
  iconUrl: string | null;
  screenshotUrls: string[];
  appStoreId?: string;
  packageName?: string;
}

export async function scrapeAppStoreById(appStoreId: string): Promise<ScrapedApp> {
  const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(appStoreId)}&country=us`;
  const resp = await axios.get(lookupUrl, { timeout: 20_000 });

  const result = resp.data?.results?.[0];
  if (!result) throw new Error("App Store lookup returned no results.");

  const raw: string[] = [
    ...(Array.isArray(result.screenshotUrls) ? result.screenshotUrls : []),
    ...(Array.isArray(result.ipadScreenshotUrls) ? result.ipadScreenshotUrls : []),
  ];

  const screenshotUrls = Array.from(new Set(raw.filter((u) => typeof u === "string" && u.startsWith("http"))));
  if (screenshotUrls.length === 0) throw new Error("No screenshots found for this App Store app.");

  return {
    store: "APP_STORE",
    appStoreId,
    appName: result.trackName ?? null,
    developer: result.artistName ?? null,
    iconUrl: result.artworkUrl512 ?? result.artworkUrl100 ?? null,
    screenshotUrls,
  };
}

