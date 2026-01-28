#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required. Set in env or https://vercel.com/account/tokens');
  console.log('Usage: VERCEL_TOKEN=... VERCEL_PROJECT_ID=... node scripts/trigger-redeploy.js');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('❌ VERCEL_PROJECT_ID required. Get from Vercel → Project → Settings → General');
  process.exit(1);
}

async function triggerRedeploy() {
  try {
    console.log('🚀 Triggering Vercel redeploy with cleared cache...\n');

    // Get the latest deployment
    const listUrl = new URL('https://api.vercel.com/v6/deployments');
    listUrl.searchParams.set('projectId', PROJECT_ID);
    listUrl.searchParams.set('limit', '1');
    if (TEAM_ID) listUrl.searchParams.set('teamId', TEAM_ID);
    const listResponse = await fetch(listUrl.toString(), {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to fetch deployments: ${await listResponse.text()}`);
    }

    const { deployments } = await listResponse.json();
    
    if (!deployments || deployments.length === 0) {
      throw new Error('No deployments found');
    }

    const latestDeployment = deployments[0];
    console.log(`📦 Latest deployment: ${latestDeployment.url}`);
    console.log(`   Created: ${new Date(latestDeployment.created).toLocaleString()}`);
    console.log(`   Git branch: ${latestDeployment.meta?.githubCommitRef || 'N/A'}\n`);

    // Trigger redeploy
    const redeployResponse = await fetch(
      `https://api.vercel.com/v13/deployments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deploymentId: latestDeployment.uid,
          meta: {
            action: 'redeploy'
          },
          target: 'production'
        })
      }
    );

    if (!redeployResponse.ok) {
      const errorText = await redeployResponse.text();
      throw new Error(`Redeploy failed: ${errorText}`);
    }

    const newDeployment = await redeployResponse.json();
    
    console.log('✅ Redeploy triggered successfully!\n');
    console.log(`🔗 Deployment URL: https://${newDeployment.url}`);
    console.log(`📊 Status: ${newDeployment.readyState}`);
    console.log(`🆔 ID: ${newDeployment.id}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Monitor deployment:\n');
    const dashboardUrl = process.env.VERCEL_DASHBOARD_URL || 'https://vercel.com/dashboard';
    console.log(`   Vercel Dashboard: ${dashboardUrl}`);
    console.log(`   Direct: https://${newDeployment.url}\n`);
    console.log('⏱️  This will take 2-3 minutes to complete.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Trigger manually from Vercel Dashboard');
    console.log('   Go to: Vercel → Your Project → Deployments → Latest → Redeploy → Clear Build Cache\n');
    process.exit(1);
  }
}

triggerRedeploy();
