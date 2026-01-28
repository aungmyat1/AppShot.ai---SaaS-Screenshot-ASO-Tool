/**
 * Root-level environment validation for AppShot.ai
 * Use apps/web/lib/env.ts for full server validation in the web app.
 */

import {
  ENV_KEYS,
  REQUIRED_KEYS_DEV,
  REQUIRED_KEYS_PRODUCTION,
  getVercelEnvForBranch,
  type VercelEnv,
} from "../config/env.config";

export { getVercelEnvForBranch, type VercelEnv } from "../config/env.config";

export type EnvValidationResult = {
  valid: boolean;
  missing: string[];
  env: string;
};

/**
 * Validate that required env vars are set for current NODE_ENV.
 * Use in scripts or CI; apps use apps/web/lib/env.ts for full Zod validation.
 */
export function validateEnv(options?: {
  requiredKeys?: string[];
  nodeEnv?: string;
}): EnvValidationResult {
  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const requiredKeys =
    options?.requiredKeys ??
    (nodeEnv === "production" ? REQUIRED_KEYS_PRODUCTION : REQUIRED_KEYS_DEV);

  const missing = requiredKeys.filter(
    (key) => !process.env[key] || process.env[key]!.trim() === ""
  );

  return {
    valid: missing.length === 0,
    missing,
    env: nodeEnv,
  };
}

/**
 * All known env keys (from .env.example). Use for sync/validation tooling.
 */
export { ENV_KEYS };
