# Sync All Env with Vercel

One-place reference for the env file layout and how to keep Vercel in sync.

---

## Env file layout (recommended)

| File | Purpose | Commit? |
|------|---------|--------|
| `.env` | Local defaults (override with real values) | No – gitignored |
| `.env.example` | Template with keys only (no secrets) | Yes |
| `.env.local` | Local overrides (secrets) | No – gitignored |
| `.env.development` | Development defaults (optional) | Yes |
| `.env.staging` | Staging defaults (optional) | Yes |
| `.env.production` | Production defaults (optional) | Yes |
| `.env.test` | Test env (CI/local tests) | No – gitignored |
| `.env.test.example` | Test env template | Yes |

**Code/config:**

- `config/env.config.ts` – Env metadata (keys, Vercel mapping).
- `lib/env.ts` – Root env validation (`validateEnv()`, re-exports).
- `apps/web/lib/env.ts` – Full Zod validation for the web app.
- `.github/workflows/env-sync.yml` – Validate + sync Doppler → Vercel.

---

## How to sync env with Vercel

### 1. One-time: copy template and set values

```bash
cp .env.example .env.local
# Edit .env.local with real values (never commit)
```

### 2. Sync from Doppler to Vercel (recommended)

Requires: Doppler project with configs **dev**, **staging**, **prd** + `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` (and optional `VERCEL_TEAM_ID`) in Doppler or locally.

**Doppler config → Vercel environment:**

| Doppler config | Vercel environment | npm script |
|----------------|--------------------|------------|
| `dev` | Development | `npm run env:sync:dev` |
| `staging` | Preview | `npm run env:sync:staging` or `env:sync:preview` |
| `prd` | Production | `npm run env:sync:prod` |

**Test sync (dry-run, no writes to Vercel):**

```bash
npm run env:sync:test
```

Runs a dry-run for dev, staging (preview), and prod so you can confirm Doppler configs and tokens without changing Vercel.

**Run sync for each environment:**

```bash
# Dev (Doppler config: dev)
npm run env:sync:dev

# Staging / Preview (Doppler config: staging)
npm run env:sync:staging

# Production (Doppler config: prd)
npm run env:sync:prod

# All three
npm run env:sync:all
```

If your Doppler config for preview is named `preview` instead of `staging`, run:

```bash
node scripts/sync-doppler-to-vercel.js --env=preview --config=preview
```

### 3. Manual in Vercel Dashboard

1. Vercel → Your project → **Settings** → **Environment Variables**.
2. Add each key from `.env.example` (and optional `.env.development` / `.env.staging` / `.env.production`).
3. Set **Environment**: Development, Preview, and/or Production as needed.

### 4. GitHub Actions (automatic)

- **Env Sync** (`.github/workflows/env-sync.yml`): On push to `main` when env-related files change, runs validation and (if not “validate only”) syncs Doppler → Vercel.
- **Sync Doppler to Vercel** (`.github/workflows/sync-doppler-vercel.yml`): Manual or scheduled Doppler → Vercel sync.

Ensure repo secrets: `DOPPLER_TOKEN`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and optionally `VERCEL_TEAM_ID` / `VERCEL_TEAM_SLUG`.

---

## Validate env locally

```bash
# Check required keys from .env.example (uses process.env)
npm run env:check

# Check Clerk config
npm run env:check:clerk

# Check Doppler ↔ Vercel (requires tokens)
npm run env:check:doppler
```

---

## Best practices

- **Never commit** `.env`, `.env.local`, or any file with real secrets.
- **Do commit** `.env.example`, `.env.development`, `.env.staging`, `.env.production`, `.env.test.example` (placeholders only).
- Use **Doppler** (or similar) as source of truth and sync to Vercel via scripts or CI.
- Use **branch protection** on `main`; test in **preview** before production.
- Use **descriptive branch names** (`feat/`, `fix/`, `chore/`).

---

## Related

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Deploy Vercel Integrations](./DEPLOY_VERCEL_INTEGRATIONS.md)
- [Vercel Protection & Deploy Hooks](./VERCEL_PROTECTION_AND_DEPLOY_HOOKS.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
