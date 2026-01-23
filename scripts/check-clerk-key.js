#!/usr/bin/env node
/**
 * Check Clerk Publishable Key in Doppler and Vercel
 * 
 * This script helps diagnose issues with Clerk key syncing from Doppler to Vercel
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dopplerConfig = args.find(a => a.startsWith('--config='))?.slice('--config='.length) || 'prod';
const vercelEnv = args.find(a => a.startsWith('--env='))?.slice('--env='.length) || 'production';

console.log('🔍 Checking Clerk Publishable Key\n');
console.log(`Doppler Config: ${dopplerConfig}`);
console.log(`Vercel Environment: ${vercelEnv}\n`);

// Check Doppler
console.log('📦 Checking Doppler...');
let dopplerValue = null;

const dopplerResult = spawnSync(
  'doppler',
  ['secrets', 'get', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '--plain', '--config', dopplerConfig],
  { encoding: 'utf8' }
);

if (dopplerResult.status !== 0) {
  console.warn('⚠️  Failed to get key from Doppler');
  if (dopplerResult.stderr) {
    const errorMsg = dopplerResult.stderr.toString();
    console.warn(`   Error: ${errorMsg.trim()}`);
    
    // Check if config doesn't exist
    if (errorMsg.includes('Could not find requested config')) {
      console.log('\n💡 The config might not exist. Checking available configs...');
      const configsResult = spawnSync('doppler', ['configs', '--json'], { encoding: 'utf8' });
      if (configsResult.status === 0) {
        try {
          const configs = JSON.parse(configsResult.stdout);
          if (configs.configs && configs.configs.length > 0) {
            console.log('   Available configs:');
            configs.configs.forEach(c => {
              console.log(`     - ${c.name} (${c.environment})`);
            });
            console.log(`\n   Try using one of these configs, e.g.:`);
            console.log(`   npm run env:check:clerk-key -- --config=${configs.configs[0].name}`);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
  console.log('\n📄 Checking local .env.local file instead...');
  
  // Fallback to .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=["']?([^"'\n]+)["']?/);
    if (match && match[1]) {
      dopplerValue = match[1].trim();
      console.log('   Found key in .env.local');
    } else {
      console.log('   Key not found in .env.local');
    }
  } else {
    console.log('   .env.local file not found');
  }
} else {
  dopplerValue = dopplerResult.stdout.trim();
}

if (dopplerValue) {
  console.log(`\n📋 Key Value: ${dopplerValue.substring(0, 20)}...${dopplerValue.substring(dopplerValue.length - 10)}`);
  console.log(`   Length: ${dopplerValue.length} characters`);
} else {
  console.log('\n❌ No key found in Doppler or .env.local');
  console.log('\n💡 Next steps:');
  console.log('1. Check if Doppler is configured: doppler setup --project getappshots');
  console.log('2. Check available configs: doppler configs');
  console.log('3. Or check your .env.local file directly');
  process.exit(1);
}

// Validate format - check for the specific corrupted pattern
const hasCorruptedPattern = dopplerValue && dopplerValue.includes('Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA');
const isValidFormat = dopplerValue && 
  (dopplerValue.startsWith('pk_test_') || dopplerValue.startsWith('pk_live_')) &&
  dopplerValue.length > 50 &&
  !hasCorruptedPattern &&
  // Additional check: valid Clerk keys have alphanumeric characters after the prefix
  /^pk_(test_|live_)[A-Za-z0-9]{40,}$/.test(dopplerValue);

if (isValidFormat) {
  console.log('✅ Key format is VALID\n');
} else {
  console.log('❌ Key format is INVALID');
  console.log('   Expected: Starts with pk_test_ or pk_live_ followed by 40+ alphanumeric characters');
  console.log(`   Got: ${dopplerValue.substring(0, 60)}...\n`);
  
  if (hasCorruptedPattern) {
    console.log('   ⚠️  DETECTED: This appears to be a corrupted/encoded value!');
    console.log('   The key contains: Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA');
    console.log('   This is NOT a valid Clerk publishable key.');
    console.log('   You need to get the actual key from https://dashboard.clerk.com\n');
  }
  
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
