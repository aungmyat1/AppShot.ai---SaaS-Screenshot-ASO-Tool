# Fix Lockfile Sync Issue

## Problem

Vercel deployment is failing with:
```
npm error Invalid: lock file's turbo@2.7.5 does not satisfy turbo@2.7.6
```

This means `package.json` specifies `turbo@2.7.6` but `package-lock.json` has `turbo@2.7.5`.

## Solution

### Option 1: Update Lockfile (Recommended)

Run this command to update `package-lock.json`:

```bash
npm install
```

This will:
- Update `package-lock.json` to match `package.json`
- Install the correct version of turbo (2.7.6)

Then commit and push:
```bash
git add package-lock.json
git commit -m "fix: update package-lock.json to sync with package.json (turbo 2.7.6)"
git push
```

### Option 2: If npm install fails (cache issues)

If you're getting cache errors, try:

```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json
rm package-lock.json

# Regenerate it
npm install

# Commit and push
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
git push
```

### Option 3: Manual Fix (if npm install still fails)

1. **Delete `package-lock.json`** (if it exists)
2. **Run `npm install`** to regenerate it
3. **Commit the new lockfile**
4. **Push to repository**

## Verification

After fixing, verify the lockfile is in sync:

```bash
npm run lockfile:check
```

Or manually check:
```bash
npm ci --dry-run
```

If this passes without errors, the lockfile is synced.

## Prevention

To avoid this in the future:

1. **Always commit `package-lock.json`** when updating dependencies
2. **Run `npm install`** (not `npm update`) when changing `package.json`
3. **Check lockfile sync** before pushing: `npm run lockfile:check`
4. **Use `npm ci`** in CI/CD (which requires lockfile to be in sync)

## Quick Fix Command

```bash
npm install && git add package-lock.json && git commit -m "fix: sync package-lock.json" && git push
```

---

**Note:** This fix needs to be done on a branch and pushed to trigger a new Vercel deployment.
