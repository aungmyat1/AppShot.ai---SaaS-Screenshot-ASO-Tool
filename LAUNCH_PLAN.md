# Comprehensive Launch Plan for AppShot.ai SaaS Platform

Based on the AppShot.ai project structure and best practices, this plan covers pre-launch preparation, testing, staging, production, and post-launch activities.

**Timeline:** ~9 days to full launch (aggressive, parallel work)  
**Last updated:** 2026-01-25

---

## Current Condition (as of last update)

| Area | Status |
|------|--------|
| **Vercel** | `vercel.json` configured: `npm ci` install, `npx turbo run build --filter=getappshots`, Next.js, `iad1`, 60s API timeout. Auto-deploy on push to production branch when Git linked. |
| **Doppler** | Env sync via `npm run env:sync:dev` \| `env:sync:preview` \| `env:sync:prod`. Use for all secrets; avoid duplicating in Vercel. |
| **Preview / waitlist** | Dev-only `/preview` page: password gate + email collection (`WaitlistEmail`). Set `DEV_PASSWORD` in dev; APIs restricted to `NODE_ENV === "development"`. |
| **Monorepo** | Turborepo; app package `getappshots` in `apps/web`. Tests, typecheck, e2e live in `apps/web` — run via `npm --workspace apps/web run <script>`. |
| **Clerk** | Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Vercel/Doppler matches production Clerk app (e.g. `pk_live_...` for getappshots.com). Wrong key blocks deployment. |
| **Vercel install 404s** | If you see `aiofiles@^24.7.0` (or similar) 404: use `npm ci` as Install Command; clear any overrides in Vercel → Settings → General. See `VERCEL_DEPLOYMENT_CONFIGURATION.md` Troubleshooting. |
| **Lockfile hygiene** | `npm ci` requires `package.json` and `package-lock.json` to match exactly. Check with `npm run lockfile:check`. Fix: `npm install` → commit lockfile. See `LOCKFILE_FIX.md`. |

---

## Phase 1: Pre-Launch Preparation (Days 1–3)

**Parallel work:** Run environment setup, service config, and code verification simultaneously.

### 1.1 Environment Setup (Day 1)
- Set up Doppler project (if not done): `npm run doppler:setup`
- Configure environments: **Development**, **Staging** (preview), **Production**
- Populate required env vars; sync to Vercel: `npm run env:sync:dev` | `env:sync:preview` | `env:sync:prod`

### 1.2 Third-Party Service Configuration (Day 1–2)
- **Clerk**: production domains, auth settings; verify keys in Vercel/Doppler
- **Stripe**: `npm run stripe:sync` for products/prices; configure webhooks
- **Storage**: Cloudflare R2 or AWS S3 (env: `STORAGE_*` / `R2_*`)
- **Database**: PostgreSQL (e.g. Neon); run Prisma migrations if needed

### 1.3 Code and Dependency Verification (Day 1–2, parallel)
- **Lockfile check**: `npm run lockfile:check` (ensure `package.json` and `package-lock.json` match)
  - If mismatch: `npm install` → commit `package-lock.json` → push (see `LOCKFILE_FIX.md`)
- Install: `npm ci` (should pass after lockfile is synced)
- Typecheck: `npm --workspace apps/web run typecheck`
- Lint: `npm run lint`
- Build: `npm run build` (verify it works)

## Phase 2: Testing Strategy (Days 2–4)

**Parallel work:** Run unit tests while setting up integration tests; E2E in parallel with performance checks.

### 2.1 Unit Testing (Day 2)
```bash
npm --workspace apps/web run test
```
- Core functions, `lib/` utilities, pricing logic

### 2.2 Integration Testing (Day 2–3)
- Full user journey: signup → subscription
- DB operations, Clerk/Stripe/storage integrations
- Screenshot extraction (iOS & Android)

### 2.3 End-to-End Testing (Day 3)
```bash
npm --workspace apps/web run e2e
```
- Critical user workflows, subscription flows, downloads

### 2.4 Performance & Security (Day 3–4, minimal)
- Quick load test on screenshot extraction
- Basic security checks: auth flows, input validation, authorization
- **Note:** Full penetration testing can be post-launch

