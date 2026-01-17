# Setup: Doppler as Source of Truth → Vercel Env Vars

This repo supports managing secrets with **Doppler** and syncing them into **Vercel Environment Variables**.

> **Note**: The repo also documents a "hybrid" approach using Vercel integrations for Clerk/Stripe/Postgres/KV. See `docs/RECOMMENDED_SECRETS_STRATEGY.md`.

> **Important**: After adding your `.env` file locally, use Doppler for production secrets. Never commit `.env` files to git (they're already in `.gitignore`).

## Prerequisites

- **Doppler CLI** installed and logged in
  - Windows: `winget install doppler`
  - Then: `doppler login`
- **Vercel token** with access to the project
  - Create in Vercel account settings

## 1) Configure Doppler

Create (or link) the Doppler project and configs:

```bash
npm run doppler:setup
```

By default this repo uses the config mapping:
- Vercel `development` → Doppler `dev`
- Vercel `preview` → Doppler `staging`
- Vercel `production` → Doppler `prod`

Add secrets to Doppler (example):

```bash
doppler secrets set DATABASE_URL="postgres://..." --config dev
doppler secrets set JWT_SECRET_KEY="..." --config dev
```

## 2) Sync Doppler → Vercel (local)

Set these environment variables in your shell:

- `VERCEL_TOKEN` (**required**)
- `VERCEL_PROJECT_ID` (**recommended**) or `VERCEL_PROJECT_NAME`
- `VERCEL_TEAM_ID` (optional, for team projects)

Then run one of:

```bash
npm run env:sync:dev
npm run env:sync:preview
npm run env:sync:prod
```

Dry run (prints what would change):

```bash
npm run env:dry-run -- --env=production
```

Optional: override Doppler config mapping:

```bash
node scripts/sync-doppler-to-vercel.js --env=production --config=prod
```

Optional: restrict what gets synced via an allowlist file:

```bash
node scripts/sync-doppler-to-vercel.js --env=production --allowlist=./env.allowlist.txt
```

Where `env.allowlist.txt` is one key per line:

```text
DATABASE_URL
JWT_SECRET_KEY
R2_ACCOUNT_ID
```

## 3) Verify environment variables

This checks that your current process has all keys from `.env.example` (and `apps/web/.env.example`):

```bash
npm run env:check
```

For local dev using Doppler:

```bash
npm run dev:doppler
```

## 4) CI sync (GitHub Actions)

Workflow: `.github/workflows/sync-env.yml`

Add these GitHub repository secrets:

- `DOPPLER_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID` (optional)

Then run the workflow manually (or push to `main` after changing `doppler.yaml` / sync script).

## Quick Reference

### Common Commands

```bash
# Local development with Doppler
npm run dev:doppler

# Sync all environments
npm run env:sync:dev
npm run env:sync:preview
npm run env:sync:prod

# Check if env vars are present
npm run env:check

# List Doppler secrets
npm run env:list
```

### Key Environment Variables

Based on your app structure, these are commonly needed:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - JWT signing secret
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `STRIPE_SECRET_KEY` - Stripe API secret
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Storage (R2 or S3):**
- `R2_ACCOUNT_ID` / `STORAGE_*` - Cloudflare R2 or AWS S3 credentials
- `R2_ACCESS_KEY_ID` / `STORAGE_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY` / `STORAGE_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME` / `STORAGE_BUCKET`

**Optional:**
- `REDIS_URL` - Redis connection (for queue/cache)
- `SCRAPE_QUEUE_MODE` - Queue mode (`sync` or `queue`)
- `PLAY_SCRAPE_MODE` - Scraping mode (`html` or `playwright`)

See `apps/web/.env.example` for the complete list.

## Troubleshooting

### "Missing VERCEL_TOKEN"
Set it in your shell: `export VERCEL_TOKEN=your_token_here` (or add to `.env.local` for local use)

### "Missing VERCEL_PROJECT_ID"
Either:
- Set `VERCEL_PROJECT_ID` environment variable
- Or pass `--project=your-project-name` to the sync script

### "Failed to fetch Doppler secrets"
- Ensure Doppler CLI is installed: `doppler --version`
- Ensure you're logged in: `doppler login`
- Check you're in the right project: `doppler setup`

### "Vercel API error 401"
- Your `VERCEL_TOKEN` is invalid or expired
- Generate a new token in Vercel account settings

### "Vercel API error 403"
- Your token doesn't have permission for this project
- Check team membership if using `VERCEL_TEAM_ID`
