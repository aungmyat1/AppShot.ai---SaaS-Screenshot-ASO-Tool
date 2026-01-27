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

## Package Management

This project uses npm workspaces and Turbo for monorepo management. To ensure consistent dependency installations across environments:

### Important: Maintaining package-lock.json

The `package-lock.json` file is essential for reliable builds in both local development and CI/CD environments:

- **For local development**: Run `npm install` when adding new dependencies or when the lockfile is missing/outdated
- **For CI/CD environments**: The `npm ci` command requires an up-to-date `package-lock.json` file
- **Before committing**: Always run `npm install` after modifying `package.json` and commit the updated `package-lock.json`

If you encounter `npm ci` errors, run this command to verify and fix lockfile synchronization:

```bash
node scripts/verify-lockfile.js
```

### Installing Dependencies

1. **Initial setup**: `npm install` (generates package-lock.json if missing)
2. **CI/CD environments**: `npm ci` (requires existing package-lock.json)
3. **Dependency updates**: `npm update` followed by `npm install` to update lockfile

## Branch Protection

This project implements branch protection rules to ensure code quality and enforce proper workflow practices:

- `main` branch: Protected with required pull request reviews, status checks, and up-to-date requirements
- `develop` branch: Protected with basic checks for ongoing development
- `staging` branch: Protected for pre-production validation

See [GITHUB_BRANCH_PROTECTION_GUIDE.md](GITHUB_BRANCH_PROTECTION_GUIDE.md) for detailed setup instructions.

## Quick Start

1. Install dependencies: `npm install`
2. Ensure Doppler CLI is installed: `doppler --version`
3. Verify Vercel CLI access: `vercel whoami`
4. Run locally: `doppler run -- npm run dev`