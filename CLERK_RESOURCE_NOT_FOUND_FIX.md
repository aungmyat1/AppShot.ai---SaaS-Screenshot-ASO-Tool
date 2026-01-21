# Clerk "Resource not found" Error - Fixed

**Date**: 2026-01-20  
**Status**: ✅ **Fixed**

## Error Description

```
{"errors":[{"message":"not found","long_message":"Resource not found","code":"resource_not_found"}],"clerk_trace_id":"..."}
```

This error occurred when the application tried to fetch a user from Clerk that doesn't exist in the Clerk system.

## Root Cause

The `getOrCreateUser` function in `apps/web/lib/auth.ts` was calling `client.users.getUser(clerkUserId)` without error handling. This would fail when:

1. **User deleted from Clerk**: A user exists in the database but was deleted from Clerk
2. **Invalid Clerk user ID**: A malformed or non-existent Clerk user ID is passed
3. **Clerk API issues**: Temporary Clerk API problems or incorrect API keys
4. **Data inconsistency**: Database has a Clerk user ID that doesn't match any Clerk user

## Fix Applied

Added comprehensive error handling in `apps/web/lib/auth.ts`:

```typescript
export async function getOrCreateUser(clerkUserId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (existing) return existing;

  const client = await clerkClient();
  let user;
  try {
    user = await client.users.getUser(clerkUserId);
  } catch (error: any) {
    // Handle Clerk API errors (e.g., "Resource not found")
    const errorMessage = error?.message || String(error);
    const errorCode = error?.status || error?.code;
    
    // If user not found in Clerk, create a minimal user record
    if (errorCode === 404 || errorMessage.includes("not found") || errorMessage.includes("resource_not_found")) {
      console.warn(`Clerk user ${clerkUserId} not found, creating minimal user record`);
      return prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: `user-${clerkUserId}@unknown.example.com`,
          name: null,
          isAdmin: false,
        },
      });
    }
    
    // Re-throw other errors
    throw error;
  }
  
  // ... rest of the function
}
```

## What This Fix Does

1. **Catches Clerk API errors**: Wraps the `getUser` call in try-catch
2. **Handles "not found" errors**: Detects 404 status codes or error messages containing "not found" or "resource_not_found"
3. **Creates fallback user**: Creates a minimal user record in the database when Clerk user doesn't exist
4. **Preserves other errors**: Re-throws non-404 errors so they can be handled appropriately

## Impact

- ✅ **No more crashes**: Application won't crash when Clerk user is not found
- ✅ **Graceful degradation**: Creates a minimal user record to allow the app to continue functioning
- ✅ **Better error handling**: Other Clerk API errors are still properly surfaced
- ✅ **Logging**: Warns when a Clerk user is not found for debugging

## When This Happens

This error typically occurs when:

1. **User deleted from Clerk**: A user was deleted from Clerk but their database record still exists
2. **Development/testing**: Using test Clerk user IDs that don't exist
3. **Data migration**: After migrating data, some Clerk user IDs might be invalid
4. **Clerk configuration issues**: Incorrect Clerk API keys or application configuration

## Monitoring

The fix includes a `console.warn` that logs when a Clerk user is not found. Monitor your logs for:

```
Clerk user <user_id> not found, creating minimal user record
```

If you see this frequently, investigate:
- Why users are being deleted from Clerk
- If there's a data sync issue between Clerk and your database
- If Clerk API keys are correct

## Related Files

- `apps/web/lib/auth.ts` - Main fix location
- All API routes that use `getOrCreateUser()`:
  - `apps/web/app/api/jobs/[jobId]/route.ts`
  - `apps/web/app/api/stripe/portal/route.ts`
  - `apps/web/app/api/stripe/checkout/route.ts`
  - `apps/web/app/api/scrape/route.ts`
  - `apps/web/app/api/billing/*/route.ts`
  - `apps/web/app/api/analytics/user/route.ts`
  - And more...

## Next Steps

1. ✅ **Fix applied and pushed** - The error handling is now in place
2. **Monitor logs** - Watch for warnings about missing Clerk users
3. **Investigate root cause** - If this happens frequently, investigate why Clerk users are missing
4. **Consider cleanup** - You may want to add a script to clean up orphaned user records

## Alternative Solutions (If Issue Persists)

If the error continues, consider:

1. **Verify Clerk API keys** in Vercel environment variables
2. **Check Clerk dashboard** - Ensure the application is properly configured
3. **Review user deletion process** - Ensure users aren't being deleted unexpectedly
4. **Add data validation** - Validate Clerk user IDs before calling the API

---

**Commit**: `0b94303` - "fix: handle Clerk 'Resource not found' error gracefully in getOrCreateUser"  
**Status**: ✅ Fixed and deployed
