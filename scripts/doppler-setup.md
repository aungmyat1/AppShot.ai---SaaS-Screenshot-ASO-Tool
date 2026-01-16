# Doppler Setup for getappshots

This document describes how to set up Doppler for managing secrets and environment variables in the getappshots project.

## What is Doppler?

Doppler is a secrets management platform that allows you to securely manage and deploy sensitive configuration data across environments without hardcoding values or storing them in source control.

## Why Use Doppler?

Based on the [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md), the project recommends a hybrid approach for secrets management:
- Vercel integrations for Clerk, Stripe, Database, Redis (automated)
- Doppler/1Password integration for Storage credentials (9 vars auto-synced)
- Vercel Sensitive Env Vars for remaining configs

## Setup Instructions

### Prerequisites

1. Install Doppler CLI:
   - **macOS**: `brew install dopplerhq/doppler/doppler`
   - **Ubuntu/Debian**: `curl -Ls https://cli.doppler.com/install.sh | sh`
   - **Windows**: `winget install doppler` or download from the [releases page](https://docs.doppler.com/docs/enclave-installation)

2. Sign up for a Doppler account at [doppler.com](https://doppler.com)

3. Login to Doppler CLI: `doppler login`

### Running the Setup Script

#### On Unix/Linux/macOS:
```bash
./scripts/doppler-setup.sh
```

#### On Windows:
```cmd
.\scripts\doppler-setup.bat
```

### Manual Setup

Alternatively, you can run the commands manually:

```bash
# Setup the project
doppler setup --project getappshots

# Create configurations for different environments
doppler configs create dev
doppler configs create staging
doppler configs create prod
```

### Adding Secrets

After setup, you'll need to add the required secrets for your application. Based on the [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md), you'll need:

#### For Web App (`apps/web`):

**Database**
```bash
doppler secrets set DATABASE_URL="your_postgresql_connection_string" --config dev
```

**Authentication (Clerk)**
```bash
doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key" --config dev
doppler secrets set CLERK_SECRET_KEY="your_clerk_secret_key" --config dev
```

**Payment (Stripe)**
```bash
doppler secrets set STRIPE_SECRET_KEY="your_stripe_secret_key" --config dev
doppler secrets set STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret" --config dev
doppler secrets set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key" --config dev
```

**Storage (S3/R2)**
```bash
doppler secrets set R2_ACCOUNT_ID="your_account_id" --config dev
doppler secrets set R2_BUCKET_NAME="your_bucket_name" --config dev
doppler secrets set R2_ACCESS_KEY_ID="your_access_key" --config dev
doppler secrets set R2_SECRET_ACCESS_KEY="your_secret_key" --config dev
```

#### For API (`apps/api`):

**Database**
```bash
doppler secrets set DATABASE_URL="your_postgresql_asyncpg_connection_string" --config dev
```

**Security**
```bash
doppler secrets set JWT_SECRET_KEY="your_secure_jwt_secret" --config dev
```

## Using Doppler in Development

To run your applications with Doppler-provided secrets:

```bash
# For the web app
doppler run -- npm run dev

# For the API
doppler run -- uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Using Doppler in Production

Doppler integrates with various deployment platforms. For Kubernetes, you can use External Secrets Operator with Doppler as the provider. For Vercel, you can use the Doppler integration to automatically sync secrets.

## Managing Multiple Environments

Update secrets for different environments using the `--config` flag:

```bash
# Update dev environment
doppler secrets set DATABASE_URL="dev_db_url" --config dev

# Update staging environment
doppler secrets set DATABASE_URL="staging_db_url" --config staging

# Update prod environment
doppler secrets set DATABASE_URL="prod_db_url" --config prod
```

## Troubleshooting

1. **Doppler CLI not found**: Make sure Doppler CLI is installed and in your PATH.

2. **Not authenticated**: Run `doppler login` to authenticate with your Doppler account.

3. **Missing secrets**: Use `doppler secrets list` to see all configured secrets.

4. **Wrong environment**: Use `doppler configs` to switch between configurations.

## Security Best Practices

1. Never commit secrets to version control
2. Use different secrets for each environment
3. Rotate secrets regularly
4. Use the principle of least privilege when setting up access controls
5. Monitor secret usage and access logs