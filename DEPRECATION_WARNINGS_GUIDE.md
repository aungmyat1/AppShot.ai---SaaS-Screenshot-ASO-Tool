# Handling Deprecation Warnings in AppShot.ai

This document explains how we handle npm deprecation warnings and maintain a healthy dependency tree in the AppShot.ai project.

## Current State

We are aware of some deprecation warnings that appear during installation. These warnings come from transitive dependencies and do not impact the functionality of the application.

## Configuration Approach

Following best practices outlined in the project specifications:

1. **Updated turbo version**: We've pinned turbo to a specific version (2.7.6) in devDependencies to avoid execution warnings.

2. **Fixed glob version**: We're using `glob@^9.5.0` instead of v10+ to avoid ESM compatibility issues, as specified in our project guidelines.

3. **Limited overrides**: We're only overriding essential packages that could impact functionality:
   - `glob`: For ESM compatibility reasons
   
## What We Don't Override

According to our specifications and industry best practices, we do NOT override these packages:
- `inflight`: Has no maintained version and doesn't exist at a specific version
- `whatwg-encoding` and `node-domexception`: Are deprecated but don't impact functionality

These warnings are coming from transitive dependencies (like jsdom, undici) and are common in many modern JavaScript projects, including Vercel and Next.js repositories.

## Execution Guidelines

Always run turbo commands through npm scripts to ensure consistency:

✅ Recommended:
```bash
npm run build
npm run dev
npm run lint
```

❌ Avoid:
```bash
npx turbo build  # Bypasses your dependency graph
```

## Verification Commands

To check your dependency tree:
```bash
npm ls glob
npm audit
```

## Expected Result

After implementing these changes:
- ✅ No turbo execution warnings
- ⚠️ Some deprecated warnings may still remain (which is normal)
- ✅ Build passes successfully
- ✅ Runtime remains stable
- ✅ Vercel deployments work correctly

This is the industry standard approach for maintaining modern JavaScript projects while keeping them functional and maintainable.