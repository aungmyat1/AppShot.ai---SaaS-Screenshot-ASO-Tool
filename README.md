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

## Environment Variable Synchronization

This project includes automated workflows to synchronize environment variables between Vercel and GitHub:

### GitHub Actions Workflows

Two workflows are included for bidirectional synchronization:

1. **Vercel → GitHub Sync** ([`.github/workflows/sync-vercel-env.yml`](file:///d:/ddev/getappshots/AppShot.ai---SaaS-Screenshot-ASO-Tool/AppShot.ai---SaaS-Screenshot-ASO-Tool/.github/workflows/sync-vercel-env.yml)):
   - Pulls environment variables from Vercel
   - Updates corresponding GitHub secrets and variables
   - Updates the `.env.example` template file
   - Runs daily at 8 AM UTC or can be triggered manually

2. **GitHub → Vercel Sync** ([`.github/workflows/sync-github-to-vercel.yml`](file:///d:/ddev/getappshots/AppShot.ai---SaaS-Screenshot-ASO-Tool/AppShot.ai---SaaS-Screenshot-ASO-Tool/.github/workflows/sync-github-to-vercel.yml)):
   - Pushes environment variables from GitHub to Vercel
   - Triggered when `.env.managed` file is updated
   - Requires a `.env.managed` file in the repository root

### Setup Requirements

To use these workflows, you need to configure the following secrets in your GitHub repository:

- `GH_PAT`: GitHub Personal Access Token with appropriate permissions
- `VERCEL_TOKEN`: Vercel access token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

See [SYNC_ENV_SETUP.md](file:///d:/ddev/getappshots/AppShot.ai---SaaS-Screenshot-ASO-Tool/AppShot.ai---SaaS-Screenshot-ASO-Tool/SYNC_ENV_SETUP.md) for detailed setup instructions.

### Manual Verification

You can verify your Clerk configuration using:

```bash
npm run clerk:verify-config
```

## Quick Start

1. Install dependencies: `npm install`
2. Ensure Doppler CLI is installed: `doppler --version`
3. Verify Vercel CLI access: `vercel whoami`
4. Run locally: `doppler run -- npm run dev`