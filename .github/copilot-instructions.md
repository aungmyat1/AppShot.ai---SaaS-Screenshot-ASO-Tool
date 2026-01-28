# Copilot instructions — GetAppShots (AppShot.ai)

Quick orientation for AI coding agents working in this monorepo.

**Big picture:**
- **Monorepo**: uses npm workspaces + Turbo (see [package.json](package.json)).
- **Primary apps**: `apps/web` (Next.js UI + API routes), `apps/api` (Python/uvicorn service), `apps/admin` and `apps/worker` for background jobs.
- **Core responsibilities**: scraping (Play Store / App Store), ZIP creation, storage uploads, auth (Clerk), payments (Stripe), optional queueing (Redis + BullMQ).

**Where the important code lives**
- Core architecture and flow overview: [docs/AI_ASSISTANT_CONTEXT.md](docs/AI_ASSISTANT_CONTEXT.md)
- Next/React app + scraping engine: [apps/web/lib](apps/web/lib) — inspect `scrape/*`, `core/*`, `zip.ts`, `storage.ts`, `limits.ts`.
- Auth points: [apps/web/middleware.ts](apps/web/middleware.ts) and `app/sign-in`, `app/sign-up` routes.
- DB + ORM: Prisma schema under [apps/web/prisma/schema.prisma](apps/web/prisma/schema.prisma) and `lib/prisma.ts`.
- API surface: Next API routes under [apps/web/app/api](apps/web/app/api) (Stripe, jobs, scrape endpoints).
- Python API (internal): entrypoint run via `npm run api:dev` — see [package.json](package.json) and `apps/api`.
- Deployment & infra helpers: `scripts/*` (Doppler/Vercel sync, deploy helpers) and `vercel.json`.

**How to run & test locally (examples)**
- Install: `npm install` at repo root (workspaces will install subpackages).
- Local dev (recommended): `doppler run -- npm run dev` (uses Turbo to start applicable apps). See `dev` and `dev:doppler` in [package.json](package.json).
- Run only web dev: `npm run web:dev`.
- Run API (Python) in dev: `npm run api:dev` (runs `uvicorn` in `apps/api`).
- If testing queue mode: ensure `REDIS_URL` and set `SCRAPE_QUEUE_MODE=queue`. Quick Redis: `docker run --rm -p 6379:6379 redis:7-alpine`.
- Environment sync (Doppler → Vercel): `npm run env:sync:preview` (see `scripts/sync-doppler-to-vercel.js`).

**Project-specific patterns & conventions**
- Use workspace-scoped scripts where possible: e.g. `npm --workspace apps/web run build` (see many `web:*` scripts in [package.json](package.json)).
- `scripts/` contain operational logic (env sync, branch protection, deploy helpers) — prefer updating scripts over ad-hoc CI edits for infra tasks.
- Scrape logic prefers a sync-first flow; queue mode is opt-in via `SCRAPE_QUEUE_MODE`. Look for `process-scrape-job` and `engine.ts` to change job behavior.
- Storage is S3-compatible; check `lib/storage.ts` for R2 vs S3 branching.

**Integration points to watch**
- Clerk auth: missing or incorrect Clerk env keys cause middleware redirects — verify keys when debugging auth flows.
- Stripe: webhook is exposed at `/api/stripe/webhook` (ensure Vercel webhook secret set in project settings).
- Doppler & Vercel: secrets are the single source of truth here — use `env:sync` scripts rather than committing secrets.

**When editing code, quick checks to run**
- Lint: `npm run lint`
- Build: `npm run build`
- Dev run: `npm run dev` (or `doppler run -- npm run dev` when secrets needed)
- API dev (python): `npm run api:dev`

**References**
- Repo README: [README.md](README.md)
- AI context doc: [docs/AI_ASSISTANT_CONTEXT.md](docs/AI_ASSISTANT_CONTEXT.md)
- package scripts: [package.json](package.json)

If anything in this file is unclear or you'd like more detail about a specific area (scraping, queueing, or deployment), tell me which part and I'll expand or add examples/tests.
