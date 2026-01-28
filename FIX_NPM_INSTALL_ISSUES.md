# Fix: npm Install Issues - Permission Errors & Timeout

## Issues Found

1. **Permission Error (EPERM):** Cannot remove `node_modules/@aws-sdk/signature-v4-multi-region`
2. **Idle Timeout:** npm registry connection timed out

## Quick Fix

### Step 1: Close All Programs Using node_modules

**Common culprits:**
- VS Code / Cursor (if it has files open)
- Terminal windows
- Running Node.js processes
- Antivirus software scanning the folder

**Solution:**
```powershell
# Close all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Close all processes using the directory
# Then try again
```

### Step 2: Increase npm Timeout

```powershell
# Increase timeout to 10 minutes
npm config set fetch-timeout 600000
npm config set network-timeout 600000

# Try installing again
npm install
```

### Step 3: Clean Install (If Permission Issues Persist)

```powershell
# Close VS Code/Cursor first!

# Remove node_modules manually (if needed)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Try install again
npm install
```

## Alternative: Use npm ci (If package-lock.json Exists)

If you have a `package-lock.json` file:

```powershell
# This is faster and more reliable
npm ci
```

## If Permission Errors Continue

### Option 1: Run PowerShell as Administrator

1. Close all programs
2. Right-click PowerShell → "Run as Administrator"
3. Navigate to project:
   ```powershell
   cd "d:\ddev\getappshots\AppShot.ai---SaaS-Screenshot-ASO-Tool"
   ```
4. Remove node_modules:
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   ```
5. Install:
   ```powershell
   npm install
   ```

### Option 2: Use Robocopy to Force Delete (Windows)

```powershell
# Create empty directory
New-Item -ItemType Directory -Path "empty_dir" -Force

# Use robocopy to delete (weird but works!)
robocopy "empty_dir" "node_modules" /MIR /R:0 /W:0

# Remove empty dir
Remove-Item "empty_dir" -Force

# Remove node_modules
Remove-Item "node_modules" -Force -ErrorAction SilentlyContinue

# Install
npm install
```

### Option 3: Restart Computer

Sometimes Windows locks files and a restart is needed:
1. Save all work
2. Restart computer
3. Try `npm install` again

## Fix Timeout Issues

### Increase Timeouts

```powershell
# Set longer timeouts
npm config set fetch-timeout 600000
npm config set network-timeout 600000
npm config set maxsockets 1

# Try again
npm install
```

### Use Different Registry (If Slow)

```powershell
# Check current registry
npm config get registry

# Use official registry (if not already)
npm config set registry https://registry.npmjs.org/

# Try install
npm install
```

### Install with Retry

```powershell
# Install with retry on failure
npm install --fetch-retries=5 --fetch-retry-factor=2 --fetch-retry-mintimeout=20000
```

## Recommended: Complete Clean Install

```powershell
# 1. Close all programs (VS Code, terminals, etc.)

# 2. Remove node_modules and lockfile
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 3. Clear cache
npm cache clean --force

# 4. Increase timeouts
npm config set fetch-timeout 600000
npm config set network-timeout 600000

# 5. Install
npm install
```

## Verify Installation

After successful installation:

```powershell
# Check if installed
Test-Path node_modules
Test-Path package-lock.json

# Verify some packages
npm list --depth=0

# Run validation
npm run check:deployment
```

## If All Else Fails

### Use Yarn Instead

```powershell
# Install Yarn
npm install -g yarn

# Use Yarn instead
yarn install
```

### Install Workspace by Workspace

```powershell
# Install root first
npm install --workspace-root

# Then each workspace
npm install --workspace apps/web
npm install --workspace apps/api
```

## Build-Time Dependency Issues

### Error: Cannot find module 'autoprefixer' (or other build tools)

**Error message:**
```
Error: Cannot find module 'autoprefixer'
An error occurred in `next/font`.
```

**Root cause:**
- Build-time dependencies (like `autoprefixer`, `postcss`, `tailwindcss`, `prisma`) were in `devDependencies`
- On Vercel or other CI/CD platforms, these packages need to be in `dependencies` to be available during the build process
- Even though `npm ci` installs devDependencies by default, monorepo setups or certain configurations may not include them

**Solution:**
Move build-time dependencies from `devDependencies` to `dependencies`:

✅ **Should be in `dependencies`:**
- `autoprefixer` - Required for PostCSS processing
- `postcss` - Required for CSS processing
- `tailwindcss` - Required for Tailwind CSS compilation
- `prisma` - Required if `prisma generate` runs during build

✅ **Can stay in `devDependencies`:**
- Testing libraries (`jest`, `@testing-library/*`, `@playwright/test`)
- Type definitions (`@types/*`)
- Linting tools (`eslint`, `eslint-config-next`)
- Development tools (`tsx`, `typescript`)

**Fixed in:** `apps/web/package.json` - Moved `autoprefixer`, `postcss`, `tailwindcss`, and `prisma` to `dependencies`

## Understanding npm Warnings

### Common Warnings You May See

#### 1. Deprecation Warning: `node-domexception@1.0.0`

```
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
```

**What it means:**
- A transitive dependency (dependency of a dependency) is using the old `node-domexception@1.0.0`
- We have an override in `apps/web/package.json` for `node-domexception@^4.0.0`, but npm still warns about the old version being requested
- This is a **warning only** - it doesn't break functionality

**Action:** No action needed. The override ensures the newer version is used at runtime.

#### 2. Package Not Found: `turbo@2.7.6`

```
npm warn exec The following package was not found and will be installed: turbo@2.7.6
```

**What it means:**
- This is an **informational message**, not an error
- npm is telling you it's installing `turbo@2.7.6` because it's in `devDependencies` but wasn't in `node_modules`
- This is normal behavior during fresh installs or when dependencies are missing

**Action:** No action needed. This is expected behavior.

### When to Worry

⚠️ **These are NOT errors:**
- Deprecation warnings (they're just notifications)
- "Package not found and will be installed" messages
- Informational messages about package installation

❌ **These ARE errors:**
- `npm ERR!` messages
- Installation failures
- Permission errors (EPERM)
- Timeout errors

---

**Last Updated**: 2026-01-28
**Status**: Fixed build-time dependency issues (autoprefixer, postcss, tailwindcss, prisma moved to dependencies)
