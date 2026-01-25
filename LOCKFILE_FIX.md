# Lockfile Hygiene Fix

## Problem

`npm ci` fails on Vercel because `package.json` and `package-lock.json` don't match:

- `package.json` → `turbo@2.7.6`
- `package-lock.json` → `turbo@2.7.5`

## Why This Happens

`npm ci` has one strict rule: **package.json and package-lock.json must match EXACTLY**.

- `npm install` → updates `package-lock.json`
- `npm ci` → **never** updates it (CI = lockfile must already be correct)

## The Fix (Run Locally)

### Step 1: Update lockfile

```bash
npm install
```

This will:
- Reconcile `turbo@2.7.6` in package.json
- Update all platform binaries (darwin-64, darwin-arm64, linux-64, linux-arm64, windows-64, windows-arm64)
- Rewrite `package-lock.json` with correct versions and integrity hashes

### Step 2: Verify

```bash
npm run lockfile:check
```

This will confirm the lockfile is in sync.

### Step 3: Test npm ci locally (optional but recommended)

```bash
rm -rf node_modules
npm ci
```

If this passes locally → Vercel will pass.

### Step 4: Commit and push

```bash
git add package-lock.json
git commit -m "chore: sync turbo 2.7.6 lockfile"
git push
```

### Step 5: Redeploy

Vercel will automatically:
1. Run `npm ci` (from `vercel.json`)
2. ✅ Pass because lockfile matches

## What NOT to Do

❌ **Do NOT:**
- Run `npm ci` locally to "fix" it (it won't update the lockfile)
- Edit `package-lock.json` by hand (integrity hashes will be wrong)
- Downgrade turbo in package.json to match lockfile
- Disable `npm ci` on Vercel (use `npm install` instead)

These are **anti-patterns** that will cause more problems.

## Prevention

Always run `npm install` after:
- Updating a dependency version in `package.json`
- Adding a new dependency
- Removing a dependency

Then commit `package-lock.json` immediately.

## Quick Check Script

```bash
npm run lockfile:check
```

This script checks if `package.json` and `package-lock.json` are in sync.
