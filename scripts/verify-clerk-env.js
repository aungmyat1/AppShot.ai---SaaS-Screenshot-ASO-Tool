#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify Clerk environment variables are set correctly.
 * 
 * This script checks for:
 * - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 * - CLERK_SECRET_KEY
 * 
 * Checks in order:
 * 1. Local process.env (if running with doppler run or .env.local)
 * 2. Vercel API (if VERCEL_TOKEN is available)
 * 
 * And validates:
 * - No extra spaces
 * - No quotes
 * - Correct format (pk_/sk_ prefix)
 */

const { spawnSync } = require('child_process');

const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

const optionalVars = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL'
];

// Try to get VERCEL_TOKEN from environment or Doppler
let vercelToken = process.env.VERCEL_TOKEN;
const vercelProject = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME;

if (!vercelToken) {
  try {
    const dopplerResult = spawnSync(
      'doppler',
      ['secrets', 'get', 'VERCEL_TOKEN', '--plain', '--config', 'dev'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    if (dopplerResult.status === 0 && dopplerResult.stdout) {
      vercelToken = dopplerResult.stdout.trim();
    }
  } catch (e) {
    // Ignore errors
  }
}

async function getVercelEnvVars() {
  if (!vercelToken || !vercelProject || typeof fetch !== 'function') {
    return null;
  }

  try {
    const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(vercelProject)}/env`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const envs = (data && data.envs) ? data.envs : [];
    
    // Create a map of key -> value for all environments
    const envMap = {};
    for (const env of envs) {
      if (env.key && env.value) {
        // For encrypted vars, we can't get the value, but we know it exists
        if (env.type === 'encrypted' || env.type === 'sensitive') {
          envMap[env.key] = env.value || '[ENCRYPTED]';
        } else {
          envMap[env.key] = env.value;
        }
      }
    }
    
    return envMap;
  } catch (e) {
    return null;
  }
}

function checkVariable(name, value) {
  const issues = [];
  
  if (!value || value.trim() === '') {
    issues.push('❌ Variable is empty or not set');
    return { name, value, issues, valid: false };
  }
  
  // Check for extra spaces
  if (value !== value.trim()) {
    issues.push('⚠️  Contains leading/trailing spaces');
  }
  
  // Check for quotes
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    issues.push('⚠️  Contains quotes (remove quotes in Vercel)');
  }
  
  // Validate format
  if (name === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
    if (!value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
      issues.push('⚠️  Should start with pk_test_ or pk_live_');
    }
  }
  
  if (name === 'CLERK_SECRET_KEY') {
    if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_')) {
      issues.push('⚠️  Should start with sk_test_ or sk_live_');
    }
  }
  
  const valid = issues.length === 0;
  return { name, value: value.substring(0, 20) + '...', issues, valid };
}

async function main() {
  console.log('🔍 Checking Clerk Environment Variables...\n');
  
  // Try to get values from local env first, then Vercel
  let vercelEnvVars = null;
  const missingLocally = requiredVars.filter(v => !process.env[v] || process.env[v].trim() === '');
  
  if (missingLocally.length > 0) {
    console.log('📡 Checking Vercel for missing variables...');
    vercelEnvVars = await getVercelEnvVars();
    if (vercelEnvVars) {
      console.log(`   Found ${Object.keys(vercelEnvVars).length} variables in Vercel\n`);
    } else {
      console.log('   ⚠️  Could not check Vercel (VERCEL_TOKEN or VERCEL_PROJECT_ID not available)\n');
    }
  }
  
  let allValid = true;
  const results = [];
  
  // Check required variables
  console.log('📋 Required Variables:');
  for (const varName of requiredVars) {
    // Try local env first, then Vercel
    let value = process.env[varName];
    let source = 'local';
    
    if (!value && vercelEnvVars && vercelEnvVars[varName]) {
      value = vercelEnvVars[varName];
      source = 'Vercel';
    }
    
    const check = checkVariable(varName, value);
    results.push({ ...check, source });
    
    if (check.valid) {
      console.log(`  ✅ ${varName}`);
      console.log(`     Value: ${check.value}`);
      console.log(`     Source: ${source}`);
    } else {
      console.log(`  ❌ ${varName}`);
      check.issues.forEach(issue => console.log(`     ${issue}`));
      if (source === 'Vercel') {
        console.log(`     ⚠️  Found in Vercel but value is invalid`);
      }
      allValid = false;
    }
    console.log();
  }
  
  // Check optional variables
  console.log('📋 Optional Variables:');
  for (const varName of optionalVars) {
    let value = process.env[varName];
    let source = 'local';
    
    if (!value && vercelEnvVars && vercelEnvVars[varName]) {
      value = vercelEnvVars[varName];
      source = 'Vercel';
    }
    
    if (value) {
      const check = checkVariable(varName, value);
      if (check.valid) {
        console.log(`  ✅ ${varName} = ${value}`);
        console.log(`     Source: ${source}`);
      } else {
        console.log(`  ⚠️  ${varName}`);
        check.issues.forEach(issue => console.log(`     ${issue}`));
      }
    } else {
      console.log(`  ⚪ ${varName} (not set, optional)`);
    }
    console.log();
  }
  
  // Summary
  console.log('📝 Summary:');
  if (allValid) {
    console.log('  ✅ All required Clerk variables are set correctly!');
    console.log('\n💡 Next steps:');
    console.log('  1. Verify in Vercel Dashboard → Project → Settings → Environment Variables');
    console.log('  2. Ensure variables are set for Production + Preview environments');
    console.log('  3. Clear Turbo cache: rm -rf .turbo && npm run build');
    console.log('  4. Redeploy on Vercel');
  } else {
    console.log('  ❌ Some required variables are missing or invalid!');
    console.log('\n🔧 How to fix:');
    
    const missingVars = requiredVars.filter(v => {
      const local = process.env[v];
      const vercel = vercelEnvVars && vercelEnvVars[v];
      return (!local || local.trim() === '') && (!vercel || vercel === '[ENCRYPTED]');
    });
    
    if (missingVars.length > 0) {
      console.log('\n📤 Option 1: Sync from Doppler to Vercel (Recommended):');
      console.log('   doppler run -- npm run env:sync:dev');
      console.log('   doppler run -- npm run env:sync:preview');
      console.log('   doppler run -- npm run env:sync:prod');
    }
    
    console.log('\n📝 Option 2: Manual setup in Vercel:');
    console.log('  1. Go to Vercel → Project → Settings → Environment Variables');
    console.log('  2. Add/Edit these variables:');
    requiredVars.forEach(v => {
      const local = process.env[v];
      const vercel = vercelEnvVars && vercelEnvVars[v];
      if ((!local || local.trim() === '') && (!vercel || vercel === '[ENCRYPTED]')) {
        console.log(`     - ${v} (REQUIRED)`);
      }
    });
    console.log('  3. Make sure:');
    console.log('     - No extra spaces');
    console.log('     - No quotes around values');
    console.log('     - Set for Production + Preview + Development');
    
    console.log('\n💡 For local development:');
    console.log('   doppler run -- npm run dev');
    
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
