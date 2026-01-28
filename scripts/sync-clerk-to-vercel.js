#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

// IMPORTANT: Replace these with your actual Clerk keys from Doppler
// Get them from: https://dashboard.doppler.com/ → getappshots → prd config
// Or run: doppler secrets --project getappshots --config prd
const CLERK_KEYS = {
  'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY || 'GET_FROM_DOPPLER',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'GET_FROM_DOPPLER',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': '/sign-in',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': '/sign-up'
};

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('❌ VERCEL_PROJECT_ID required. Get from Vercel → Project → Settings → General');
  process.exit(1);
}

async function syncClerkToVercel() {
  try {
    console.log('🔄 Syncing Clerk keys from Doppler to Vercel Production...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [key, value] of Object.entries(CLERK_KEYS)) {
      console.log(`📝 Adding: ${key}`);
      
      const payload = {
        key: key,
        value: value,
        type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
        target: ['production']
      };

      const response = await fetch(
        `https://api.vercel.com/v10/projects/${PROJECT_ID}/env`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Failed: ${errorText}\n`);
        failCount++;
      } else {
        const result = await response.json();
        console.log(`   ✅ Added successfully (ID: ${result.id || 'N/A'})\n`);
        successCount++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Results: ${successCount} succeeded, ${failCount} failed\n`);
    
    if (successCount > 0) {
      console.log('✅ Clerk keys synced to Vercel Production!\n');
      console.log('📋 Next steps:\n');
      console.log('1. Verify: npm run clerk:check');
      console.log('2. Redeploy: npm run deploy:monitor');
      console.log('3. Test: https://getappshots.vercel.app\n');
    } else {
      console.log('⚠️  No keys were added. They might already exist.\n');
      console.log('Run: npm run clerk:check to verify\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncClerkToVercel();
