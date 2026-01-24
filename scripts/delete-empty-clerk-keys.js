#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_LPfgsI5roKyo3CFHWInU4hlg2jxs';

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required');
  console.log('Usage: $env:VERCEL_TOKEN = "your_token"; node scripts/delete-empty-clerk-keys.js');
  process.exit(1);
}

async function deleteEmptyClerkKeys() {
  try {
    console.log('🧹 Finding and deleting empty Clerk keys in Vercel Production...\n');

    // 1. Get all env vars
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
    
    // 2. Find Production Clerk keys that are empty
    const emptyClerkKeys = data.envs.filter(env => 
      env.key.toUpperCase().includes('CLERK') &&
      env.target && env.target.includes('production') &&
      (!env.value || env.value.trim() === '')
    );

    if (emptyClerkKeys.length === 0) {
      console.log('✅ No empty Clerk keys found in Production!\n');
      console.log('✅ You can now proceed with Doppler sync.\n');
      return;
    }

    console.log(`Found ${emptyClerkKeys.length} empty Clerk key(s) to delete:\n`);

    // 3. Delete each one
    for (const env of emptyClerkKeys) {
      console.log(`🗑️  Deleting: ${env.key} (ID: ${env.id})`);
      
      const deleteResponse = await fetch(
        `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${env.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.log(`   ❌ Failed: ${errorText}`);
      } else {
        console.log(`   ✅ Deleted successfully`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All empty Clerk keys deleted!\n');
    console.log('📋 Next steps:\n');
    console.log('1. Go to Doppler Dashboard → Integrations → Vercel');
    console.log('2. Click "Sync Now" to push Clerk keys from Doppler to Vercel');
    console.log('3. Verify: npm run clerk:check');
    console.log('4. Redeploy: npm run deploy:monitor\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteEmptyClerkKeys();
