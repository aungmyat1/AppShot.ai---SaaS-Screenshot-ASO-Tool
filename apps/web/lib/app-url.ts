import { z } from "zod";

export type Store = "APP_STORE" | "PLAY_STORE";

export const scrapeRequestSchema = z.object({
  url: z.string().trim().url(),
});

export function detectStore(inputUrl: string): Store {
  const u = new URL(inputUrl);
  if (u.hostname.includes("apps.apple.com")) return "APP_STORE";
  if (u.hostname.includes("play.google.com")) return "PLAY_STORE";
  throw new Error("Unsupported URL. Please use an iOS App Store or Google Play URL.");
}

export function parseAppStoreId(inputUrl: string): string {
  const u = new URL(inputUrl);
  const match = u.pathname.match(/id(\d+)/);
  if (match?.[1]) return match[1];
  const id = u.searchParams.get("id");
  if (id) return id;
  throw new Error("Could not find App Store app id in URL.");
}

export function parsePlayPackageName(inputUrl: string): string {
  const u = new URL(inputUrl);
  const id = u.searchParams.get("id");
  if (id) return id;
  throw new Error("Could not find Play Store package name (id=...) in URL.");
}

