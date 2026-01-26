#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Verify Vercel Project ID and Token
 * 
 * This script helps verify:
 * - VERCEL_TOKEN is valid
 * - VERCEL_PROJECT_ID exists and is accessible
 * - Project details
 * 
 * Usage:
 *   node scripts/verify-vercel-project.js
 *   node scripts/verify-vercel-project.js --project=prj_xxxxx
 *   node scripts/verify-vercel-project.js --token=vercel_xxxxx
 */

const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

function parseArgValue(prefix) {
  const arg = args.find((a) => a.startsWith(prefix));
  if (!arg) return undefined;
  return arg.slice(prefix.length);
}

// Get token from args, env, or Doppler
let vercelToken = parseArgValue('--token=') || process.env.VERCEL_TOKEN;

if (!vercelToken) {
  try {
    const dopplerResult = spawnSync(
      'doppler',
      ['secrets', 'get', 'VERCEL_TOKEN', '--plain', '--config', 'prd'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    if (dopplerResult.status === 0 && dopplerResult.stdout) {
      vercelToken = dopplerResult.stdout.trim();
    }
  } catch (e) {
    // Ignore
  }
}

// Get project ID from args, env, or Doppler
let projectId = parseArgValue('--project=') || process.env.VERCEL_PROJECT_ID;

if (!projectId) {
  try {
    const dopplerResult = spawnSync(
      'doppler',
      ['secrets', 'get', 'VERCEL_PROJECT_ID', '--plain', '--config', 'prd'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    if (dopplerResult.status === 0 && dopplerResult.stdout) {
      projectId = dopplerResult.stdout.trim();
    }
  } catch (e) {
    // Ignore
  }
}

async function verifyToken() {
  if (!vercelToken) {
    console.error('❌ VERCEL_TOKEN not found');
    console.error('   Set it via: --token=xxx or $env:VERCEL_TOKEN or in Doppler');
    return false;
  }

  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (res.status === 401) {
      console.error('❌ VERCEL_TOKEN is invalid or expired');
      return false;
    }

    if (!res.ok) {
      console.error(`❌ Failed to verify token (${res.status})`);
      return false;
    }

    const user = await res.json();
    console.log('✅ VERCEL_TOKEN is valid');
    console.log(`   User: ${user.user?.username || user.user?.email || 'Unknown'}`);
    return true;
  } catch (error) {
    console.error(`❌ Error verifying token: ${error.message}`);
    return false;
  }
}

async function verifyProject() {
  if (!projectId) {
    console.error('\n❌ VERCEL_PROJECT_ID not found');
    console.error('   Set it via: --project=prj_xxx or $env:VERCEL_PROJECT_ID or in Doppler');
    return false;
  }

  if (!vercelToken) {
    console.error('\n❌ VERCEL_TOKEN required to verify project');
    return false;
  }

  console.log(`\n🔍 Verifying project: ${projectId}`);

  try {
    const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}`, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (res.status === 404) {
      console.error('❌ Project not found');
      console.error('\n💡 Possible causes:');
      console.error('   1. Project ID is incorrect');
      console.error('   2. Project was deleted');
      console.error('   3. Token doesn\'t have access to this project');
      console.error('   4. Project is under a team (may need VERCEL_TEAM_ID)');
      console.error('\n🔧 To fix:');
      console.error('   1. Go to Vercel Dashboard → Project → Settings → General');
      console.error('   2. Copy the correct "Project ID" (starts with prj_)');
      console.error('   3. Update in Doppler: doppler secrets set VERCEL_PROJECT_ID="prj_..."');
      return false;
    }

    if (res.status === 403) {
      console.error('❌ Access denied to project');
      console.error('   The token doesn\'t have permission to access this project');
      console.error('\n🔧 To fix:');
      console.error('   1. Check token permissions at: https://vercel.com/account/tokens');
      console.error('   2. Ensure token has access to this project');
      console.error('   3. If project is under a team, you may need VERCEL_TEAM_ID');
      return false;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Failed to verify project (${res.status})`);
      console.error(`   ${errorText}`);
      return false;
    }

    const project = await res.json();
    console.log('✅ Project found and accessible');
    console.log(`   Name: ${project.name || 'Unknown'}`);
    console.log(`   ID: ${project.id}`);
    if (project.teamId) {
      console.log(`   Team ID: ${project.teamId}`);
      console.log('   ⚠️  Project is under a team - you may need to set VERCEL_TEAM_ID');
    }
    return true;
  } catch (error) {
    console.error(`❌ Error verifying project: ${error.message}`);
    return false;
  }
}

async function listProjects() {
  if (!vercelToken) return;

  try {
    const res = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        console.log('\n📋 Available Projects:');
        data.projects.slice(0, 10).forEach((proj) => {
          console.log(`   ${proj.id} - ${proj.name}`);
        });
        if (data.projects.length > 10) {
          console.log(`   ... and ${data.projects.length - 10} more`);
        }
      }
    }
  } catch (error) {
    // Ignore errors in listing
  }
}

async function main() {
  console.log('\n🔍 Vercel Project & Token Verification');
  console.log('='.repeat(60));

  const tokenValid = await verifyToken();
  if (!tokenValid) {
    console.error('\n❌ Cannot proceed without valid token');
    process.exit(1);
  }

  const projectValid = await verifyProject();
  
  if (projectValid) {
    console.log('\n✅ All checks passed!');
    console.log('\n💡 You can now sync environment variables:');
    console.log('   doppler run -- npm run env:sync:prod');
  } else {
    console.log('\n⚠️  Project verification failed');
    await listProjects();
    console.log('\n💡 Use the correct project ID from the list above');
  }

  console.log('\n');
  process.exit(projectValid ? 0 : 1);
}

main();
