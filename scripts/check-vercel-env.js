#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_6q4vXSj8pOwLhAUJrN54Cjzm';

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN environment variable is required');
  process.exit(1);
}

async function getProjectInfo() {
  try {
    console.log('🔍 Fetching projects from Vercel...\n');

    const response = await fetch(
      `https://api.vercel.com/v9/projects?teamId=${TEAM_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel API error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    const getappshotsProject = data.projects.find(p => p.name === 'getappshots');

    if (!getappshotsProject) {
      console.log('❌ Project "getappshots" not found\n');
      console.log('Available projects:');
      data.projects.forEach(p => console.log(`  - ${p.name} (${p.id})`));
      return;
    }

    console.log('✅ Found project: getappshots\n');
    console.log(`Project ID: ${getappshotsProject.id}`);
    console.log(`Framework:  ${getappshotsProject.framework || 'N/A'}`);
    console.log(`Updated:    ${new Date(getappshotsProject.updatedAt).toLocaleString()}`);
    console.log('');

    // Now fetch env vars with correct project ID
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Environment Variables');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const envResponse = await fetch(
      `https://api.vercel.com/v9/projects/${getappshotsProject.id}/env?teamId=${TEAM_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      }
    );

    if (!envResponse.ok) {
      throw new Error(`Vercel API error (${envResponse.status}): ${await envResponse.text()}`);
    }

    const envData = await envResponse.json();
    
    // Filter for Clerk vars
    const clerkVars = envData.envs.filter(env => 
      env.key.toUpperCase().includes('CLERK')
    );

    console.log('🔐 CLERK Variables:\n');
    if (clerkVars.length === 0) {
      console.log('  ⚠️  No Clerk environment variables found!\n');
    } else {
      clerkVars.forEach(env => {
        const value = env.value || '(not set)';
        const preview = value === '(not set)' ? value : 
                       value.substring(0, 40) + (value.length > 40 ? '...' : '');
        const targets = env.target ? env.target.join(', ') : 'all';
        const system = env.system ? ' [System/Integration]' : '';
        
        console.log(`  ${env.key}${system}`);
        console.log(`    Value:  ${preview}`);
        console.log(`    Target: ${targets}`);
        console.log('');
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getProjectInfo();
