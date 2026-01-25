# Doppler to Vercel Environment Sync Guide

This document explains how to properly sync environment variables from Doppler to Vercel for this project, considering the configuration naming differences.

## Configuration Mapping

The sync script has been updated to reflect the correct configuration mapping for this project:

| Vercel Environment | Doppler Config Name |
|--------------------|---------------------|
| development        | dev                 |
| preview            | preview             |
| production         | prd                 |

## Standard Sync Commands

Use the following commands to sync environment variables:

### Development Environment
```bash
npm run env:sync:dev
```

### Preview Environment  
```bash
npm run env:sync:preview
```

### Production Environment
```bash
npm run env:sync:prod
```

## Troubleshooting

### If Sync Fails with "Could not find requested config" Error

This error occurs when the script looks for a Doppler config that doesn't exist. To fix this:

1. Check available configs in Doppler:
   ```bash
   doppler configs
   ```

2. If the names don't match the expected mapping, run the sync command directly with the correct config name:
   ```bash
   doppler run -- node scripts/sync-doppler-to-vercel.js --env=preview --config=preview
   doppler run -- node scripts/sync-doppler-to-vercel.js --env=production --config=prd
   ```

### If Sync Fails with "ENV_CONFLICT" Errors

These errors occur when environment variables already exist in Vercel and conflict with the ones being synced. This is typically not a problem as the variables are already present in Vercel, though they might be outdated. 

To force update all variables, you might need to delete existing ones in Vercel first, or work with the existing values.

## Important Notes

- All environment variables should be managed through Doppler to prevent configuration drift
- Never set environment variables directly in Vercel - always use the sync commands
- Changes to Doppler configs need to be manually synced to Vercel using the commands above
- The VERCEL_TOKEN and VERCEL_PROJECT_ID must be set in Doppler for the sync to work