## Phase 3: Staging Validation (Days 4–5)

### 3.1 Staging Deployment (Day 4)
- Deploy via Vercel preview: `npm run env:sync:preview` → push to preview branch
- Smoke tests on staging URL
- Verify Vercel Install Command is `npm ci`

### 3.2 Quick Validation (Day 4–5)
- Internal team validation (critical paths only)
- Fix critical bugs immediately; defer non-critical fixes

## Phase 4: Production Preparation (Day 5)

### 4.1 Production Deployment (Day 5)
- Deploy to production: push `main` → Vercel production
- Verify monitoring, backups, SSL

### 4.2 Final Checks (Day 5)
```bash
npm run check:deployment
npm run deploy:check
```
- Verify external services (Clerk, Stripe, DB, storage)

## Phase 5: Soft Launch (Days 6–8)

### 5.1 Limited Release (Day 6)
- Launch to limited audience (early adopters, beta users)
- Monitor closely for 48 hours; ready to rollback

### 5.2 Quick Validation (Days 6–8)
- Monitor performance, user feedback, metrics
- Fix critical issues; iterate quickly

## Phase 6: Full Launch (Day 9+)

### 6.1 Full Launch (Day 9)
- Announce to full user base
- Execute marketing campaigns
- Monitor closely for first 48 hours

### 6.2 Post-Launch (Days 9–14)
- Active monitoring for first week
- Daily performance reviews
- Customer support readiness
- Rapid response plan for issues

---

## Timeline Summary

| Phase | Duration | Days |
|-------|----------|------|
| **Phase 1: Pre-Launch** | 3 days | 1–3 |
| **Phase 2: Testing** | 3 days | 2–4 (parallel) |
| **Phase 3: Staging** | 2 days | 4–5 |
| **Phase 4: Production Prep** | 1 day | 5 |
| **Phase 5: Soft Launch** | 3 days | 6–8 |
| **Phase 6: Full Launch** | Day 9+ | 9+ |
| **Total to Full Launch** | **~9 days** | **1–9** |

**Note:** Phases overlap where possible to compress timeline. Critical path is ~9 days to full launch.

## Technical Execution Commands

### Environment setup
```bash
npm run setup:services
npm run setup:database
npm run doppler:setup
# Sync env to Vercel (choose env):
npm run env:sync:dev    # development
npm run env:sync:preview
npm run env:sync:prod
# Optional checks:
npm run env:check
npm run env:check:clerk
npm run stripe:sync     # create Stripe products/prices
npm run stripe:check
```

### Testing
```bash
npm ci
npm run build
npm run lint
npm --workspace apps/web run typecheck
npm --workspace apps/web run test
npm --workspace apps/web run e2e
```

### Deployment
```bash
# Trigger deploy (or push to main)
npm run deploy:vercel
# Production: npm run deploy:production

# Readiness check
npm run check:deployment

# Monitor latest deployment
npm run deploy:check
npm run deploy:monitor   # watch mode
```

## Success Metrics

- User registration and activation rates
- Successful subscription conversion rates
- Screenshot extraction success rate
- System uptime and performance metrics
- Customer satisfaction scores
- Revenue growth metrics

## Rollback Plan

- Keep staging/preview aligned with production (same build, env pattern)
- Document rollback steps (Vercel: redeploy previous deployment, revert Git)
- Monitor closely for 24h post-launch
- Define and communicate rollback criteria (e.g. auth/payment outages, data issues)

---

## References

- **Vercel**: `vercel.json`, `VERCEL_DEPLOYMENT_CONFIGURATION.md`, `VERCEL_DEPLOYMENT_GUIDE.md`
- **Doppler / env**: `docs/DOPPLER_VERCEL_SETUP_COMPLETE.md`, `docs/QUICK_SETUP_SECRETS.md`
- **Project status**: `PROJECT_STATUS.md`, `DEPLOYMENT_CHECKLIST.md`
- **Preview / waitlist**: `/preview` (dev-only), `WaitlistEmail` model, `DEV_PASSWORD`

This launch plan aligns with the current AppShot.ai setup and ensures thorough testing and validation before go-live, with clear commands and safeguards. The timeline is compressed to ~9 days through parallel work and focused testing on critical paths.