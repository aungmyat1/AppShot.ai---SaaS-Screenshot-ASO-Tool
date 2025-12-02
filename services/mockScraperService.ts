import { AppData, StoreType, Screenshot } from "../types";
import { processAndUploadMock } from "./storageService";

export const validateUrl = (url: string): StoreType => {
  if (url.includes("play.google.com")) return StoreType.PLAY_STORE;
  if (url.includes("apps.apple.com")) return StoreType.APP_STORE;
  return StoreType.UNKNOWN;
};

const generateScreenshots = (count: number, type: 'phone' | 'tablet'): Screenshot[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `shot-${i}`,
    url: `https://picsum.photos/400/800?random=${Math.random()}`, // Vertical aspect for phone
    device: type,
    width: 1080,
    height: 1920
  }));
};

export const scrapeApp = async (url: string): Promise<AppData> => {
  // 1. Simulate scraping metadata (fast)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const storeType = validateUrl(url);
  const isPlay = storeType === StoreType.PLAY_STORE;
  const appId = Math.random().toString(36).substr(2, 9);
  
  const rawScreenshots = generateScreenshots(6, 'phone');

  // 2. Simulate the "Worker" pipeline: Optimization + R2 Upload
  // We process them concurrently as the worker would
  const processedScreenshots = await Promise.all(
    rawScreenshots.map((shot, index) => processAndUploadMock(shot, appId, index))
  );

  return {
    id: appId,
    name: isPlay ? "Mock Android App" : "Mock iOS App",
    developer: "Creative Solutions Ltd.",
    icon: `https://picsum.photos/200/200?random=${Math.random()}`,
    rating: 4.5,
    reviews: 1250,
    category: "Productivity",
    store: storeType,
    screenshots: processedScreenshots, // Return the "R2-hosted" screenshots
    description: "This is a revolutionary application that helps you organize your life with AI-powered features. Download now to experience productivity like never before.",
    scrapedAt: new Date().toISOString()
  };
};