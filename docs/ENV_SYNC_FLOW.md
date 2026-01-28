# Environment Sync Flow – Overview

Single reference for how env flows from templates → local/Doppler → Vercel and which keys/values are correct.

---

## 1. Overall flow

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  .env.example       │     │  .env.local         │     │  Doppler            │
│  (template, commit) │────▶│  (local overrides,   │     │  dev / staging / prd│
│  + optional .env.*  │     │   gitignored)       │     │  (source of truth   │
└─────────────────────┘     └──────────┬──────────┘     │   for deployed env) │
                                        │                └──────────┬──────────┘
                                        │                           │
                                        ▼                           ▼
                               ┌─────────────────────────────────────────────┐
                               │  scripts/verify-env.js (env:check)           │
                               │  Loads .env + .env.local, checks keys       │
                               └─────────────────────────────────────────────┘
                                                           │
                                                           ▼
                               ┌─────────────────────────────────────────────┐
                               │  scripts/sync-doppler-to-vercel.js          │
                               │  Loads .env + .env.local for VERCEL_*       │
                               │  Fetches Doppler secrets → PATCH Vercel API  │
                               └─────────────────────────────────────────────┘
                                                           │
                                                           ▼
                               ┌─────────────────────────────────────────────┐
                               │  Vercel Environment Variables              │
                               │  Development | Preview | Production        │
                               └─────────────────────────────────────────────┘
```

- **Local:** `.env.example` is the template (committed). Copy to `.env.local` and fill values (gitignored). Optional: `.env.development`, `.env.staging`, `.env.production` (safe defaults, committed).
- **Validation:** `npm run env:check` loads `.env` + `.env.local` then checks that all keys from `.env.example` are set.
- **Sync:** `npm run env:sync:dev` / `env:sync:staging` / `env:sync:prod` (or `env:sync:all`) load `.env` + `.env.local` for `VERCEL_PROJECT_ID` / `VERCEL_TOKEN`, then push Doppler config (dev / staging / prd) to the matching Vercel environment.

---

## 2. Source of truth

| What | Source |
|------|--------|
| **Key list (validation / sync)** | Root `.env.example` + `config/env.config.ts` `ENV_KEYS` |
| **Required for production** | `config/env.config.ts` `REQUIRED_KEYS_PRODUCTION` |
| **Required for dev** | `config/env.config.ts` `REQUIRED_KEYS_DEV` |
| **Runtime validation (web app)** | `apps/web/lib/env.ts` (Zod schema) |
| **Deployed values** | Doppler configs: `dev`, `staging`, `prd` → Vercel Development, Preview, Production |

---

## 3. Doppler → Vercel mapping

| Doppler config | Vercel environment | npm script |
|----------------|--------------------|------------|
| `dev` | Development | `npm run env:sync:dev` |
| `staging` | Preview | `npm run env:sync:staging` or `env:sync:preview` |
| `prd` | Production | `npm run env:sync:prod` |

Override Doppler config: `node scripts/sync-doppler-to-vercel.js --env=preview --config=preview`.

---

## 4. All env keys and suitable values

From `config/env.config.ts` and `.env.example`. Values are examples; never commit real secrets.

### Required for production

| Key | Example / format |
|-----|-------------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` |
| `JWT_SECRET_KEY` | At least 32 characters, random |

### Required for local dev (can be placeholders)

| Key | Example / format |
|-----|-------------------|
| `DATABASE_URL` | As above |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` |
| `CLERK_SECRET_KEY` | `sk_test_...` |

### Optional / app and sync

| Key | Example / format |
|-----|-------------------|
| `APP_URL` | `http://localhost:3000` or production URL |
| `DATABASE_URL_ASYNC` | `postgresql+asyncpg://...` (if used by API) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `ADMIN_EMAILS` | Comma-separated emails |
| `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | R2 / S3-compatible storage |
| `STORAGE_ENDPOINT_URL`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` | Same as R2 or S3 |
| `STORAGE_PUBLIC_BASE_URL` | Public URL for assets (e.g. R2 public or CDN) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO`, `NEXT_PUBLIC_STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_STARTER` | `price_...` |
| `REDIS_URL` | `redis://localhost:6379` or Upstash URL |
| `SCRAPE_QUEUE_MODE` | `sync` (Vercel) or `queue` (worker) |
| `PLAY_SCRAPE_MODE` | `html` or `playwright` |
| `PLAY_SCRAPE_FALLBACK_PLAYWRIGHT` | `true` or `false` |
| `CORS_ORIGINS` | Comma-separated origins |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | `3000` |
| `VERCEL_DEPLOY_HOOK_PREVIEW`, `VERCEL_DEPLOY_HOOK_PRODUCTION` | Deploy hook URLs (never commit; use env or secrets) |

### Sync script only (not stored in app env)

| Key | Purpose |
|-----|--------|
| `VERCEL_TOKEN` | Vercel API token (Dashboard or Doppler) |
| `VERCEL_PROJECT_ID` | Vercel project ID (Settings → General) |
| `VERCEL_TEAM_ID` / `VERCEL_TEAM_SLUG` | If project is under a team |

---

## 5. Loading order (Next.js / scripts)

1. `.env`
2. `.env.local`
3. `.env.[NODE_ENV]` (e.g. `.env.development`)
4. `.env.[NODE_ENV].local` (e.g. `.env.development.local`)

Later files override earlier; `.env.local` overrides `.env`. Scripts `verify-env.js` and `sync-doppler-to-vercel.js` load `.env` and `.env.local` so local values are used when you run `npm run env:check` or `npm run env:sync:*`.

---

## 6. Checks and commands

| Command | What it does |
|--------|----------------------|
| `npm run env:check` | Loads .env + .env.local, checks keys from root `.env.example` |
| `npm run env:sync:test` | Dry-run sync for dev, preview, production (no Vercel writes) |
| `npm run env:sync:dev` | Sync Doppler `dev` → Vercel Development |
| `npm run env:sync:staging` | Sync Doppler `staging` → Vercel Preview |
| `npm run env:sync:prod` | Sync Doppler `prd` → Vercel Production |
| `npm run env:sync:all` | Sync all three environments |

---

## 7. CI (GitHub Actions)

- **env-sync.yml:** On push to `main` (env-related paths) or manual: validate with `verify-env.js`, then sync Doppler → Vercel using `DOPPLER_TOKEN`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` (and optional `VERCEL_TEAM_ID` / `VERCEL_TEAM_SLUG`).
- **sync-doppler-vercel.yml:** Manual or scheduled; syncs Doppler → Vercel (same secrets).

Ensure repo secrets are set; no `.env.local` in CI – Doppler and GitHub Secrets supply values.

---

## 8. Related

- [ENV_SYNC_WITH_VERCEL.md](./ENV_SYNC_WITH_VERCEL.md) – How to sync env with Vercel
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) – Branch → env mapping
- [VERCEL_PROTECTION_AND_DEPLOY_HOOKS.md](./VERCEL_PROTECTION_AND_DEPLOY_HOOKS.md) – Protection rules and deploy hooks
