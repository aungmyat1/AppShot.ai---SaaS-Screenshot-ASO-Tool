#!/usr/bin/env node

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN environment variable is required');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('❌ Error: VERCEL_PROJECT_ID required. Get from Vercel → Project → Settings → General');
  process.exit(1);
}

async function verifyDopplerSync() {
  try {
    console.log('🔍 Verifying Doppler → Vercel Sync Status\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check environment variables
    const envResponse = await fetch(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    if (!envResponse.ok) {
      throw new Error(`API error (${envResponse.status}): ${await envResponse.text()}`);
    }

    const envData = await envResponse.json();
    
    // Filter for production Clerk vars
    const prodClerkVars = envData.envs.filter(env => 
      env.key.toUpperCase().includes('CLERK') && 
      env.target && env.target.includes('production')
    );

    console.log('📊 Production Clerk Variables Status:\n');

    const requiredKeys = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
      'NEXT_PUBLIC_CLERK_SIGN_UP_URL'
    ];

    let allPresent = true;
    let allHaveValues = true;
    let managedByIntegration = false;

    requiredKeys.forEach(key => {
      const envVar = prodClerkVars.find(v => v.key === key);
      
      if (!envVar) {
        console.log(`❌ ${key} - MISSING`);
        allPresent = false;
      } else {
        const hasValue = envVar.value && envVar.value.trim() !== '';
        const isManaged = envVar.system || envVar.gitBranch || envVar.comment?.includes('Doppler');
        
        if (isManaged) managedByIntegration = true;
        
        const statusIcon = hasValue ? '✅' : '❌';
        const managedText = isManaged ? ' [Managed by Integration]' : '';
        const valuePreview = hasValue ? 
          envVar.value.substring(0, 30) + '...' : 
          '(empty)';
        
        console.log(`${statusIcon} ${key}${managedText}`);
        console.log(`   Value: ${valuePreview}`);
        
        if (!hasValue) allHaveValues = false;
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check integrations
    const integrationsResponse = await fetch(
      `https://api.vercel.com/v1/integrations/configurations?projectId=${PROJECT_ID}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
      }
    );

    let dopplerIntegrationActive = false;
    if (integrationsResponse.ok) {
      const integrationsData = await integrationsResponse.json();
      const configurations = integrationsData.configurations || [];
      
      const dopplerConfig = configurations.find(c => 
        c.integration?.slug === 'doppler' || 
        c.integration?.name?.toLowerCase().includes('doppler')
      );

      if (dopplerConfig) {
        dopplerIntegrationActive = true;
        console.log('✅ Doppler Integration: ACTIVE');
        console.log(`   Status: ${dopplerConfig.status}`);
        console.log(`   ID: ${dopplerConfig.id}\n`);
      } else {
        console.log('❌ Doppler Integration: NOT FOUND\n');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Summary:\n');

    if (allPresent && allHaveValues && (dopplerIntegrationActive || managedByIntegration)) {
      console.log('✅ All Clerk keys are present and configured');
      console.log('✅ Keys appear to be managed by integration');
      console.log('✅ Doppler sync is working correctly!\n');
      console.log('🚀 Ready to deploy!\n');
    } else {
      console.log('⚠️  Issues detected:\n');
      
      if (!allPresent) {
        console.log('   ❌ Some required keys are missing');
      }
      if (!allHaveValues) {
        console.log('   ❌ Some keys have empty values');
      }
      if (!dopplerIntegrationActive && !managedByIntegration) {
        console.log('   ❌ Doppler integration not detected');
      }
      
      console.log('\n📖 Follow the setup guide in CLERK_DOPPLER_SETUP_GUIDE.md\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDopplerSync();
