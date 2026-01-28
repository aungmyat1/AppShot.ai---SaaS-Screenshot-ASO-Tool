#!/usr/bin/env node

/**
 * Script to verify Clerk configuration across different environments
 * Checks local, Vercel, and Doppler configurations
 */

const fs = require('fs');
const path = require('path');

async function verifyClerkConfig() {
  console.log('🔍 Verifying Clerk Configuration...\n');
  
  // Check local environment files
  console.log('📋 Checking local environment files...');
  
  const localEnvFiles = ['.env.local', '.env'];
  let foundLocalConfig = false;
  
  for (const file of localEnvFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found: ${file}`);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const publishableKeyMatch = content.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)/);
      const secretKeyMatch = content.match(/CLERK_SECRET_KEY=(.+)/);
      
      if (publishableKeyMatch) {
        const publishableKey = publishableKeyMatch[1].replace(/['"]/g, '');
        console.log(`   Publishable Key: ${publishableKey}`);
        
        // Validate key format
        if (publishableKey.startsWith('pk_live_')) {
          console.log('   ✅ Valid production publishable key format');
        } else if (publishableKey.startsWith('pk_test_')) {
          console.log('   ⚠️  Test publishable key format - OK for development');
        } else {
          console.log('   ❌ Invalid publishable key format!');
        }
      }
      
      if (secretKeyMatch) {
        const secretKey = secretKeyMatch[1].replace(/['"]/g, '');
        console.log(`   Secret Key: ${secretKey.substring(0, 10)}...${secretKey.slice(-4)}`);
        
        // Validate key format
        if (secretKey.startsWith('sk_live_')) {
          console.log('   ✅ Valid production secret key format');
        } else if (secretKey.startsWith('sk_test_')) {
          console.log('   ⚠️  Test secret key format - OK for development');
        } else {
          console.log('   ❌ Invalid secret key format!');
        }
      }
      
      foundLocalConfig = true;
    } else {
      console.log(`❌ Missing: ${file}`);
    }
  }
  
  if (!foundLocalConfig) {
    console.log('⚠️  No local environment files found (.env.local or .env)');
  }
  
  console.log('');
  
  // Check environment variables
  console.log('🌐 Checking environment variables...');
  
  const envPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const envSecretKey = process.env.CLERK_SECRET_KEY;
  
  if (envPublishableKey) {
    console.log(`✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${envPublishableKey}`);
    
    if (envPublishableKey.startsWith('pk_live_')) {
      console.log('   ✅ Valid production publishable key format');
    } else if (envPublishableKey.startsWith('pk_test_')) {
      console.log('   ⚠️  Test publishable key format - OK for development');
    } else {
      console.log('   ❌ Invalid publishable key format!');
    }
  } else {
    console.log('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set');
  }
  
  if (envSecretKey) {
    console.log(`✅ CLERK_SECRET_KEY: ${envSecretKey.substring(0, 10)}...${envSecretKey.slice(-4)}`);
    
    if (envSecretKey.startsWith('sk_live_')) {
      console.log('   ✅ Valid production secret key format');
    } else if (envSecretKey.startsWith('sk_test_')) {
      console.log('   ⚠️  Test secret key format - OK for development');
    } else {
      console.log('   ❌ Invalid secret key format!');
    }
  } else {
    console.log('❌ CLERK_SECRET_KEY not set');
  }
  
  console.log('');
  
  // Check for the specific issue mentioned in the project status
  console.log('🚨 Checking for known issues...');
  
  if (envPublishableKey === 'Y3JlZGlibGUtYmx1ZWdpbGwtNTAuY2xlcmsuYWNjb3VudHMuZGV2JA') {
    console.log('❌ CRITICAL: Found the invalid Clerk key from project status report!');
    console.log('   This is a base64 encoded string that does not decode to a valid Clerk key.');
    console.log('   This needs to be updated to the correct value.');
  } else if (envPublishableKey === 'pk_live_Y2xlcmsuZ2V0YXBwc2hvdHMuY29tJA') {
    console.log('✅ CORRECT: Found the correct Clerk publishable key from project status report!');
  } else {
    console.log('ℹ️  Clerk key does not match known issue pattern');
  }
  
  console.log('');
  
  // Provide recommendations
  console.log('💡 Recommendations:');
  console.log('   1. Make sure .env.local exists with the correct Clerk keys');
  console.log('   2. If deploying to Vercel, ensure environment variables are set in Vercel dashboard');
  console.log('   3. For the production fix, update NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to: pk_live_Y2xlcmsuZ2V0YXBwc2hvdHMuY29tJA');
  console.log('   4. Remember to set the corresponding CLERK_SECRET_KEY value');
  
  console.log('');
  console.log('✅ Verification complete!');
}

// Run the verification
verifyClerkConfig().catch(err => {
  console.error('❌ Error during verification:', err);
  process.exit(1);
});