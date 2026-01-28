# Vercel Deployment Configuration - Verification

**Status**: ✅ **Configuration Verified and Correct**

---

## Current Configuration (`vercel.json`)

```json
{
  "buildCommand": "npx turbo run build --filter=getappshots",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "SCRAPE_QUEUE_MODE": "sync",
    "PLAY_SCRAPE_MODE": "html",
    "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT": "false"
  },
  "functions": {
    "apps/web/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## ✅ Configuration Verification

### 1. Build Command ✅
- **Value**: `npx turbo run build --filter=getappshots`
- **Status**: ✅ **CORRECT**
- **Reason**: 
  - Uses Turborepo to build the monorepo
  - Filters to only build the `getappshots` workspace
  - Matches the package name in `apps/web/package.json` (`"name": "getappshots"`)

### 2. Install Command ✅
- **Value**: `npm ci`
- **Status**: ✅ **CORRECT**
- **Reason**: 
  - Installs strictly from `package-lock.json` (no surprise deps)
  - Works with npm workspaces; all workspace deps are in the lockfile
  - Avoids 404s from bogus npm deps (e.g. `aiofiles` is PyPI-only, not npm)

### 3. Framework ✅
- **Value**: `nextjs`
- **Status**: ✅ **CORRECT**
- **Reason**: Web app is built with Next.js 15

### 4. Regions ✅
- **Value**: `["iad1"]`
- **Status**: ✅ **CORRECT**
- **Reason**: Washington D.C. (East) region - good for US-based users

### 5. Environment Variables ✅
- **SCRAPE_QUEUE_MODE**: `sync` ✅
  - Required for Vercel serverless functions
  - Matches configuration in `turbo.json` globalEnv
  
- **PLAY_SCRAPE_MODE**: `html` ✅
  - HTML parsing mode (fast, works on Vercel)
  - Matches configuration in `turbo.json` globalEnv
  
- **PLAY_SCRAPE_FALLBACK_PLAYWRIGHT**: `false` ✅
  - Disables Playwright (not recommended on Vercel)
  - Matches configuration in `turbo.json` globalEnv

**Note**: These variables are also declared in `turbo.json`:
- In `globalEnv` array ✅
- In build task `env` array ✅

### 6. Function Configuration ✅
- **Path**: `apps/web/app/api/**/*.ts`
- **maxDuration**: `60` seconds
- **Status**: ✅ **CORRECT**
- **Reason**: Allows API routes to run for up to 60 seconds (Vercel default is 10s)

---

## ✅ Turborepo Configuration (`turbo.json`)

### Environment Variables Declaration ✅

The same environment variables are properly declared in `turbo.json`:

```json
{
  "globalEnv": [
    "NODE_ENV",
    "SCRAPE_QUEUE_MODE",
    "PLAY_SCRAPE_MODE",
    "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT"
  ],
  "tasks": {
    "build": {
      "env": [
        // ... other vars ...
        "SCRAPE_QUEUE_MODE",
        "PLAY_SCRAPE_MODE",
        "PLAY_SCRAPE_FALLBACK_PLAYWRIGHT"
      ]
    }
  }
}
```

**Status**: ✅ **CORRECT** - Variables are in both `globalEnv` and build task `env`

---

## ✅ Package Configuration

### Workspace Package Name ✅
- **Package**: `apps/web/package.json`
- **Name**: `"getappshots"`
- **Matches Filter**: ✅ Yes - matches `--filter=getappshots`

---

## ✅ Verification Checklist

- [x] Build command uses correct Turborepo filter
- [x] Install command uses `npm ci` (lockfile-only install)
- [x] Framework preset is Next.js
- [x] Region is configured
- [x] Environment variables are set correctly
- [x] Environment variables are declared in turbo.json
- [x] Function timeout is appropriate (60s)
- [x] Package name matches filter

---

## 🎯 Deployment Readiness

**Status**: ✅ **READY FOR DEPLOYMENT**

All configuration is correct and verified:
- ✅ Monorepo structure properly configured
- ✅ Turborepo build command correctly filters workspace
- ✅ Environment variables properly declared
- ✅ Function timeouts appropriate
- ✅ Framework and region settings correct

---

## 📋 What This Configuration Does

1. **Install Phase**:
   - Runs `npm ci`
   - Installs all dependencies from lockfile (including workspaces)
   - Sets up the monorepo structure

2. **Build Phase**:
   - Runs `npx turbo run build --filter=getappshots`
   - Only builds the `getappshots` workspace (apps/web)
   - Uses Turborepo caching for faster builds

3. **Runtime**:
   - Environment variables from `vercel.json` are available
   - API routes can run up to 60 seconds
   - Deployed to `iad1` region

---

## 🚀 Next Steps

1. **Verify Vercel Dashboard Settings**:
   - Root Directory: `.` (repo root)
   - Framework: Next.js (auto-detected)
   - Build & Install commands should match `vercel.json`

2. **Deploy**:
   ```bash
   git push origin main
   ```
   - Vercel will automatically detect `vercel.json`
   - Configuration will be applied automatically

3. **Monitor**:
   - Check deployment logs
   - Verify build completes successfully
   - Test deployed application

---

---

## ⚠️ Troubleshooting

### `npm error 404 ... aiofiles@^24.7.0 ... Not found`
- **Cause**: `aiofiles` is a **Python** (PyPI) package, not npm. Something requested it via npm, hence 404.
- **Fix**:
  1. Use **`npm ci`** as Install Command (see `vercel.json`). It installs only from `package-lock.json`, so no extra npm deps are pulled.
  2. In **Vercel Dashboard** → Project → **Settings** → **General**: ensure **Install Command** is not overridden. If it is, clear it so `vercel.json`’s `installCommand` is used, or set it explicitly to `npm ci`.
  3. Ensure **Root Directory** is `.` (repo root) so the correct `
  ` / `package-lock.json` are used.

---

**Configuration Verified**: ✅ All settings are correct  
**Last Updated**: Current state  
**Next Action**: Configuration is ready, deploy when ready