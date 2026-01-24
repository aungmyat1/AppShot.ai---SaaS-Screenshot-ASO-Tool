#!/usr/bin/env node

/**
 * Quick Setup Script for Doppler + Vercel + Clerk Integration
 * 
 * This script provides an interactive guide to set up Doppler integration
 */

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  🔐 Doppler + Vercel + Clerk Integration Setup');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

console.log('📋 **Step-by-Step Checklist**\n');

console.log('✅ **Step 1: Add Clerk Keys to Doppler**');
console.log('   1. Go to: https://dashboard.doppler.com/');
console.log('   2. Navigate to: Getappshots → prd (production) config');
console.log('   3. Click "Add Secret" for each key:');
console.log('      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
console.log('      - CLERK_SECRET_KEY');
console.log('      - NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in');
console.log('      - NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up');
console.log('');

console.log('✅ **Step 2: Set Up Doppler-Vercel Integration**');
console.log('   1. In Doppler Dashboard → Integrations → Vercel');
console.log('   2. Click "Connect" and authorize Vercel');
console.log('   3. Add Sync:');
console.log('      - Doppler Project: Getappshots');
console.log('      - Doppler Config: prd');
console.log('      - Vercel Project: getappshots');
console.log('      - Vercel Target: Production');
console.log('   4. Click "Save"');
console.log('');

console.log('✅ **Step 3: Clean Up Old Empty Keys in Vercel**');
console.log('   1. Go to: https://vercel.com/aung-myats-projects-142f3377/getappshots/settings/environment-variables');
console.log('   2. Delete empty Production Clerk keys:');
console.log('      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
console.log('      - CLERK_SECRET_KEY');
console.log('      - NEXT_PUBLIC_CLERK_SIGN_IN_URL');
console.log('      - NEXT_PUBLIC_CLERK_SIGN_UP_URL');
console.log('');

console.log('✅ **Step 4: Trigger Manual Sync**');
console.log('   1. In Doppler → Integrations → Vercel');
console.log('   2. Find your sync and click "Sync Now"');
console.log('');

console.log('✅ **Step 5: Verify Sync Worked**');
console.log('   Run this command:');
console.log('   ```');
console.log('   $env:VERCEL_TOKEN = "oKZg0fFoiKc27ZAnC1MvFxnL"');
console.log('   node scripts/verify-doppler-sync.js');
console.log('   ```');
console.log('');

console.log('✅ **Step 6: Redeploy**');
console.log('   1. Go to: https://vercel.com/aung-myats-projects-142f3377/getappshots');
console.log('   2. Deployments → Latest → Redeploy');
console.log('   3. ✅ Clear Build Cache');
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('');

console.log('📖 **Full Documentation:**');
console.log('   Read: CLERK_DOPPLER_SETUP_GUIDE.md');
console.log('');

console.log('🔍 **Diagnostic Tools:**');
console.log('   Check Clerk keys:  node scripts/check-clerk-vercel.js');
console.log('   Verify sync:       node scripts/verify-doppler-sync.js');
console.log('   Monitor deploy:    node scripts/monitor-vercel-deployment.js');
console.log('');

console.log('═══════════════════════════════════════════════════════════');
console.log('');
