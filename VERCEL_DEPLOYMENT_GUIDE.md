# Vercel Production Deployment Guide

This guide explains how to properly deploy your AppShot application to Vercel so that your custom domains (`getappshots.com` and `www.getappshots.com`) will point to a production deployment.

## Current Status
Your domains are properly configured in Vercel's DNS settings but are not linked to any active production deployment.

## Deployment Solutions

### Solution 1: Using Git (Recommended)
Vercel deploys automatically when you push to your **production branch** (usually `main`). Ensure your project is connected to Git and the production branch is set in Vercel → Settings → Git.

```bash
# Ensure you're on your main branch
git checkout main

# Commit any pending changes
git add .
git commit -m "Prepare for production deployment"

# Push to your repository to trigger automatic deployment
git push origin main
```

**Verify auto-deploy on push to main:** Run `npm run check:git-deploy` (requires `VERCEL_TOKEN`). This checks Git connection, production branch, and that deployments on push are enabled. See [Check auto-deploy](#check-auto-deploy-on-push-to-main) below.

### Solution 2: Using the New Production Deployment Script
We've added a script to simplify the production deployment process:

```bash
# Run the production deployment script
npm run deploy:production
```

This script will:
- Verify Vercel CLI installation
- Log you into Vercel
- Link your local project to the Vercel project
- Build your application
- Deploy to Vercel in production mode

### Solution 3: Manual Vercel CLI Deployment
```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Login to your account
vercel login

# Link your project
vercel link

# Build your project
npm run build

# Deploy to production
vercel --prod
```

### Solution 4: Promote Existing Preview Deployment
If you have an existing preview deployment:
1. Go to your Vercel project dashboard
2. Navigate to the "Deployments" tab
3. Find your latest preview deployment
4. Click the three dots (...) menu next to it
5. Select "Promote to Production"

## Important Notes About Your Setup

### Next.js Standalone Output
Your application is configured with `output: "standalone"` in [next.config.mjs](./apps/web/next.config.mjs). This creates an optimized standalone server for production. Note that when using standalone output, you must use `node server.js` to run the production server, not `next start`.

### Environment Variables
Make sure all required environment variables are configured in your Vercel project:
- Clerk keys for authentication
- Database connection strings
- Stripe keys for billing
- AWS credentials for S3/R2 storage
- Any other service credentials

You can sync your Doppler environment variables to Vercel with:
```bash
npm run env:sync:prod
```

### Build Command
Your vercel.json specifies the build command as `npx turbo run build --filter=getappshots`, which builds only the getappshots app (our web application) using Turbo.

## Troubleshooting

### Domain Still Shows "No Deployment"
If after deploying your domain still shows "No Deployment":
1. Wait a few minutes as DNS propagation can take time
2. In your Vercel dashboard, go to Settings → Domains
3. Remove and re-add your custom domains
4. Ensure the deployment you made is promoted to production

### Build Failures
If the build fails:
1. Check that all required environment variables are set in Vercel
2. Verify that the build command in vercel.json matches your project needs
3. Ensure the `getappshots` workspace name matches your actual package name

### Verifying Deployment
To check your domain configuration after deployment:
```bash
vercel domains
```

### Check auto-deploy on push to main
To confirm that **new commits to `main` (or your production branch) trigger a new Vercel deployment**:

1. **Run the check script** (requires [Vercel token](https://vercel.com/account/tokens)):
   ```bash
   # PowerShell
   $env:VERCEL_TOKEN="your_token"; npm run check:git-deploy

   # Bash
   VERCEL_TOKEN=your_token npm run check:git-deploy
   ```
   Optionally set `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` if using a different project or team.

2. **In Vercel Dashboard:** Project → **Settings** → **Git**
   - **Connect Git Repository** — must be connected (e.g. GitHub).
   - **Production Branch** — set to `main` (or your production branch).
   - **Create Deployments** — ensure deployments on push are enabled (default).

3. **Quick test:** Push a small commit to `main` and watch the [Deployments](https://vercel.com/dashboard) tab for a new deployment.

## Verification Steps After Deployment

After deploying, verify everything works:
1. Visit https://getappshots.com and https://www.getappshots.com
2. Test various pages of your application
3. Verify that authentication works properly
4. Check that all environment-dependent features function
5. Confirm SSL certificates are properly configured

## Next Steps
Once deployed successfully:
1. Vercel will automatically assign your domains to the production deployment
2. Your sites will be live at:
   - https://getappshots.com
   - https://www.getappshots.com
3. The "No Deployment" message will disappear from your Vercel dashboard