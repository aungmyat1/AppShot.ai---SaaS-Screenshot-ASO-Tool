# Quick Start: Doppler to Vercel Integration

This is a quick reference guide for setting up Doppler to Vercel integration. For detailed instructions, see [DOPPLER_VERCEL_INTEGRATION.md](./DOPPLER_VERCEL_INTEGRATION.md).

## Native Integration (Recommended - 5 minutes)

### Step 1: Install Integration
1. Go to Vercel Dashboard → Your Project → Settings → Integrations
2. Search "Doppler" → Add Integration
3. Authorize connection

### Step 2: Configure Mappings
- Development → `dev` config
- Preview → `staging` config  
- Production → `prod` config

### Step 3: Add Secrets to Doppler
```bash
doppler secrets set SECRET_NAME="value" --config dev
doppler secrets set SECRET_NAME="value" --config staging
doppler secrets set SECRET_NAME="value" --config prod
```

**Done!** Secrets automatically sync to Vercel.

---

## Script-Based Sync (Alternative)

### Setup
```bash
# Set environment variables
export VERCEL_TOKEN="your-token"
export VERCEL_PROJECT_ID="your-project-id"

# Sync secrets
npm run env:sync:prod
```

### NPM Scripts
- `npm run env:sync:dev` - Sync to development
- `npm run env:sync:preview` - Sync to preview
- `npm run env:sync:prod` - Sync to production
- `npm run env:dry-run` - Test without changes
- `npm run env:check:doppler` - Verify integration

---

## Verification

```bash
# Check integration status
npm run env:check:doppler

# Or manually
node scripts/verify-doppler-vercel-integration.js
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Integration not syncing | Re-authorize in Vercel Dashboard |
| Wrong secrets | Check environment mappings |
| Script fails | Verify `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are set |

For more help, see [DOPPLER_VERCEL_INTEGRATION.md](./DOPPLER_VERCEL_INTEGRATION.md#troubleshooting).
