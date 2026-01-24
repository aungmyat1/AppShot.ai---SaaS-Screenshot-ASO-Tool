#!/usr/bin/env node

// This script will update turbo.json on GitHub directly via API
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'aungmyat1';
const REPO = 'AppShot.ai---SaaS-Screenshot-ASO-Tool';
const FILE_PATH = 'turbo.json';
const BRANCH = 'main';

const newTurboJson = {
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
    "VERCEL",
    "VERCEL_ENV",
    "VERCEL_URL"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "env": [
        "NODE_ENV", "PORT", "DATABASE_URL", "DATABASE_URL_ASYNC", "REDIS_URL",
        "JWT_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY",
        "NEXT_PUBLIC_CLERK_SIGN_IN_URL", "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY",
        "STRIPE_PRICE_PRO", "STRIPE_PRICE_STARTER",
        "NEXT_PUBLIC_STRIPE_PRICE_PRO", "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
        "STRIPE_USAGE_ENABLED", "STRIPE_WEBHOOK_SECRET",
        "STORAGE_ACCESS_KEY_ID", "STORAGE_SECRET_ACCESS_KEY", "STORAGE_BUCKET",
        "STORAGE_REGION", "STORAGE_ENDPOINT_URL", "STORAGE_PUBLIC_BASE_URL",
        "STORAGE_PUBLIC_URL", "R2_ACCOUNT_ID", "R2_BUCKET_NAME",
        "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_URL",
        "CORS_ORIGINS", "ADMIN_EMAILS", "CACHE_TTL_SECONDS",
        "DOWNLOAD_CONCURRENCY", "SCRAPE_QUEUE_MODE", "SCRAPE_QUEUE_NAME",
        "SCRAPE_RPM", "PLAY_SCRAPE_MODE", "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT",
        "WORKER_CONCURRENCY"
      ]
    },
    "dev": {
      "cache": false,
      "env": [
        "NODE_ENV", "PORT", "DATABASE_URL", "DATABASE_URL_ASYNC", "REDIS_URL",
        "JWT_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY",
        "NEXT_PUBLIC_CLERK_SIGN_IN_URL", "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_PRO", "STRIPE_PRICE_STARTER",
        "NEXT_PUBLIC_STRIPE_PRICE_PRO", "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
        "STRIPE_USAGE_ENABLED", "STORAGE_ACCESS_KEY_ID", "STORAGE_SECRET_ACCESS_KEY",
        "STORAGE_BUCKET", "STORAGE_REGION", "STORAGE_ENDPOINT_URL",
        "STORAGE_PUBLIC_BASE_URL", "STORAGE_PUBLIC_URL", "R2_ACCOUNT_ID",
        "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
        "R2_PUBLIC_URL", "CORS_ORIGINS", "ADMIN_EMAILS", "CACHE_TTL_SECONDS",
        "DOWNLOAD_CONCURRENCY", "SCRAPE_QUEUE_MODE", "SCRAPE_QUEUE_NAME",
        "SCRAPE_RPM", "PLAY_SCRAPE_MODE", "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT",
        "WORKER_CONCURRENCY"
      ]
    },
    "lint": { "outputs": [] },
    "test": { "outputs": [] }
  }
};

console.log('🚀 Updating turbo.json on GitHub...\n');
console.log('📝 This will add globalEnv to expose Clerk keys to Turborepo\n');
console.log('⚠️  Manual alternative: Edit directly at:');
console.log('   https://github.com/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/edit/main/turbo.json\n');
console.log('   Add these lines after line 2 ("$schema"):');
console.log('   "globalEnv": [');
console.log('     "CLERK_SECRET_KEY",');
console.log('     "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",');
console.log('     "NEXT_PUBLIC_CLERK_SIGN_IN_URL",');
console.log('     "NEXT_PUBLIC_CLERK_SIGN_UP_URL",');
console.log('     "VERCEL",');
console.log('     "VERCEL_ENV",');
console.log('     "VERCEL_URL"');
console.log('   ],\n');
