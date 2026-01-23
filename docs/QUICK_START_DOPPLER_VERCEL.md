# Quick Start: Doppler to Vercel Integration

This is a quick reference guide for setting up Doppler to Vercel integration. For detailed instructions, see [DOPPLER_VERCEL_INTEGRATION.md](./DOPPLER_VERCEL_INTEGRATION.md).

> ⚠️ **Important**: When copying commands, **do NOT copy the markdown code fences** (```). Only copy the actual command lines inside the code blocks.

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

**Bash/Linux/macOS**:
```bash
# Set environment variables
export VERCEL_TOKEN="your-token"
export VERCEL_PROJECT_ID="your-project-id"

# Sync secrets
npm run env:sync:prod
```

**PowerShell (Windows)**:
```powershell
# Set environment variables
$env:VERCEL_TOKEN="your-token"
$env:VERCEL_PROJECT_ID="your-project-id"

# Sync secrets
npm run env:sync:prod
```

### NPM Scripts
- `npm run env:sync:dev` - Sync to development
- `npm run env:sync:preview` - Sync to preview
- `npm run env:sync:prod` - Sync to production
- `npm run env:dry-run` - Test without changes
- `npm run env:check:doppler` - Verify integration

> 📖 **For complete command reference**, see [DOPPLER_VERCEL_COMMANDS.md](./DOPPLER_VERCEL_COMMANDS.md)

---

## Verification

**Bash/Linux/macOS**:
```bash
# Check integration status
npm run env:check:doppler

# Or manually
node scripts/verify-doppler-vercel-integration.js
```

**PowerShell (Windows)**:
```powershell
# Check integration status (recommended for PowerShell)
node scripts/verify-doppler-vercel-integration.js

# Or using npm (may have issues with -- arguments)
npm run env:check:doppler
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Integration not syncing | Re-authorize in Vercel Dashboard |
| Wrong secrets | Check environment mappings |
| Script fails | Verify `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are set |
| PowerShell error: ```` is not recognized | You copied the markdown code fences. Only copy the command, not the ``` |
| PowerShell error: `--` operator issues | Use `node scripts/...` directly instead of `npm run ... -- --arg` |

For more help, see [DOPPLER_VERCEL_INTEGRATION.md](./DOPPLER_VERCEL_INTEGRATION.md#troubleshooting).
