# Environment Variable Sync Setup Guide

This guide explains how to set up the synchronization of environment variables between Vercel and GitHub for the AppShot.ai project.

## Required Secrets

To enable the synchronization workflows, you need to add the following secrets to your GitHub repository:

### 1. GitHub Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with the following scopes:
   - `repo`: Full control of private repositories
   - `workflow`: Update GitHub Actions workflows
   - `read:org`: Read organization membership
   - `read:user`: Access user profile info
   - `user:email`: Access user email addresses

### 2. Vercel Credentials

1. Vercel Token:
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with read/write permissions

2. Vercel Project Details:
   - From your Vercel project dashboard, find:
     - Project ID
     - Organization ID

## Adding Secrets to GitHub

1. Go to your GitHub repository → Settings → Secrets and Variables → Actions
2. Click "New repository secret" and add:

| Name | Description |
|------|-------------|
| `GH_PAT` | Your GitHub Personal Access Token |
| `VERCEL_TOKEN` | Your Vercel access token |
| `VERCEL_ORG_ID` | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

## Setting up the Managed Environment File

To enable two-way sync (GitHub → Vercel), create a `.env.managed` file in your repository root that contains environment variables you want to manage from GitHub:

```bash
# Example .env.managed
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
```

## Workflows

### 1. Vercel → GitHub Sync (`sync-vercel-env.yml`)
- Runs daily at 8 AM UTC or manually triggered
- Pulls environment variables from Vercel
- Updates corresponding GitHub secrets and variables
- Updates the `.env.example` template file

### 2. GitHub → Vercel Sync (`sync-github-to-vercel.yml`)
- Runs when `.env.managed` is updated
- Pushes environment variables from GitHub to Vercel
- Requires a `.env.managed` file in the repository root

## Security Best Practices

1. Never commit actual secrets to the repository
2. Only use the `.env.example` file for structural reference with placeholder values
3. The `.env.local` file should be used for local development and added to `.gitignore`
4. Review the sync regularly to ensure no unintended exposure of secrets
5. Limit the scope of the GitHub PAT to only necessary permissions

## Troubleshooting

### Workflow fails with authentication error
- Verify that all required secrets are correctly set
- Ensure the PAT has the necessary scopes

### Variables not syncing correctly
- Check that the format in `.env.managed` is `KEY=VALUE`
- Verify that the Vercel project ID and org ID are correct

### Duplicate variables
- The workflow attempts to remove and recreate variables to avoid duplicates
- If issues persist, manually remove the variable from Vercel dashboard and rerun the workflow