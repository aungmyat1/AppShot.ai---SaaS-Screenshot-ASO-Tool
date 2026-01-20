# Vercel Deployment Fix for Monorepo

## Problem
The error `No workspaces found: --workspace=apps/web` occurs because Vercel wasn't properly configured for the Turborepo monorepo structure.

## Solution Applied

### 1. Updated `vercel.json`
Changed from:
- `buildCommand: npm --workspace apps/web run build`
- `installCommand: npm ci`

To:
- `buildCommand: npx turbo run build --filter=getappshots`
- `installCommand: npm install`

### 2. Vercel Dashboard Settings Required

Go to your Vercel project settings and configure:

#### General Settings
- **Root Directory**: `.` (leave as root, not `apps/web`)
- **Framework Preset**: Next.js
- **Node Version**: 20.x (or latest LTS)

#### Build & Development Settings
These should now be picked up from `vercel.json`, but verify:
- **Build Command**: `npx turbo run build --filter=getappshots`
- **Install Command**: `npm install`
- **Output Directory**: Leave blank (Next.js handles this)

### 3. Environment Variables
Make sure all required environment variables are set in Vercel:
- All Clerk variables (NEXT_PUBLIC_CLERK_*, CLERK_SECRET_KEY)
- Database URLs
- Stripe keys
- AWS/S3 credentials
- Redis connection string
- Any other secrets from your `.env` file

### 4. Alternative Approach (If Above Doesn't Work)

If the turbo filter approach doesn't work, you can:

**Option A: Deploy from subdirectory**
1. In Vercel Dashboard → Settings → General
2. Set **Root Directory** to: `apps/web`
3. Update `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

**Option B: Use workspace command differently**
Update `vercel.json`:
```json
{
  "buildCommand": "npm run build --workspace=apps/web",
  "installCommand": "npm install --workspaces"
}
```

## Verification Steps

1. **Push changes**: `git push`
2. **Monitor deployment**: Check Vercel dashboard logs
3. **Test build locally**: 
   ```bash
   npm install
   npx turbo run build --filter=getappshots
   ```

## Common Issues

### Issue: "Module not found" during build
**Solution**: Make sure all workspace packages are installed:
```bash
npm install
npm install --workspaces
```

### Issue: Prisma client not generated
**Solution**: The `apps/web/package.json` build script already includes `prisma generate`, but verify it runs before `next build`.

### Issue: Build takes too long / times out
**Solution**: 
1. Enable Turborepo Remote Caching in Vercel
2. Or increase build timeout in Vercel settings

## Testing Locally

Before deploying, test the exact build command:

```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install

# Test build
npx turbo run build --filter=getappshots

# Should succeed without errors
```

## Reference
- [Vercel Turborepo Guide](https://vercel.com/docs/monorepos/turborepo)
- [Turborepo Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
