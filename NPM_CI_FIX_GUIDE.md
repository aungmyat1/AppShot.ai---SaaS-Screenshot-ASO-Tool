# NPM CI Fix Guide

## Problem

The `npm ci` command was failing in CI/CD environments with an error indicating that the `package-lock.json` file was missing or incompatible.

## Root Cause

The `npm ci` command requires a `package-lock.json` file to be present in the project root. This file contains the exact dependency tree that should be installed in CI/CD environments. Unlike `npm install`, which can work without a lockfile (creating one as needed), `npm ci` strictly requires the lockfile to exist and be in sync with the `package.json`.

## Solution Applied

1. **Detected Missing Lockfile**: Verified that `package-lock.json` was not present in the repository
2. **Generated Lockfile**: Created a valid `package-lock.json` file based on the dependencies specified in `package.json`
3. **Added Verification Scripts**: Created `scripts/verify-lockfile.js` to detect and fix lockfile synchronization issues
4. **Updated Documentation**: Added instructions to README.md about maintaining the lockfile

## Files Modified

- `package-lock.json` - Generated to enable `npm ci` functionality
- `scripts/verify-lockfile.js` - New script to verify and fix lockfile synchronization
- `README.md` - Added section about package-lock.json maintenance
- `package.json` - Added `lockfile:verify` script command

## How to Prevent This Issue in the Future

### For Developers:
1. Always run `npm install` after modifying `package.json`
2. Commit the updated `package-lock.json` along with your changes
3. Use `npm ci` in CI/CD environments, not `npm install`

### For CI/CD:
1. Run `npm ci` to install dependencies (ensures reproducible builds)
2. If issues occur, run `npm run lockfile:verify` to check and fix synchronization

### Available Commands:
```bash
npm run lockfile:verify    # Verify and fix lockfile synchronization
npm run lockfile:check     # Check if lockfile is in sync (provided by existing script)
npm run lockfile:fix       # Fix lockfile issues (provided by existing script)
```

## Verification

To verify that the fix worked:

1. Run `npm ci` - should complete without errors
2. Run `npm run lockfile:verify` - should confirm lockfile is in sync
3. Run `npm run build` - should complete successfully using the installed dependencies

## Notes

- In monorepo environments like this one (using npm workspaces + Turbo), the root `package-lock.json` manages dependencies for the entire project
- All workspace packages (`apps/*` and `packages/*`) rely on the root lockfile for dependency resolution
- Keeping the lockfile in sync ensures consistent dependency trees across all environments