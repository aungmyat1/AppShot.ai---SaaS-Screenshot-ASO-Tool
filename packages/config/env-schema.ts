import { z } from "zod";

/**
 * Shared environment variable schema for the monorepo
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SCRAPE_QUEUE_MODE: z.enum(["on", "off"]),
  PLAY_SCRAPE_MODE: z.enum(["playwright", "fallback"]),
});

export const env = envSchema.parse(process.env);
