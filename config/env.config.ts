/**
 * Environment configuration metadata for AppShot.ai
 * Used by scripts, CI, and env validation. No secrets – keys and mapping only.
 */

/** Vercel environment names */
export type VercelEnv = "development" | "preview" | "production";

/** Branch → Vercel environment (for Doppler sync and docs) */
export const VERCEL_ENV_MAP: Record<string, VercelEnv> = {
  main: "production",
  master: "production",
  staging: "preview",
  develop: "development",
  dev: "development",
} as const;

/** Default Vercel env when branch not in map (e.g. feature/*) */
export const VERCEL_ENV_DEFAULT: VercelEnv = "development";

/** Env file loaded by Next.js per NODE_ENV (optional files) */
export const NODE_ENV_TO_ENV_FILE: Record<string, string> = {
  development: ".env.development",
  test: ".env.test",
  production: ".env.production",
  staging: ".env.staging",
};

/** Keys that must be set for production (validation / docs) */
export const REQUIRED_KEYS_PRODUCTION: string[] = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "JWT_SECRET_KEY",
];

/** Keys required for local dev (can have placeholders) */
export const REQUIRED_KEYS_DEV: string[] = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
];

/** All env keys from .env.example (for validation and sync) */
export const ENV_KEYS = [
  "APP_URL",
  "DATABASE_URL",
  "DATABASE_URL_ASYNC",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "ADMIN_EMAILS",
  "R2_ACCOUNT_ID",
  "R2_BUCKET_NAME",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "STORAGE_ENDPOINT_URL",
  "STORAGE_BUCKET",
  "STORAGE_REGION",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
  "STORAGE_PUBLIC_BASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STRIPE_PRICE_PRO",
  "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_STARTER",
  "REDIS_URL",
  "SCRAPE_QUEUE_MODE",
  "PLAY_SCRAPE_MODE",
  "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT",
  "JWT_SECRET_KEY",
  "CORS_ORIGINS",
  "NODE_ENV",
  "PORT",
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];

/**
 * Get Vercel environment for current branch (for scripts/CI)
 */
export function getVercelEnvForBranch(branch: string): VercelEnv {
  const normalized = branch.toLowerCase();
  return VERCEL_ENV_MAP[normalized] ?? VERCEL_ENV_DEFAULT;
}
