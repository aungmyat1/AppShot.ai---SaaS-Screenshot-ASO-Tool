#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_NAME = 'getappshots';

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN environment variable is required');
  process.exit(1);
}

async function checkAndUpdateClerk() {
  try {
    // Step 1: Get project details
    console.log('🔍 Step 1: Finding project...\n');
    
    const projectsResponse = await fetch(
      'https://api.vercel.com/v9/projects',
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    if (!projectsResponse.ok) {
      throw new Error(`API error (${projectsResponse.status}): ${await projectsResponse.text()}`);
    }

    const projectsData = await projectsResponse.json();
    const project = projectsData.projects.find(p => p.name === PROJECT_NAME);

    if (!project) {
      console.log('❌ Project not found');
      return;
    }

    console.log(`✅ Found project: ${project.name}`);
    console.log(`   ID: ${project.id}\n`);

    // Step 2: Get current environment variables
    console.log('🔍 Step 2: Checking current Clerk environment variables...\n');

    const envResponse = await fetch(
      `https://api.vercel.com/v9/projects/${project.id}/env`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    if (!envResponse.ok) {
      throw new Error(`API error (${envResponse.status}): ${await envResponse.text()}`);
    }

    const envData = await envResponse.json();
    const clerkVars = envData.envs.filter(env => 
      env.key.toUpperCase().includes('CLERK')
    );

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Current CLERK Environment Variables');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (clerkVars.length === 0) {
      console.log('⚠️  No Clerk variables found in Vercel!\n');
    } else {
      clerkVars.forEach(env => {
        const value = env.value || '(empty)';
        const preview = value === '(empty)' ? value : 
                       value.substring(0, 50) + (value.length > 50 ? '...' : '');
        const targets = env.target ? env.target.join(', ') : 'all';
        const system = env.system ? ' [Managed by Integration]' : '';
        
        console.log(`${env.key}${system}`);
        console.log(`  Value:  ${preview}`);
        console.log(`  Target: ${targets}`);
        console.log(`  ID:     ${env.id}`);
        console.log('');
      });
    }

    // Step 3: Check for Doppler integration
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔌 Step 3: Checking Doppler Integration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const integrationsResponse = await fetch(
      `https://api.vercel.com/v1/integrations/configurations?projectId=${project.id}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    if (integrationsResponse.ok) {
      const integrationsData = await integrationsResponse.json();
      const configurations = integrationsData.configurations || [];
      
      const dopplerIntegration = configurations.find(c => 
        c.integration?.slug === 'doppler' || 
        c.integration?.name?.toLowerCase().includes('doppler')
      );

      if (dopplerIntegration) {
        console.log('✅ Doppler integration is active!');
        console.log(`   Status: ${dopplerIntegration.status}`);
        console.log(`   ID: ${dopplerIntegration.id}\n`);
      } else if (configurations.length > 0) {
        console.log('⚠️  No Doppler integration found');
        console.log('   Active integrations:');
        configurations.forEach(c => {
          console.log(`   - ${c.integration?.name || 'Unknown'} (${c.status})`);
        });
        console.log('');
      } else {
        console.log('⚠️  No integrations found\n');
      }
    }

    // Step 4: Check latest deployment
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Step 4: Latest Deployment Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const deploymentsResponse = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=1`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    if (deploymentsResponse.ok) {
      const deploymentsData = await deploymentsResponse.json();
      if (deploymentsData.deployments && deploymentsData.deployments.length > 0) {
        const latest = deploymentsData.deployments[0];
        console.log(`Status:  ${latest.state === 'READY' ? '✅' : '❌'} ${latest.state}`);
        console.log(`URL:     https://${latest.url}`);
        console.log(`Created: ${new Date(latest.createdAt).toLocaleString()}`);
        console.log(`Commit:  ${latest.meta?.githubCommitSha?.substring(0, 7) || 'N/A'}`);
        console.log('');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Check Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndUpdateClerk();
