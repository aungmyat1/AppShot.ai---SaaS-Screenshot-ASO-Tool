# Sync Script Fix - ENV_CONFLICT Error Resolution

## Problem

The `sync-doppler-to-vercel.js` script was failing with `ENV_CONFLICT` errors when trying to sync environment variables that already exist in Vercel.

**Error:** `A variable with the name 'X' already exists for the target production on branch undefined`

## Root Cause

The Vercel API's `upsert=true` parameter doesn't always work as expected when variables already exist, especially when they're configured for specific environments. The API returns `ENV_CONFLICT` errors instead of updating the existing variables.

## Solution

Updated the script to:

1. **Pre-fetch existing variables** - Cache all existing environment variables at the start
2. **Check before creating** - For each variable, check if it already exists
3. **Smart update logic**:
   - If variable exists with same value and type for target environment → Skip (already up-to-date)
   - If variable exists but needs update → Delete and recreate
   - If variable doesn't exist → Create new

## Changes Made

### 1. Added Caching for Existing Variables

```javascript
let existingEnvVarsCache = null;

async function getExistingEnvVars() {
  // Fetches and caches all existing env vars
}

async function getExistingEnvVar(key) {
  // Returns specific env var from cache
}
```

### 2. Updated `upsertEnvVar` Function

- Checks if variable exists before attempting to create
- Compares existing value/type with new value/type
- Deletes existing variable if update is needed
- Creates new variable after deletion

### 3. Improved Progress Reporting

- Shows skipped variables (already up-to-date)
- Better error messages
- Summary includes: Updated, Skipped, Failed counts

## Usage

The script works the same way:

```bash
# Sync production environment
npm run env:sync:prod

# Or with doppler
doppler run -- npm run env:sync:prod
```

## Benefits

1. ✅ **No more ENV_CONFLICT errors** - Handles existing variables properly
2. ✅ **Faster syncs** - Skips variables that are already up-to-date
3. ✅ **Better visibility** - Shows what was updated, skipped, or failed
4. ✅ **Idempotent** - Can run multiple times safely

## Testing

After the fix, running the sync should show:

```
Fetching existing Vercel environment variables...
Found 62 existing variables.
................................................................
Done. Updated 58 vars. Skipped 4 (already up to date). Failed 0.
```

Instead of the previous:
```
Done. Updated 4 vars. Failed 58.
```

## Notes

- The script now makes one additional API call at the start to fetch existing variables
- This is cached, so it doesn't impact performance for multiple variables
- Variables are only updated if their value or type has changed
