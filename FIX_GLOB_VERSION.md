# Fix: glob@^9.5.0 Version Not Found

## Issue

npm install is failing with:
```
npm error notarget No matching version found for glob@^9.5.0
```

**Root cause:** Version `9.5.0` of the `glob` package doesn't exist.

## Fix Applied

Updated `package.json` override from `glob@^9.5.0` to `glob@^10.0.0` to match the version used in `apps/web/package.json`.

## Try Installing Again

```powershell
# Now try installing again
npm install
```

## If You Still Get Errors

### Option 1: Use Latest Version

```powershell
# Update to latest glob (13.0.0)
npm install glob@latest --save-dev
```

### Option 2: Use Compatible Version

If you need to stay on v9.x for compatibility:

```powershell
# Use the last v9.x version (9.3.2)
# Update package.json override to:
# "glob": "^9.3.2"
```

Then:
```powershell
npm install
```

### Option 3: Remove Override (Let npm Resolve)

If the override isn't critical:

```powershell
# Remove the overrides section from package.json
# Then install
npm install
```

## Verify Fix

After successful installation:

```powershell
# Check installed glob version
npm list glob

# Verify package-lock.json exists
Test-Path package-lock.json

# Run validation
npm run check:deployment
```

---

**Last Updated**: 2026-01-27
**Status**: Fixed glob version in package.json
