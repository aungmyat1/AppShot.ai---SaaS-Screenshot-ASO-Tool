# Doppler to Vercel Integration Guide

This guide covers two approaches for integrating Doppler with Vercel:
1. **Native Vercel Integration** (Recommended) - Automatic sync via Vercel Dashboard
2. **Script-Based Sync** - Manual/CI-based sync using scripts

> ⚠️ **Important**: When copying commands from this guide, **do NOT copy the markdown code fences** (```). Only copy the actual command lines inside the code blocks. PowerShell will error if you paste the fences.

## Table of Contents

1. [Overview](#overview)
2. [Approach 1: Native Vercel Integration](#approach-1-native-vercel-integration-recommended)
3. [Approach 2: Script-Based Sync](#approach-2-script-based-sync)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Integrate Doppler with Vercel?

- ✅ **Centralized Secret Management**: Store all secrets in Doppler
- ✅ **Environment-Specific Configs**: Map Doppler configs to Vercel environments
- ✅ **Automatic Sync**: Secrets automatically available in Vercel deployments
- ✅ **Security**: Encrypted secrets, audit trails, rotation support
- ✅ **No Manual Updates**: Changes in Doppler automatically reflect in Vercel

### Integration Options

| Feature | Native Integration | Script-Based Sync |
|---------|-------------------|-------------------|
| Setup Complexity | Low (Dashboard) | Medium (Scripts + CI) |
| Automatic Sync | ✅ Yes | ⚠️ Via CI/Manual |
| Real-time Updates | ✅ Yes | ⚠️ On trigger |
| Maintenance | ✅ None | ⚠️ Script updates |
| Recommended For | Production | CI/CD pipelines |

---

## Approach 1: Native Vercel Integration (Recommended)

The native integration provides automatic, real-time sync of secrets from Doppler to Vercel.

### Prerequisites

1. **Doppler Account**
   - Sign up at [doppler.com](https://doppler.com)
   - Free tier is sufficient for most projects

2. **Doppler Project Setup**
   ```bash
   # Install Doppler CLI (if not already installed)
   # macOS
   brew install dopplerhq/doppler/doppler
   
   # Linux
   curl -Ls https://cli.doppler.com/install.sh | sh
   
   # Windows
   winget install doppler
   
   # Login to Doppler
   doppler login
   
   # Setup project (if not already done)
   doppler setup --project getappshots
   ```

3. **Doppler Configs Created**
   ```bash
   # Create environment-specific configs
   # Note: Each config requires an environment flag
   doppler configs create dev --environment development
   doppler configs create staging --environment staging
   doppler configs create prod --environment production
   
   # Or use the automated setup script:
   npm run doppler:setup
   ```

### Step-by-Step Setup

#### Step 1: Install Doppler Integration in Vercel

1. **Navigate to Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project (e.g., `getappshots`)

2. **Open Integrations**
   - Go to **Settings** → **Integrations**
   - Or directly: `https://vercel.com/[team]/[project]/settings/integrations`

3. **Add Doppler Integration**
   - Click **"Browse Integrations"** or search for "Doppler"
   - Find **"Doppler"** in the list
   - Click **"Add Integration"**

4. **Authorize Connection**
   - Click **"Connect"** or **"Authorize"**
   - You'll be redirected to Doppler to authorize Vercel
   - Click **"Authorize"** in Doppler
   - You'll be redirected back to Vercel

#### Step 2: Configure Environment Mappings

After authorization, configure which Doppler configs map to which Vercel environments:

1. **Select Doppler Project**
   - Choose your Doppler project: `getappshots`

2. **Map Configs to Environments**
   - **Development** → Select Doppler config: `dev`
   - **Preview** → Select Doppler config: `staging`
   - **Production** → Select Doppler config: `prod`

3. **Save Configuration**
   - Click **"Save"** or **"Update Integration"**

#### Step 3: Add Secrets to Doppler

Add your secrets to each Doppler config:

```bash
# Development config
doppler secrets set R2_ACCOUNT_ID="dev-account-id" --config dev
doppler secrets set R2_BUCKET_NAME="getappshots-dev" --config dev
doppler secrets set R2_ACCESS_KEY_ID="dev-key" --config dev
doppler secrets set R2_SECRET_ACCESS_KEY="dev-secret" --config dev
doppler secrets set STORAGE_ENDPOINT_URL="https://..." --config dev
doppler secrets set STORAGE_BUCKET="getappshots-dev" --config dev
doppler secrets set STORAGE_REGION="auto" --config dev
doppler secrets set STORAGE_ACCESS_KEY_ID="dev-key" --config dev
doppler secrets set STORAGE_SECRET_ACCESS_KEY="dev-secret" --config dev

# Staging config
doppler secrets set R2_ACCOUNT_ID="staging-account-id" --config staging
# ... (same variables, different values)

# Production config
doppler secrets set R2_ACCOUNT_ID="prod-account-id" --config prod
# ... (same variables, different values)
```

#### Step 4: Verify Sync

1. **Check Vercel Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - You should see secrets from Doppler automatically synced
   - They'll be marked with a Doppler icon or label

2. **Test Deployment**
   ```bash
   # Deploy to preview
   vercel
   
   # Check logs to verify secrets are available
   ```

### How It Works

- **Automatic Sync**: When you update secrets in Doppler, they automatically sync to Vercel
- **Environment Mapping**: Each Vercel environment (dev/preview/prod) gets secrets from its mapped Doppler config
- **Real-time Updates**: Changes are reflected immediately (may take a few seconds)
- **No Manual Steps**: Once configured, no scripts or CI needed

### Benefits

- ✅ **Zero Maintenance**: Set it and forget it
- ✅ **Real-time Sync**: Changes in Doppler immediately available in Vercel
- ✅ **Secure**: Secrets never exposed in logs or code
- ✅ **Audit Trail**: Track who changed what in Doppler
- ✅ **Rotation Support**: Rotate secrets in Doppler, automatically synced

---

## Approach 2: Script-Based Sync

Use this approach if you prefer CI/CD-based sync or need more control over the sync process.

### Prerequisites

1. **Doppler Service Token**
   ```bash
   # Create a service token for CI/CD
   doppler configs tokens create dev --name "vercel-sync-dev"
   doppler configs tokens create staging --name "vercel-sync-staging"
   doppler configs tokens create prod --name "vercel-sync-prod"
   ```

2. **Vercel Token**
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with appropriate permissions

3. **GitHub Secrets** (for CI/CD)
   - `DOPPLER_TOKEN` - Doppler service token
   - `VERCEL_TOKEN` - Vercel API token
   - `VERCEL_PROJECT_ID` - Your Vercel project ID
   - `VERCEL_TEAM_ID` - Your Vercel team ID (if applicable)

### Using the Sync Script

The project includes a sync script at `scripts/sync-doppler-to-vercel.js`:

```bash
# Sync to development
node scripts/sync-doppler-to-vercel.js --env=development

# Sync to preview
node scripts/sync-doppler-to-vercel.js --env=preview

# Sync to production
node scripts/sync-doppler-to-vercel.js --env=production

# Dry run (test without making changes)
node scripts/sync-doppler-to-vercel.js --env=production --dry-run

# Use specific Doppler config
node scripts/sync-doppler-to-vercel.js --env=production --config=prod

# Use allowlist (only sync specific secrets)
node scripts/sync-doppler-to-vercel.js --env=production --allowlist=.doppler-allowlist.txt
```

### NPM Scripts

The project includes convenient npm scripts:

```bash
# Sync to development
npm run env:sync:dev

# Sync to preview
npm run env:sync:preview

# Sync to production
npm run env:sync:prod

# Dry run
npm run env:dry-run
```

### GitHub Actions Workflow

The project includes a GitHub Actions workflow (`.github/workflows/sync-env.yml`) that:

- Syncs on push to `main` branch
- Can be manually triggered
- Supports environment selection

To use it:

1. **Add GitHub Secrets**:
   - `DOPPLER_TOKEN` - Doppler service token
   - `VERCEL_TOKEN` - Vercel API token
   - `VERCEL_PROJECT_ID` - Vercel project ID
   - `VERCEL_TEAM_ID` - Vercel team ID (optional)

2. **Trigger Sync**:
   - Automatic: Push to `main` branch
   - Manual: Go to Actions → "Sync Doppler -> Vercel Env Vars" → Run workflow

### Script Features

- ✅ **Upsert Mode**: Updates existing vars, creates new ones
- ✅ **Environment-Specific**: Maps Doppler configs to Vercel environments
- ✅ **Sensitive Detection**: Automatically encrypts sensitive keys
- ✅ **Allowlist Support**: Only sync specific secrets if needed
- ✅ **Dry Run**: Test without making changes

---

## Verification

### Check Integration Status

#### Native Integration

1. **Vercel Dashboard**
   - Go to **Settings** → **Integrations**
   - Verify Doppler integration shows as "Connected"
   - Check last sync time

2. **Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Look for secrets with Doppler icon/label
   - Verify they're set for correct environments

3. **Doppler Dashboard**
   - Go to [Doppler Dashboard](https://dashboard.doppler.com)
   - Check integration status
   - View sync logs

#### Script-Based Sync

Use the verification script:

```bash
# Check if secrets are synced
node scripts/verify-env.js

# Or manually check
vercel env ls
```

### Test Secret Access

1. **Deploy to Preview**
   ```bash
   vercel
   ```

2. **Check Build Logs**
   - Verify no secret-related errors
   - Check that secrets are accessible

3. **Test Application**
   - Verify features that require secrets work correctly
   - Check API calls, database connections, etc.

---

## Troubleshooting

### Native Integration Issues

#### Integration Not Syncing

**Problem**: Secrets not appearing in Vercel after adding to Doppler

**Solutions**:
1. Check integration status in Vercel Dashboard
2. Verify environment mappings are correct
3. Wait a few seconds (sync may take 10-30 seconds)
4. Re-authorize the integration if needed
5. Check Doppler dashboard for sync errors

#### Wrong Secrets Syncing

**Problem**: Wrong environment secrets appearing

**Solutions**:
1. Verify environment mappings in Vercel integration settings
2. Check which Doppler config is mapped to which Vercel environment
3. Ensure secrets are in the correct Doppler config

#### Integration Disconnected

**Problem**: Integration shows as disconnected

**Solutions**:
1. Re-authorize the integration
2. Check Doppler account status
3. Verify API permissions

### Script-Based Sync Issues

#### Script Fails with "Missing VERCEL_TOKEN"

**Solution**: Set the token:
```bash
export VERCEL_TOKEN="your-token"
# Or add to .env file
```

#### Script Fails with "Missing Vercel project"

**Solution**: Set project ID:
```bash
export VERCEL_PROJECT_ID="your-project-id"
# Or pass via --project flag
node scripts/sync-doppler-to-vercel.js --project=your-project-id --env=production
```

#### Doppler CLI Not Found

**Solution**: Install Doppler CLI (see Prerequisites)

#### Secrets Not Updating

**Solution**:
1. Verify Doppler config has the secrets
2. Check script is using correct config (`--config` flag)
3. Verify Vercel token has write permissions
4. Check for errors in script output

### General Issues

#### Secrets Not Available in Deployment

**Solutions**:
1. Verify secrets are set for the correct environment
2. Redeploy after adding/updating secrets
3. Check Vercel build logs for errors
4. Verify secret names match what code expects

#### Duplicate Secrets

**Problem**: Secrets appear twice (from integration and manual)

**Solution**:
- Remove manual duplicates
- Keep only the Doppler-synced versions
- Or disable native integration if using script-based sync

---

## Best Practices

### 1. Use Native Integration for Production

- Set it up once, works automatically
- Real-time sync
- No CI/CD overhead

### 2. Use Script-Based Sync for CI/CD

- More control over sync timing
- Can add custom logic
- Better for complex workflows

### 3. Environment Isolation

- Always use separate Doppler configs for each environment
- Never share secrets between environments
- Use different service tokens per environment

### 4. Secret Naming

- Use consistent naming across environments
- Prefix with service name (e.g., `R2_`, `STRIPE_`)
- Document secret purposes

### 5. Rotation

- Rotate secrets regularly
- Use Doppler's rotation features
- Test rotation in dev/staging first

### 6. Monitoring

- Monitor sync status regularly
- Set up alerts for sync failures
- Review audit logs periodically

---

## Migration from Manual to Doppler

If you currently have secrets manually set in Vercel:

1. **Export Current Secrets**
   ```bash
   vercel env ls > current-secrets.txt
   ```

2. **Add to Doppler**
   ```bash
   # For each secret, add to appropriate config
   doppler secrets set SECRET_NAME="value" --config dev
   ```

3. **Set Up Integration**
   - Follow "Approach 1" steps above

4. **Verify Sync**
   - Check secrets appear in Vercel
   - Compare values match

5. **Remove Manual Secrets**
   - Delete manual duplicates in Vercel
   - Keep only Doppler-synced versions

---

## Additional Resources

- [Doppler Documentation](https://docs.doppler.com)
- [Vercel Integrations](https://vercel.com/integrations)
- [Doppler Vercel Integration Guide](https://docs.doppler.com/docs/vercel)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Quick Reference

### Native Integration Setup
1. Vercel Dashboard → Settings → Integrations
2. Add Doppler integration
3. Authorize connection
4. Map configs to environments
5. Add secrets to Doppler configs

### Script-Based Sync
```bash
# Setup
export VERCEL_TOKEN="..."
export VERCEL_PROJECT_ID="..."

# Sync
npm run env:sync:prod
```

### Verification
```bash
# Check integration status
npm run env:check:doppler

# Or check in Vercel Dashboard
# Settings → Integrations

# Check synced secrets
vercel env ls

# Test deployment
vercel --prod
```

### Command Reference
For a complete command reference with all options and examples, see:
- **[DOPPLER_VERCEL_COMMANDS.md](./DOPPLER_VERCEL_COMMANDS.md)** - Complete command reference
