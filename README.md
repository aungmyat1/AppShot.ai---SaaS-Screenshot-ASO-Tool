# getappshots-monorepo

AppShot.ai is a SaaS platform for mobile app developers and marketers focused on App Store Optimization (ASO), providing automated generation and optimization of App Store and Google Play screenshots to improve app presentation and conversion rates.

## Environment Management

This project uses Doppler for secrets management and syncs these to Vercel environments. The configuration mapping is as follows:

| Vercel Environment | Doppler Config Name |
|--------------------|---------------------|
| development        | dev                 |
| preview            | preview             |
| production         | prd                 |

### Syncing Environment Variables

To sync environment variables from Doppler to Vercel:

```bash
npm run env:sync:dev      # Sync development environment
npm run env:sync:preview  # Sync preview environment  
npm run env:sync:prod     # Sync production environment
npm run env:check         # Verify environment variables
```

## Quick Start

1. Install dependencies: `npm install`
2. Ensure Doppler CLI is installed: `doppler --version`
3. Verify Vercel CLI access: `vercel whoami`
4. Run locally: `doppler run -- npm run dev`
