# Rollback branch (pre–npm ci refactor)

Create a **separate branch** that points to the commit **before** `cc9fbcf` (“refactor(monorepo): switch to npm ci and update dependencies”). That branch keeps the pre-refactor state; `main` stays as-is.

---

## Create the rollback branch

**Option 1 – npm script (cross-platform):**

```bash
npm run branch:rollback
git push origin rollback/pre-npm-ci-refactor
```

**Option 2 – Git directly:**

```bash
# Create branch at the commit before cc9fbcf
git branch rollback/pre-npm-ci-refactor cc9fbcf^

# Push the new branch
git push origin rollback/pre-npm-ci-refactor
```

**Option 3 – PowerShell script:**

```powershell
.\scripts\create-rollback-branch.ps1
git push origin rollback/pre-npm-ci-refactor
```

**Option 4 – Bash (Git Bash / WSL):**

```bash
./scripts/create-rollback-branch.sh
git push origin rollback/pre-npm-ci-refactor
```

---

## Result

- **`main`** – unchanged (still includes the refactor commit).
- **`rollback/pre-npm-ci-refactor`** – points to the commit **before** the npm ci refactor; use this if you need to build or deploy from the old setup.

---

## Use the rollback branch

```bash
# Check out the rollback state
git checkout rollback/pre-npm-ci-refactor

# Or create a new branch from it
git checkout -b my-fix rollback/pre-npm-ci-refactor
```

---

## Optional: make main point to the rollback state

Only if you want **main** to be the pre-refactor state (rewrites history):

```bash
git checkout main
git reset --hard cc9fbcf^
git push origin main --force
```

Use with care on shared branches.

---

## Set up rollback and branches on Vercel

To have **develop**, **staging**, and the **rollback** branch deploy on Vercel (with `main` as production):

1. **Push the branches** (if not already):

   ```bash
   git push origin develop
   git push origin staging
   git push origin rollback/pre-npm-ci-refactor
   ```

2. **Vercel Dashboard → Project → Settings → Git**
   - **Production Branch**: `main` (deploys to Production).
   - Leave **Branch Deployments** enabled so every pushed branch gets a Preview.

3. **Active branches**
   - **main** → Production (Production env).
   - **develop** → Preview (Development/Preview env).
   - **staging** → Preview (Staging/Preview env).
   - **rollback/pre-npm-ci-refactor** → Preview (use same Preview env or a dedicated one if needed).

4. **Environment variables**
   - In **Settings → Environment Variables**, set variables per environment:
     - **Production** → used by `main`.
     - **Preview** → used by `develop`, `staging`, and `rollback/pre-npm-ci-refactor` (or use separate Preview vars per branch if you configure them in Vercel).
   - Optionally use **Development** for local `vercel dev`; Preview is used for branch deployments.

5. **Optional: limit which branches deploy**
   - In **Settings → Git → Ignored Build Step**, you can add a command so only `main`, `develop`, `staging`, and `rollback/*` build (e.g. exit 0 only for those branches); otherwise all branches get Preview builds by default.
