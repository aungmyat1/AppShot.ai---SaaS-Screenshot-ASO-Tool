#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

// IDs from the check script
const ENV_IDS = {
  production: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: '7WOqDqP57DPot4Q3',
    CLERK_SECRET_KEY: '5sv7vWoGngYCplCF',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: 'uyHAafVAOXxLCcv1',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '7oi5dQJXaXTBO8yY'
  }
};

const CLERK_VALUES = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PROD_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_PROD_SECRET_KEY || '',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up'
};

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN required');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('❌ Error: VERCEL_PROJECT_ID required. Get from Vercel → Project → Settings → General');
  process.exit(1);
}

async function updateClerkKeys() {
  try {
    console.log('🔧 Updating Clerk keys in Vercel Production...\n');

    if (!CLERK_VALUES.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !CLERK_VALUES.CLERK_SECRET_KEY) {
      console.error('❌ Error: Please set CLERK_PROD_PUBLISHABLE_KEY and CLERK_PROD_SECRET_KEY');
      console.log('\nUsage:');
      console.log('$env:CLERK_PROD_PUBLISHABLE_KEY = "pk_live_YOUR_FULL_KEY"');
      console.log('$env:CLERK_PROD_SECRET_KEY = "sk_live_YOUR_FULL_KEY"');
      console.log('node scripts/update-clerk-vercel.js');
      return;
    }

    // Update each key using PATCH
    for (const [key, envId] of Object.entries(ENV_IDS.production)) {
      const value = CLERK_VALUES[key];
      console.log(`Updating ${key}...`);
      
      const response = await fetch(
        `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${envId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: value,
            type: key.startsWith('NEXT_PUBLIC') ? 'plain' : 'encrypted'
          })
        }
      );

      if (response.ok) {
        const preview = value.substring(0, 30) + '...';
        console.log(`✅ ${key} = ${preview}`);
      } else {
        const error = await response.text();
        console.log(`❌ ${key} - ${error}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Done! Now redeploy to apply changes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nGo to: https://vercel.com/aung-myats-projects-142f3377/getappshots');
    console.log('Click: Deployments → Latest → Redeploy');
    console.log('Make sure to: ✅ Clear Build Cache\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateClerkKeys();
