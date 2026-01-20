# Next.js 15 Migration Fixes

## Issue
Build was failing with TypeScript errors related to async route parameters and searchParams in Next.js 15.

## Root Cause
Next.js 15 introduced breaking changes where `params`, `searchParams`, `cookies()`, and `headers()` are now asynchronous and must be awaited.

## Files Fixed

### 1. Page Components (2 files)

#### `apps/web/app/(dashboard)/dashboard/overview/page.tsx`
- Made component async
- Changed `searchParams` type to `Promise<Record<...>>`
- Added `await searchParams`

#### `apps/web/app/admin/users/[id]/page.tsx`
- Made component async
- Changed `params` type to `Promise<{ id: string }>`
- Added `await params`

### 2. Route Handlers (7 files)

#### `apps/web/app/api/jobs/[jobId]/route.ts`
- Changed `params` type to `Promise<{ jobId: string }>`
- Added `await ctx.params`

#### `apps/web/app/api/admin/users/[id]/route.ts`
- Updated both GET and PATCH handlers
- Changed `params` type to `Promise<{ id: string }>`
- Added `await ctx.params`

#### `apps/web/app/api/dev/api-keys/[id]/rotate/route.ts`
- Changed `params` type to `Promise<{ id: string }>`
- Added `await ctx.params`
- Changed `cookies()` to `await cookies()`

#### `apps/web/app/api/dev/api-keys/[id]/revoke/route.ts`
- Changed `params` type to `Promise<{ id: string }>`
- Added `await ctx.params`
- Changed `cookies()` to `await cookies()`

#### `apps/web/app/api/dev/api-keys/route.ts`
- Made `bearer()` helper function async
- Changed `cookies()` to `await cookies()`

#### `apps/web/app/api/auth/me/route.ts`
- Changed `cookies()` to `await cookies()`

#### `apps/web/app/api/auth/logout/route.ts`
- Changed `cookies()` to `await cookies()`

### 3. Client Components (1 file)

#### `apps/web/app/(dashboard)/dashboard/billing/billing-client.tsx`
- Added proper TypeScript type import for `StripeCardElement`
- Fixed Stripe element type assertion to resolve type compatibility issues

### 4. Configuration

#### `apps/web/next.config.mjs`
- Moved `outputFileTracingRoot` out of `experimental` (no longer experimental in Next.js 15)

## Pattern Changes

### Before (Next.js 14)
```typescript
// Page component
export default function Page({ searchParams }: { 
  searchParams?: Record<string, string | string[] | undefined> 
}) {
  const value = searchParams?.key;
}

// Route handler with params
export async function GET(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
}

// Cookies
const token = cookies().get("token")?.value;
```

### After (Next.js 15)
```typescript
// Page component
export default async function Page({ searchParams }: { 
  searchParams?: Promise<Record<string, string | string[] | undefined>> 
}) {
  const params = await searchParams;
  const value = params?.key;
}

// Route handler with params
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
}

// Cookies
const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;
```

## Next.js 15 Breaking Changes Applied

1. ✅ **Async params in route handlers** - All dynamic route handlers updated
2. ✅ **Async searchParams in pages** - All pages with searchParams updated
3. ✅ **Async cookies()** - All cookie access updated
4. ✅ **Configuration changes** - Moved deprecated experimental options

## Verification

After these changes, the build should complete successfully:

```bash
npx turbo run build --filter=getappshots
```

## References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Async Request APIs RFC](https://github.com/vercel/next.js/discussions/50522)

## Date
2026-01-20
