# Vercel Protection Rules & Deployment Hooks

Configure **Protection Rules** and **Deploy Hooks** in Vercel so production is safe and CI/CD can trigger deployments without committing secrets.

---

## 1. Protection Rules (Vercel Dashboard)

**Path:** Vercel → Your Project → **Settings** → **Git**

### Recommended settings

| Setting | Value | Why |
|--------|--------|-----|
| **Production Branch** | `main` | Deploys from `main` go to production. |
| **Production Branch Protection** | **Require approval before deployment** | Prevents accidental production deploys; someone must approve in Vercel. |
| **Automatically cancel old deployments** | **Enabled** | Cancels in-progress builds when a newer commit is pushed (saves time and avoids stale deploys). |
| **Skipped builds** | **On commits with `[skip ci]`** | Pushing a commit message containing `[skip ci]` will not trigger a Vercel build. |
| **Password Protection** | **For preview deployments** (optional) | Protects preview URLs with a password so only your team can open them. |

### How to set them

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. Go to **Settings** → **Git**.
3. Set **Production Branch** to `main` (or your production branch).
4. Under **Deploy Protection** (or equivalent):
   - Turn on **Require approval before deployment** for production.
   - Turn on **Automatically cancel old deployments**.
   - Set **Ignore build step** / **Skipped builds** so builds are skipped when the commit message contains `[skip ci]` (Vercel uses this when connected to GitHub).
5. Under **Preview** (or **Deployment Protection**), enable **Password Protection** for preview deployments if you want.

---

## 2. Deployment Hooks

Deploy Hooks are URLs that trigger a deployment when called (e.g. from CI or scripts). **Never commit these URLs or tokens**—use environment variables or secret managers.

### Create Deploy Hooks in Vercel

1. Vercel → Your Project → **Settings** → **Git** → **Deploy Hooks**.
2. **Preview:** Create a hook (e.g. “Preview”) and optionally set a branch (e.g. `staging` or leave default). Copy the URL.
3. **Production:** Create a hook (e.g. “Production”) with no branch or branch = `main`. Copy the URL.

Store these URLs as secrets:

- **GitHub Actions:** Repository → Settings → Secrets → `VERCEL_DEPLOY_HOOK_PREVIEW`, `VERCEL_DEPLOY_HOOK_PRODUCTION`.
- **Doppler / env:** `VERCEL_DEPLOY_HOOK_PREVIEW`, `VERCEL_DEPLOY_HOOK_PRODUCTION`.
- **Local scripts:** Export in shell or use `.env.local` (and keep `.env.local` gitignored).

### Triggering deployments from scripts (no secrets in repo)

Use environment variables for the hook URLs:

```bash
# Preview deployment (optional: add ?branch=feature-branch to URL when creating the hook)
curl -X POST "${VERCEL_DEPLOY_HOOK_PREVIEW}"

# Production deployment (use the production hook URL from Vercel)
curl -X POST "${VERCEL_DEPLOY_HOOK_PRODUCTION}"
```

Or use the project scripts (read from env; cross-platform):

```bash
# Preview (uses VERCEL_DEPLOY_HOOK_PREVIEW)
npm run deploy:hook:preview

# Production (uses VERCEL_DEPLOY_HOOK_PRODUCTION)
npm run deploy:hook:prod
```

Shell alternative (Unix/macOS/Git Bash):

```bash
./scripts/deploy-hook.sh preview
./scripts/deploy-hook.sh production
```

**Never commit secrets.** Store hook URLs in Vercel Environment Variables, GitHub Secrets, or Doppler—not in the repo.

---

## 3. Best practices

- **Use branch protection** – Prevent direct pushes to `main` (e.g. require PR + review). Configure in GitHub: Repository → Settings → Branches → Branch protection rules.
- **Test in preview** – Always validate on a preview deployment before promoting to production.
- **Use descriptive branch names** – e.g. `feat/`, `fix/`, `chore/` for clarity and automation.
- **Monitor deployments** – Check Vercel → Deployments and logs for failed builds.
- **Set up alerts** – Use Vercel notifications or GitHub Actions to alert on failed deployments.
- **Use preview URLs** – Share preview links with stakeholders for review before production.
- **Clean up old branches** – Vercel automatically removes previews for deleted branches; periodically delete merged feature branches.

---

## 4. Related

- [Deploy to Vercel (integrations)](./DEPLOY_VERCEL_INTEGRATIONS.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Branch setup](../docs/BRANCH_SETUP_GUIDE.md)
