#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('❌ VERCEL_PROJECT_ID required. Get from Vercel → Project → Settings → General');
  process.exit(1);
}

async function cleanupEmptyClerkKeys() {
  try {
    console.log('🧹 Finding empty Clerk keys in Vercel Production...\n');

    const response = await fetch(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    if (!response.ok) {
      throw new Error(`API error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    
    // Find Production Clerk keys that are empty
    const emptyClerkKeys = data.envs.filter(env => 
      env.key.toUpperCase().includes('CLERK') &&
      env.target && env.target.includes('production') &&
      (!env.value || env.value.trim() === '')
    );

    if (emptyClerkKeys.length === 0) {
      console.log('✅ No empty Clerk keys found in Production!\n');
      console.log('You can proceed with Doppler sync.\n');
      return;
    }

    console.log(`Found ${emptyClerkKeys.length} empty Clerk key(s) in Production:\n`);

    emptyClerkKeys.forEach(env => {
      console.log(`❌ ${env.key}`);
      console.log(`   ID:     ${env.id}`);
      console.log(`   Target: ${env.target.join(', ')}`);
      console.log(`   Value:  (empty)\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  These empty keys will conflict with Doppler sync!\n');
    console.log('📋 Action Required:\n');
    console.log('Go to: https://vercel.com/aung-myats-projects-142f3377/getappshots/settings/environment-variables');
    console.log('\nDelete each of these keys:\n');
    
    emptyClerkKeys.forEach(env => {
      console.log(`   - ${env.key} (Production)`);
    });

    console.log('\nThen trigger Doppler sync again.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupEmptyClerkKeys();
