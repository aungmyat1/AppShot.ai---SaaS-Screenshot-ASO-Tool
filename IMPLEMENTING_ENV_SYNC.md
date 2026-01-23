# Implementing Doppler to Vercel Secrets Synchronization

This document describes how to properly implement the synchronization of secrets from Doppler to Vercel, which is essential for managing environment variables across different deployment environments.

## Overview

The project uses Doppler as the recommended secrets management solution. Secrets are synchronized from Doppler to Vercel using a dedicated script that ensures environment variables are properly configured across development, staging, and production environments.

## Prerequisites

Before implementing the sync process, ensure you have:

1. A Doppler account with your secrets configured
2. A Vercel account and project set up
3. The Doppler CLI installed locally (for development)
4. Appropriate permissions to manage both Doppler configs and Vercel projects

## Required Environment Variables

To perform the sync, you need to set the following environment variables:

```bash
# Vercel authentication token (keep this secure!)
export VERCEL_TOKEN="your-token"

# Vercel project identifier (ID is preferred over name)
export VERCEL_PROJECT_ID="your-project-id"
```

## Sync Process

### Production Environment

For production deployments, run:

```bash
# Set environment variables
export VERCEL_TOKEN="your-token"
export VERCEL_PROJECT_ID="your-project-id"

# Sync secrets
npm run env:sync:prod
```

### Other Environments

The project supports sync for different environments:

- Development: `npm run env:sync:dev`
- Preview (Staging): `npm run env:sync:preview`
- Production: `npm run env:sync:prod`

## How It Works

The sync process works as follows:

1. The script reads secrets from Doppler using the configured environment mapping:
   - `development` maps to Doppler `dev` config
   - `preview` maps to Doppler `staging` config
   - `production` maps to Doppler `prod` config

2. Each secret is sent to Vercel's API using an upsert operation, meaning:
   - New secrets are created if they don't exist
   - Existing secrets are updated with the new values
   - Secrets not present in Doppler are left unchanged in Vercel

3. Sensitive keys are automatically encrypted in Vercel, while others are stored as plain text

## Security Considerations

- Secrets containing keywords like "SECRET", "TOKEN", "PASSWORD", "PRIVATE", "DATABASE_URL", etc., are automatically marked as encrypted in Vercel
- The script does not log actual secret values in the output (they appear as "********")
- Secrets are never stored in the repository; they're managed exclusively through Doppler

## Verification Steps

After running the sync:

1. Check that all required environment variables are present in your Vercel dashboard
2. Verify that your deployed application can access the required environment variables
3. Test your application functionality that depends on these variables

## Troubleshooting

If you encounter issues:

1. Verify that your Doppler CLI is properly authenticated: `doppler configure set token <your_token>`
2. Ensure your VERCEL_TOKEN has the necessary permissions
3. Check that VERCEL_PROJECT_ID matches exactly with your Vercel project
4. Run the command with `--dry-run` flag to see what would happen without making changes

Example with dry run:
```bash
npm run env:dry-run
```

## Integration with Deployment Workflows

In CI/CD environments, ensure the following:
- Doppler CLI is installed in the runner environment
- VERCEL_TOKEN is properly set in the CI/CD secrets
- VERCEL_PROJECT_ID is configured for the environment
- The sync runs before deployment to ensure latest secrets are available