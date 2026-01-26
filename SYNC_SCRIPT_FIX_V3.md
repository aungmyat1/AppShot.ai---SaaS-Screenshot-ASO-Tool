# Sync Script Fix V3 - Type Preservation for Sensitive Variables

## Problem

After Fix V2, the script was successfully updating 60 variables but failing on 2:

- `VERCEL_PROJECT_ID` - Error: "You cannot change the type of a Sensitive Environment Variable."
- `VERCEL_TOKEN` - Error: "You cannot change the type of a Sensitive Environment Variable."

## Root Cause

Vercel doesn't allow changing the type of variables that are already marked as "Sensitive" (encrypted). The script was trying to update these variables with a different type, which Vercel rejects.

## Solution

### Type Preservation Logic

When updating an existing variable:
1. **Check existing type**: If the variable is already `encrypted` or `sensitive`, preserve that type
2. **Use determined type**: Only for plain text variables or new variables, use the type determined by `isSensitiveKey()`
3. **Apply everywhere**: Use preserved type in all update paths (PATCH, retries, conflict recovery)

### Code Changes

1. **`updateEnvVar` function**:
   ```javascript
   // Vercel doesn't allow changing the type of sensitive/encrypted variables
   const existingIsEncrypted = existing.type === 'encrypted' || existing.type === 'sensitive';
   const finalType = existingIsEncrypted ? existing.type : type;
   ```

2. **`upsertEnvVar` function**:
   - Detects if existing variable is encrypted/sensitive
   - Uses existing type when updating encrypted variables
   - Only uses determined type for plain text variables

3. **All retry paths**:
   - Conflict recovery
   - Fresh cache retries
   - Multiple entry handling
   - All preserve existing type for encrypted variables

## Expected Behavior

**Before:**
```
Done. Updated 60 vars. Skipped 0 (already up to date). Failed 2.
Failed: VERCEL_PROJECT_ID (type change error)
Failed: VERCEL_TOKEN (type change error)
```

**After:**
```
Done. Updated 62 vars. Skipped 0 (already up to date). Failed 0.
```

## Testing

Run the sync again:
```bash
doppler run -- npm run env:sync:prod
```

All 62 variables should now update successfully, including `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`.

## Key Points

- ✅ Preserves existing type for encrypted/sensitive variables
- ✅ Only changes type for plain text variables (if needed)
- ✅ Handles all update paths (PATCH, retries, conflicts)
- ✅ Prevents "cannot change type" errors
- ✅ Works for both `encrypted` and `sensitive` type values
