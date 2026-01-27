# AGENTS.md

## Purpose
This file gives AI agents the minimum context needed to work safely in this
monorepo without guessing.

## Project overview
- **Product**: GetAppShots (SaaS for scraping app store screenshots)
- **Main app**: `apps/web` (Next.js App Router + TypeScript)
- **Admin UI**: `apps/admin` (Next.js app)
- **Optional API**: `apps/api` (FastAPI, used for long-running jobs)
- **Shared packages**: `packages/*`

## Key locations
- App URL validation: `apps/web/lib/app-url.ts`
- Scrape engine: `apps/web/lib/core/engine.ts`
- Queue/worker flow: `apps/web/lib/queue.ts`, `apps/web/server/worker.ts`
- Storage + ZIP handling: `apps/web/lib/storage.ts`, `apps/web/lib/zip.ts`
- Prisma schema: `apps/web/prisma/schema.prisma`
- Marketing + dashboard routes: `apps/web/app/*`

## Environment
- Use root workspace installs (`npm install`) with workspaces.
- Configure environment variables in `.env.local` for `apps/web`.
  - Example file: `apps/web/.env.example`
- The FastAPI app is optional and requires a Python venv + dependencies in
  `apps/api/requirements.txt`.

## Common commands
Root (turborepo):
- `npm run dev`
- `npm run build`
- `npm run lint`

Web app (explicit workspace):
- `npm --workspace apps/web run dev`
- `npm --workspace apps/web run build`
- `npm --workspace apps/web run start`
- `npm --workspace apps/web run lint`
- `npm --workspace apps/web run typecheck`
- `npm --workspace apps/web run test`
- `npm --workspace apps/web run e2e`
- `npm --workspace apps/web run worker`

API (optional FastAPI):
- `npm run api:dev` (expects Python env + requirements installed)

## Testing guidance
- Prefer the smallest relevant check (e.g. `web:lint` or `web:typecheck`).
- UI work should include Jest or Playwright when feasible.
- Queue/worker changes may require Redis; see `apps/web/lib/queue.ts`.

## Conventions
- Use existing patterns in `apps/web/components/ui/*` (shadcn-style).
- Keep changes scoped to the relevant app/workspace.
