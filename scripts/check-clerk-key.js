#!/usr/bin/env node
/**
 * Check Clerk Publishable Key in Doppler and Vercel
 * 
 * This script helps diagnose issues with Clerk key syncing from Doppler to Vercel
 */

const { spawnSync } = require('child_process');
const fs = require('fs');

const args = process.argv.slice(2);
const dopplerConfig = args.find(a => a.startsWith('--config='))?.slice('--config='.length) || 'prod';
const vercelEnv = args.find(a => a.startsWith('--env='))?.slice('--env='.length) || 'production';

console.log('🔍 Checking Clerk Publishable Key\n');
console.log(`Doppler Config: ${dopplerConfig}`);
console.log(`Vercel Environment: ${vercelEnv}\n`);

// Check Doppler
console.log('📦 Checking Doppler...');
const dopplerResult = spawnSync(
  'doppler',
  ['secrets', 'get', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '--plain', '--config', dopplerConfig],
  { encoding: 'utf8' }
);

if (dopplerResult.status !== 0) {
  console.error('❌ Failed to get key from Doppler');
  console.error(dopplerResult.stderr);
  process.exit(1);
}

const dopplerValue = dopplerResult.stdout.trim();
console.log(`Doppler Value: ${dopplerValue.substring(0, 20)}...${dopplerValue.substring(dopplerValue.length - 10)}`);
console.log(`Length: ${dopplerValue.length} characters`);

// Validate format
const isValidFormat = dopplerValue && 
  (dopplerValue.startsWith('pk_test_') || dopplerValue.startsWith('pk_live_')) &&
  dopplerValue.length > 50;

if (isValidFormat) {
  console.log('✅ Key format is VALID\n');
} else {
  console.log('❌ Key format is INVALID');
  console.log('   Expected: Starts with pk_test_ or pk_live_ and is 50+ characters');
  console.log(`   Got: ${dopplerValue.substring(0, 50)}...\n`);
  
  // Try to decode if it looks like base64
  if (dopplerValue.length > 20 && !dopplerValue.includes(' ')) {
    try {
      const decoded = Buffer.from(dopplerValue, 'base64').toString('utf8');
      console.log(`   Decoded (if base64): ${decoded}`);
    } catch (e) {
      // Not base64, ignore
    }
  }
}

// Check Vercel (if VERCEL_TOKEN is available)
if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
  console.log('\n🚀 Checking Vercel...');
  const vercelResult = spawnSync(
    'npx',
    ['vercel', 'env', 'ls', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '--json'],
    { encoding: 'utf8' }
  );
  
  if (vercelResult.status === 0) {
    try {
      const vercelData = JSON.parse(vercelResult.stdout);
      const envVar = vercelData.find(v => v.key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      if (envVar) {
        console.log(`Vercel Value: ${envVar.value.substring(0, 20)}...${envVar.value.substring(envVar.value.length - 10)}`);
        console.log(`Environments: ${envVar.target.join(', ')}`);
        
        if (envVar.value === dopplerValue) {
          console.log('✅ Values match between Doppler and Vercel');
        } else {
          console.log('⚠️  Values DO NOT match!');
          console.log('   This indicates a sync issue.');
        }
      } else {
        console.log('⚠️  Key not found in Vercel');
      }
    } catch (e) {
      console.log('⚠️  Could not parse Vercel output');
    }
  } else {
    console.log('⚠️  Could not check Vercel (make sure VERCEL_TOKEN and VERCEL_PROJECT_ID are set)');
  }
} else {
  console.log('\n⚠️  Skipping Vercel check (set VERCEL_TOKEN and VERCEL_PROJECT_ID to check)');
}

console.log('\n💡 Recommendations:');
if (!isValidFormat) {
  console.log('1. Fix the key in Doppler:');
  console.log(`   doppler secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." --config ${dopplerConfig}`);
  console.log('2. Get your valid key from: https://dashboard.clerk.com');
  console.log('3. Re-sync to Vercel:');
  console.log(`   npm run env:sync:${vercelEnv === 'production' ? 'prod' : vercelEnv}`);
} else {
  console.log('1. Key format is valid in Doppler');
  console.log('2. If build still fails, check Vercel environment variables');
  console.log('3. Ensure the key is synced to all environments (development, preview, production)');
}
