#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_LPfgsI5roKyo3CFHWInU4hlg2jxs';

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required');
  console.log('Usage: $env:VERCEL_TOKEN = "your_token"; node scripts/trigger-redeploy.js');
  process.exit(1);
}

async function triggerRedeploy() {
  try {
    console.log('🚀 Triggering Vercel redeploy with cleared cache...\n');

    // Get the latest deployment
    const listResponse = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=1`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

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
    console.log(`   Vercel Dashboard: https://vercel.com/aung-myats-projects-142f3377/getappshots`);
    console.log(`   Direct: https://${newDeployment.url}\n`);
    console.log('⏱️  This will take 2-3 minutes to complete.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Trigger manually from Vercel Dashboard');
    console.log('   Go to: https://vercel.com/aung-myats-projects-142f3377/getappshots');
    console.log('   Click: Deployments → Latest → Redeploy → Clear Build Cache\n');
    process.exit(1);
  }
}

triggerRedeploy();
