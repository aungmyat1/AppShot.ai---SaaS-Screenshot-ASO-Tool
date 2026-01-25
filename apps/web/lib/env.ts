import { z } from "zod";

/**
 * Server-side environment variable validation schema
 * 
 * This validates environment variables at startup to catch configuration errors early.
 * 
 * Note: 
 * - Variables marked as optional have fallbacks or are only needed in specific scenarios
 * - Storage variables support both STORAGE_* and R2_* naming (validated at runtime)
 * - Client-side (NEXT_PUBLIC_*) variables are validated separately in layout/middleware
 */
const serverEnvSchema = z.object({
  // Core
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional(),

  // Database - validate URL format if provided, but allow any string to prevent validation failures
  DATABASE_URL: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ), // Used by Prisma (required for web app)
  DATABASE_URL_ASYNC: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ), // For async operations if different from DATABASE_URL
  REDIS_URL: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ), // Optional - falls back to in-memory cache if not set

  // Security
  JWT_SECRET_KEY: z.string().min(32).optional(), // Only needed if using JWT auth (web app uses Clerk)

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(), // Required for payment processing
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(), // Required for webhooks
  STRIPE_PRICE_PRO: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_STARTER: z.string().startsWith("price_").optional(),
  STRIPE_USAGE_ENABLED: z.enum(["true", "false", "1", "0"]).optional(),

  // Storage - supports both STORAGE_* and R2_* variable names
  // At least one storage method must be configured (validated at runtime in storage.ts)
  STORAGE_BUCKET: z.string().min(1).optional(), // Or R2_BUCKET_NAME
  STORAGE_REGION: z.string().min(1).optional().default("auto"),
  STORAGE_ENDPOINT_URL: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ), // Required for R2, optional for AWS S3
  STORAGE_ACCESS_KEY_ID: z.string().optional(), // Or R2_ACCESS_KEY_ID
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(), // Or R2_SECRET_ACCESS_KEY
  STORAGE_PUBLIC_BASE_URL: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ), // For public file access
  STORAGE_PUBLIC_URL: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ), // Alias for STORAGE_PUBLIC_BASE_URL

  // R2-specific (alternative to STORAGE_*)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL format if provided" }
  ),

  // CORS
  CORS_ORIGINS: z.string().optional(), // Comma-separated list of allowed origins

  // Scraping configuration
  SCRAPE_QUEUE_MODE: z.enum(["sync", "queue"]).optional().default("sync"),
  PLAY_SCRAPE_MODE: z.enum(["html", "playwright"]).optional().default("html"),
  PLAY_SCRAPE_FALLBACK_PLAYWRIGHT: z.enum(["true", "false"]).optional().default("false"),

  // Runtime configuration
  ADMIN_EMAILS: z.string().optional(), // Comma-separated admin emails
  CACHE_TTL_SECONDS: z.string().optional(), // Cache TTL in seconds
  DOWNLOAD_CONCURRENCY: z.string().optional(), // Parallel downloads
  SCRAPE_RPM: z.string().optional(), // Scrape rate limit
  WORKER_CONCURRENCY: z.string().optional(), // Worker concurrency
  SCRAPE_QUEUE_NAME: z.string().optional(), // Queue name
});

/**
 * Validated server environment variables
 * 
 * This will throw an error at startup if required variables are missing or invalid.
 * Access via: import { serverEnv } from "@/lib/env"
 */
export const serverEnv = (() => {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    const errors = parsed.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(errors)) {
      if (messages) {
        console.error(`  ${key}: ${messages.join(", ")}`);
      }
    }
    throw new Error("Environment validation failed. Please check your .env file.");
  }

  return parsed.data;
})();

/**
 * Type-safe access to server environment variables
 */
export type ServerEnv = typeof serverEnv;
