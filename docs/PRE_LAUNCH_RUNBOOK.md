# Pre-launch runbook

Use this checklist before launching AppShot.ai to production.

## 1. Run full test suite locally

```bash
# Lint and typecheck
npm run lint
npm --workspace apps/web run typecheck

# Unit tests (web + API)
npm run test

# E2E (web; requires build)
npm --workspace apps/web run build
npm --workspace apps/web run e2e
```

## 2. Confirm environment

- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for target env (test vs live).
- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs for target env.
- **Database**: `DATABASE_URL` for staging/production.
- **Redis** (if using queue): `REDIS_URL` and `SCRAPE_QUEUE_MODE=queue`.
- **Stripe webhook**: Configure webhook URL to `POST /api/stripe/webhook` (or `/api/webhooks/stripe`) for the deployed base URL.

## 3. Test one full flow on staging

1. Sign up / sign in at staging URL.
2. Open dashboard.
3. Submit a scrape (or stub) and confirm job appears.
4. Open billing / upgrade and confirm Stripe Checkout (test mode) or redirect.

## 4. Confirm worker (if using queue mode)

If `SCRAPE_QUEUE_MODE=queue`:

- Worker process is running (e.g. `npm run web:worker` or your deployment runner).
- Redis is reachable; jobs enqueued from the web app are consumed. See [docs/AI_ASSISTANT_CONTEXT.md](AI_ASSISTANT_CONTEXT.md) for queue testing.

## 5. Deployment readiness script

```bash
npm run check:deployment
```

Resolve any failures before deploying to production.

## 6. Post-deploy

- Set `STAGING_HEALTHCHECK_URL` / `PROD_HEALTHCHECK_URL` in CD secrets to your deployed `/api/health` URL so CD can run a post-deploy health check.
- Optionally run E2E against staging URL after deploy (e.g. scheduled or manual run with `PLAYWRIGHT_BASE_URL=<staging-url>`).
