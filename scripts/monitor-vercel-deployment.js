#!/usr/bin/env node

/**
 * Monitor Vercel Deployment Status
 * 
 * This script monitors the latest Vercel deployment and reports its status.
 * Can be used in CI/CD pipelines or run manually.
 * 
 * Usage:
 *   node scripts/monitor-vercel-deployment.js
 * 
 * Environment variables required:
 *   VERCEL_TOKEN - Your Vercel API token
 *   VERCEL_PROJECT_ID - Your Vercel project ID (optional, will auto-detect)
 *   VERCEL_TEAM_ID - Your Vercel team ID (optional)
 */

const VERCEL_API = 'https://api.vercel.com';

async function getVercelDeployments() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is required. Get it from https://vercel.com/account/tokens');
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Build API URL
  let url = `${VERCEL_API}/v6/deployments`;
  const params = new URLSearchParams();
  
  if (projectId) {
    params.append('projectId', projectId);
  }
  if (teamId) {
    params.append('teamId', teamId);
  }
  params.append('limit', '5');

  url += '?' + params.toString();

  console.log('🔍 Fetching deployments from Vercel...\n');

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.deployments || [];
}

async function getDeploymentDetails(deploymentId) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  let url = `${VERCEL_API}/v13/deployments/${deploymentId}`;
  if (teamId) {
    url += `?teamId=${teamId}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    return null;
  }

  return response.json();
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function getStatusEmoji(state) {
  const emojiMap = {
    'READY': '✅',
    'ERROR': '❌',
    'BUILDING': '🔨',
    'QUEUED': '⏳',
    'INITIALIZING': '🚀',
    'CANCELED': '🚫',
  };
  return emojiMap[state] || '❓';
}

async function monitorDeployments(options = {}) {
  const { watch = false, interval = 10000 } = options;

  try {
    const deployments = await getVercelDeployments();

    if (!deployments || deployments.length === 0) {
      console.log('⚠️  No deployments found');
      return;
    }

    console.log(`📦 Found ${deployments.length} recent deployment(s)\n`);

    // Get latest deployment
    const latest = deployments[0];
    const details = await getDeploymentDetails(latest.uid);

    const duration = latest.ready 
      ? formatDuration(latest.ready - latest.createdAt)
      : 'In progress';

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${getStatusEmoji(latest.state)} Latest Deployment`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Status:      ${latest.state}`);
    console.log(`URL:         https://${latest.url}`);
    console.log(`Created:     ${new Date(latest.createdAt).toLocaleString()}`);
    console.log(`Duration:    ${duration}`);
    console.log(`Commit:      ${latest.meta?.githubCommitSha?.substring(0, 7) || 'N/A'}`);
    console.log(`Branch:      ${latest.meta?.githubCommitRef || 'N/A'}`);
    console.log(`Message:     ${latest.meta?.githubCommitMessage || 'N/A'}`);
    
    if (details?.target) {
      console.log(`Target:      ${details.target}`);
    }

    if (latest.state === 'ERROR' && details?.errorMessage) {
      console.log(`\n❌ Error:     ${details.errorMessage}`);
    }

    if (latest.inspectorUrl) {
      console.log(`\n🔗 Inspector: ${latest.inspectorUrl}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show other recent deployments
    if (deployments.length > 1) {
      console.log('📋 Recent Deployments:');
      deployments.slice(1, 5).forEach((dep, idx) => {
        const emoji = getStatusEmoji(dep.state);
        const time = new Date(dep.createdAt).toLocaleTimeString();
        console.log(`   ${emoji} ${dep.state.padEnd(12)} - ${time} - ${dep.url.substring(0, 50)}...`);
      });
      console.log();
    }

    // Watch mode
    if (watch && ['BUILDING', 'QUEUED', 'INITIALIZING'].includes(latest.state)) {
      console.log(`⏳ Deployment in progress. Checking again in ${interval / 1000}s...\n`);
      await new Promise(resolve => setTimeout(resolve, interval));
      return monitorDeployments(options);
    }

    // Exit code based on status
    if (latest.state === 'ERROR') {
      process.exit(1);
    } else if (latest.state === 'READY') {
      console.log('✅ Deployment successful!\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error monitoring deployment:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const watch = args.includes('--watch') || args.includes('-w');
const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 10000;

// Run
monitorDeployments({ watch, interval });
