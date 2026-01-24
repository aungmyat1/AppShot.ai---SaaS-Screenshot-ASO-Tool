#!/usr/bin/env node

const TEST_URL = 'https://getappshots-29c9irlut-aung-myats-projects-142f3377.vercel.app';

console.log('🧪 Testing latest deployment...\n');
console.log(`URL: ${TEST_URL}\n`);

async function testDeployment() {
  try {
    console.log('🔄 Fetching homepage...\n');
    
    const response = await fetch(TEST_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (response.status === 500) {
      const text = await response.text();
      
      if (text.includes('MIDDLEWARE_INVOCATION_FAILED')) {
        console.log('❌ STILL FAILING: Middleware invocation failed\n');
        console.log('This means Clerk keys are still not accessible to middleware.\n');
        return false;
      }
    }

    if (response.ok) {
      console.log('✅ SUCCESS! No 500 error!\n');
      console.log('🎉 Middleware is working correctly!\n');
      console.log('The globalEnv fix worked!\n');
      return true;
    }

    console.log(`⚠️  Unexpected status: ${response.status}\n`);
    return false;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

testDeployment().then(success => {
  if (success) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ DEPLOYMENT VERIFIED WORKING!\n');
    console.log('🔗 Live site: https://getappshots.vercel.app\n');
    console.log('Next steps:');
    console.log('1. Test Clerk authentication');
    console.log('2. Update turbo.json on GitHub with remaining env vars');
    console.log('3. Celebrate! 🎉\n');
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Need to investigate further\n');
  }
  
  process.exit(success ? 0 : 1);
});
