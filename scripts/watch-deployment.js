#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required. Set in env or https://vercel.com/account/tokens');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('❌ VERCEL_PROJECT_ID required. Get from Vercel → Project → Settings → General');
  process.exit(1);
}

async function watchLatestDeployment() {
  try {
    console.log('👀 Watching for new deployment...\n');

    let lastDeploymentId = null;
    let checkCount = 0;
    const maxChecks = 60; // 5 minutes (5 sec intervals)

    const interval = setInterval(async () => {
      checkCount++;

      const url = new URL('https://api.vercel.com/v6/deployments');
      url.searchParams.set('projectId', PROJECT_ID);
      url.searchParams.set('limit', '1');
      if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);
      const response = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` } });

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        return;
      }

      const { deployments } = await response.json();
      
      if (!deployments || deployments.length === 0) {
        console.log('No deployments found yet...');
        return;
      }

      const latest = deployments[0];
      
      // New deployment detected
      if (lastDeploymentId !== latest.uid) {
        lastDeploymentId = latest.uid;
        
        console.log('\n🚀 New deployment detected!');
        console.log(`   URL: https://${latest.url}`);
        console.log(`   Status: ${latest.readyState}`);
        console.log(`   Created: ${new Date(latest.created).toLocaleString()}\n`);
      }

      // Update status
      const statusEmoji = {
        'BUILDING': '🔨',
        'READY': '✅',
        'ERROR': '❌',
        'QUEUED': '⏳',
        'CANCELED': '🚫'
      };

      const emoji = statusEmoji[latest.readyState] || '❓';
      process.stdout.write(`\r${emoji} Status: ${latest.readyState.padEnd(10)} | Check: ${checkCount}/${maxChecks} `);

      // Done!
      if (latest.readyState === 'READY') {
        console.log('\n\n✅ Deployment successful!\n');
        console.log(`🌐 Live URL: https://${latest.url}`);
        console.log(`📊 Duration: ${Math.round((Date.now() - latest.created) / 1000)}s\n`);
        clearInterval(interval);
        process.exit(0);
      }

      if (latest.readyState === 'ERROR' || latest.readyState === 'CANCELED') {
        console.log(`\n\n❌ Deployment ${latest.readyState.toLowerCase()}!\n`);
        console.log(`🔗 Check logs: https://vercel.com/aung-myats-projects-142f3377/getappshots\n`);
        clearInterval(interval);
        process.exit(1);
      }

      if (checkCount >= maxChecks) {
        console.log('\n\n⏱️  Timeout reached. Deployment still in progress.');
        console.log(`🔗 Monitor at: https://vercel.com/aung-myats-projects-142f3377/getappshots\n`);
        clearInterval(interval);
        process.exit(0);
      }
    }, 5000); // Check every 5 seconds

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

watchLatestDeployment();
