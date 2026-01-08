import { detectStore, parseAppStoreId, parsePlayPackageName } from "@/lib/app-url";
import { scrapeAppStoreById } from "@/lib/scrape/app-store";
import { scrapePlayStoreByPackageName } from "@/lib/scrape/play-store";

export async function scrapeScreenshots(appUrl: string) {
  const store = detectStore(appUrl);
  if (store === "APP_STORE") {
    const id = parseAppStoreId(appUrl);
    return scrapeAppStoreById(id);
  }
  const packageName = parsePlayPackageName(appUrl);
  return scrapePlayStoreByPackageName(packageName);
}

