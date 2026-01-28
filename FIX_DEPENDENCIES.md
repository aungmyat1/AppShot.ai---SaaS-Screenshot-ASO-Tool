# Fix: Dependencies Not Installed

## Issue

The validation script detected:
- ❌ Dependencies not installed
- ⚠️ `package-lock.json` is missing

## Quick Fix

Run this command in your terminal:

```powershell
# Navigate to project directory
cd "d:\ddev\getappshots\AppShot.ai---SaaS-Screenshot-ASO-Tool"

# Install all dependencies
npm install
```

**Note:** This may take several minutes for a monorepo with multiple workspaces.

## Alternative: Use npm ci (Faster, if lockfile exists)

If you have a `package-lock.json` file:

```powershell
npm ci
```

This is faster and ensures exact dependency versions.

## If npm install Fails

### Option 1: Clear Cache and Retry

```powershell
# Clear npm cache
npm cache clean --force

# Remove node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Remove package-lock.json (if corrupted)
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Reinstall
npm install
```

### Option 2: Install with Verbose Output

```powershell
# See what's happening
npm install --verbose
```

### Option 3: Install Workspace by Workspace

If the full install is too slow:

```powershell
# Install root dependencies first
npm install --workspace-root

# Then install each workspace
npm install --workspace apps/web
npm install --workspace apps/api
npm install --workspace packages/config
npm install --workspace packages/shared
npm install --workspace packages/types
npm install --workspace packages/ui
```

## Verify Installation

After installation completes:

```powershell
# Check if dependencies are installed
npm list --depth=0

# Verify package-lock.json exists
Test-Path package-lock.json

# Run the validation again
npm run check:deployment
```

## Expected Output

After successful installation:
- ✅ `node_modules/` directory created
- ✅ `package-lock.json` file created
- ✅ All workspace dependencies installed

## Troubleshooting

### If npm install is very slow:

1. **Check internet connection**
2. **Use a different registry (if needed):**
   ```powershell
   npm config set registry https://registry.npmjs.org/
   ```
3. **Increase timeout:**
   ```powershell
   npm config set fetch-timeout 600000
   ```

### If you get permission errors:

Run PowerShell as Administrator, then:
```powershell
npm install
```

### If you get "ENOENT" errors:

```powershell
# Make sure you're in the project root
cd "d:\ddev\getappshots\AppShot.ai---SaaS-Screenshot-ASO-Tool"

# Verify package.json exists
Test-Path package.json

# Then install
npm install
```

---

**Last Updated**: 2026-01-27
**Status**: Instructions to fix missing dependencies
