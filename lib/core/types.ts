export type Store = "playstore" | "appstore";

export interface Screenshot {
  url: string;
  store: Store;
  appId: string;
  index: number;
  resolution?: string | null;
  deviceType?: "phone" | "tablet" | "desktop" | null;
  scrapedAt: string; // ISO
}

export interface AppMetadata {
  appId: string;
  store: Store;
  title?: string | null;
  developer?: string | null;
  category?: string | null;
  rating?: number | null;
  lastUpdated?: string | null;
  screenshotCount: number;
}

