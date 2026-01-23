import { z } from "zod";

/**
 * Shared environment variable schema for the monorepo
 * 
 * Note: This is a minimal schema for shared config validation.
 * More comprehensive validation is done in apps/web/lib/env.ts
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(), // Optional to allow different env var names
  SCRAPE_QUEUE_MODE: z.enum(["sync", "queue", "on", "off"]).optional(), // Support both old and new values
  PLAY_SCRAPE_MODE: z.enum(["playwright", "fallback", "html"]).optional(), // Support both old and new values
});

// Use safeParse to avoid throwing errors during build if env vars are missing
// This allows the build to proceed and validation happens in app-specific schemas
export const env = envSchema.safeParse(process.env).data || {};
