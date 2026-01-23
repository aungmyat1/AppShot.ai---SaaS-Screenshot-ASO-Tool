# Doppler-Vercel Integration - Quick Command Reference

> ⚠️ **Important**: When copying commands, **do NOT copy the markdown code fences** (```). Only copy the actual command lines inside the code blocks.

## 🔍 Verification

```bash
# Check integration status
npm run env:check:doppler
```

This command verifies:
- ✅ Doppler CLI installation and authentication
- ✅ Doppler project and configs
- ✅ Vercel CLI and authentication
- ✅ Environment variables sync status
- ✅ Configuration files

**Options**:

**Bash/Linux/macOS**:
```bash
# Check specific environment
npm run env:check:doppler -- --env=production

# Check specific config
npm run env:check:doppler -- --config=prod

# Verbose output
npm run env:check:doppler -- --verbose
```

**PowerShell (Windows)**:
```powershell
# Check specific environment
npm run env:check:doppler -- --env=production

# Or use the script directly (recommended for PowerShell)
node scripts/verify-doppler-vercel-integration.js --env=production

# Check specific config
node scripts/verify-doppler-vercel-integration.js --config=prod

# Verbose output
node scripts/verify-doppler-vercel-integration.js --verbose
```

---

## 🔄 Sync Secrets (Script-Based)

### Sync to Specific Environment

```bash
# Development environment
npm run env:sync:dev

# Preview/Staging environment
npm run env:sync:preview

# Production environment
npm run env:sync:prod
```

### Generic Sync Command

```bash
# Sync to default (development)
npm run env:sync

# Or use the script directly with options
node scripts/sync-doppler-to-vercel.js --env=production
```

### Advanced Options

```bash
# Dry run (test without making changes)
npm run env:dry-run

# Use specific Doppler config
node scripts/sync-doppler-to-vercel.js --env=production --config=prod

# Use allowlist (only sync specific secrets)
node scripts/sync-doppler-to-vercel.js --env=production --allowlist=.doppler-allowlist.txt

# Specify Vercel project
node scripts/sync-doppler-to-vercel.js --env=production --project=your-project-id

# Specify team
node scripts/sync-doppler-to-vercel.js --env=production --teamId=your-team-id
```

---

## 📋 Environment Variables Required

### For Script-Based Sync

**Bash/Linux/macOS**:
```bash
# Required
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_PROJECT_ID="your-project-id"

# Optional
export VERCEL_TEAM_ID="your-team-id"
export VERCEL_TEAM_SLUG="your-team-slug"
```

**PowerShell (Windows)**:
```powershell
# Required
$env:VERCEL_TOKEN="your-vercel-token"
$env:VERCEL_PROJECT_ID="your-project-id"

# Optional
$env:VERCEL_TEAM_ID="your-team-id"
$env:VERCEL_TEAM_SLUG="your-team-slug"
```

### For Verification

**Bash/Linux/macOS**:
```bash
# Optional (for Vercel project check)
export VERCEL_PROJECT_ID="your-project-id"
```

**PowerShell (Windows)**:
```powershell
# Optional (for Vercel project check)
$env:VERCEL_PROJECT_ID="your-project-id"
```

---

## 🎯 Common Workflows

### Initial Setup

```bash
# 1. Verify Doppler is set up
npm run env:check:doppler

# 2. Test sync (dry run)
npm run env:dry-run

# 3. Sync to development
npm run env:sync:dev

# 4. Verify sync worked
npm run env:check:doppler
```

### Before Production Deployment

**Bash/Linux/macOS**:
```bash
# 1. Verify production config exists
npm run env:check:doppler -- --env=production

# 2. Test sync (dry run)
node scripts/sync-doppler-to-vercel.js --env=production --dry-run

# 3. Sync to production
npm run env:sync:prod

# 4. Verify
npm run env:check:doppler -- --env=production
```

**PowerShell (Windows)**:
```powershell
# 1. Verify production config exists
node scripts/verify-doppler-vercel-integration.js --env=production

# 2. Test sync (dry run)
node scripts/sync-doppler-to-vercel.js --env=production --dry-run

# 3. Sync to production
npm run env:sync:prod

# 4. Verify
node scripts/verify-doppler-vercel-integration.js --env=production
```

### Regular Maintenancedoppler setup --project getappshots

```bash
# Weekly sync check
npm run env:check:doppler

# Sync all environments
npm run env:sync:dev
npm run env:sync:preview
npm run env:sync:prod
```

---

## 🔧 Troubleshooting Commands

```bash
# Check if Doppler CLI is installed
doppler --version

# Check Doppler authentication
doppler me

# List Doppler secrets
npm run env:list

# Check Vercel CLI
vercel --version

# Check Vercel authentication
vercel whoami

# List Vercel environment variables
vercel env ls production
```

---

## 📚 Related Commands

```bash
# Setup Doppler project
npm run doppler:setup

# Check general environment
npm run env:check

# Check Clerk environment
npm run env:check:clerk

# List all Doppler secrets
npm run env:list
```

---

## 💡 Tips

1. **Always use dry-run first**: Test syncs before applying changes
   ```bash
   npm run env:dry-run
   ```

2. **Verify after sync**: Always verify the sync worked
   ```bash
   npm run env:check:doppler
   ```

3. **Use environment variables**: Set `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` in your shell profile for convenience

4. **Check logs**: If sync fails, check the script output for detailed error messages

5. **Native integration**: For production, consider using the native Vercel integration (see [DOPPLER_VERCEL_INTEGRATION.md](./DOPPLER_VERCEL_INTEGRATION.md))

6. **Copying commands**: When copying from documentation, only copy the command itself, not the markdown code fences (```). PowerShell will error if you paste the fences.

---

## 📖 Full Documentation

For complete setup instructions and troubleshooting, see:
- **[DOPPLER_VERCEL_INTEGRATION.md](./DOPPLER_VERCEL_INTEGRATION.md)** - Complete integration guide
- **[QUICK_START_DOPPLER_VERCEL.md](./QUICK_START_DOPPLER_VERCEL.md)** - Quick setup guide
