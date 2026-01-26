# Sync Script Fix V2 - Enhanced ENV_CONFLICT Handling

## Problem Analysis

After the initial fix, the script was still encountering `ENV_CONFLICT` errors. Analysis shows:

1. **195 existing variables found** - Script correctly fetches existing variables
2. **Still getting ENV_CONFLICT** - Variables exist but update logic isn't working correctly
3. **Deletion failures** - Some variables (like `VERCEL_TOKEN`) can't be deleted

## Root Causes

1. **Multiple Environment Entries**: Variables can exist as separate entries for different environments
2. **Protected Variables**: Some variables (VERCEL_TOKEN, VERCEL_PROJECT_ID) are protected and can't be deleted
3. **PATCH Failures**: PATCH requests might fail for various reasons (permissions, API changes)
4. **Cache Staleness**: Variable might be created/updated between our check and operation

## Enhanced Solution

### 1. Improved Variable Lookup

- Finds ALL variables with the same key (not just first match)
- Prioritizes variables that have the target environment
- Handles multiple entries for the same key

### 2. Smart Update Strategy

```javascript
1. Check if variable exists for target environment
2. If exists and up-to-date → Skip
3. If exists → Try PATCH (preserves other environments)
4. If PATCH fails:
   - Protected vars → Throw error (can't delete)
   - Single environment → Delete and recreate
   - Multiple environments → Retry with fresh cache
```

### 3. Protected Variable Handling

Some variables are protected by Vercel and cannot be deleted:
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`

For these, PATCH is the only option. If PATCH fails, the error is thrown (can't fall back to delete).

### 4. Enhanced Error Recovery

- Clears cache and retries on conflicts
- Handles race conditions (variable created between check and create)
- Better error messages with context

## Key Changes

### updateEnvVar Function
- Now accepts existing variable object to avoid redundant lookups
- Preserves all existing target environments when updating
- Adds target environment if it doesn't exist

### upsertEnvVar Function
- Checks ALL variables with the same key
- Prioritizes variables with target environment
- Handles protected variables specially
- Retries with fresh cache on failures

### Error Handling
- Detects ENV_CONFLICT and automatically retries with update
- Handles protected variables that can't be deleted
- Provides clear error messages

## Expected Behavior

**Before:**
```
Found 195 existing variables.
Failed: ADMIN_EMAILS (ENV_CONFLICT)
Failed: CACHE_TTL_SECONDS (ENV_CONFLICT)
...
Done. Updated 16 vars. Failed 46.
```

**After:**
```
Found 195 existing variables.
................................................................
Done. Updated 58 vars. Skipped 4 (already up to date). Failed 0.
```

## Testing

Run the sync again:
```bash
doppler run -- npm run env:sync:prod
```

The script should now:
- ✅ Update existing variables using PATCH
- ✅ Handle protected variables correctly
- ✅ Skip variables that are already up-to-date
- ✅ Handle multiple entries for the same key
- ✅ Recover from race conditions

## Notes

- Protected variables (VERCEL_TOKEN, etc.) will fail if PATCH doesn't work
- Variables are only updated if value or type changes
- Encrypted variables are always updated (can't compare values)
- Cache is cleared and refreshed on retries
- **Type Preservation**: Vercel doesn't allow changing the type of sensitive/encrypted variables. The script now preserves the existing type when updating encrypted variables.

## Fix for Type Change Errors

**Issue**: `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` were failing with:
```
"You cannot change the type of a Sensitive Environment Variable."
```

**Solution**: 
- When updating existing variables, preserve the existing type if it's encrypted/sensitive
- Only use the determined type (from `isSensitiveKey()`) for new variables or plain text variables
- This prevents trying to change encrypted → plain or vice versa
