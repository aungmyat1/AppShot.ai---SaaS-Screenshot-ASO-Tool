#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Test GitHub Token
 * 
 * This script tests if the GITHUB_TOKEN is valid and has required scopes.
 */

const https = require('https');

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!token) {
  console.error('❌ GITHUB_TOKEN not set');
  console.error('\nSet it:');
  console.error('  Windows: $env:GITHUB_TOKEN="your_token"');
  console.error('  Linux/Mac: export GITHUB_TOKEN="your_token"');
  process.exit(1);
}

console.log('\n🔍 Testing GitHub Token...\n');
console.log(`Token: ${token.substring(0, 20)}...`);

function testToken() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`,
        'User-Agent': 'Node.js-Token-Test',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const user = JSON.parse(data);
            const scopes = res.headers['x-oauth-scopes'] || res.headers['x-accepted-oauth-scopes'] || 'unknown';
            
            console.log('✅ Token is VALID!\n');
            console.log(`   User: ${user.login}`);
            console.log(`   Name: ${user.name || 'N/A'}`);
            console.log(`   Scopes: ${scopes}`);
            
            if (scopes && !scopes.includes('repo')) {
              console.log('\n⚠️  WARNING: Token missing "repo" scope!');
              console.log('   Branch protection requires "repo" scope.');
              console.log('   Update token at: https://github.com/settings/tokens');
            } else {
              console.log('\n✅ Token has required scopes for branch protection');
            }
            
            resolve(true);
          } catch (e) {
            console.error('❌ Error parsing response:', e.message);
            reject(e);
          }
        } else if (res.statusCode === 401) {
          console.error('❌ Token is INVALID or EXPIRED!');
          console.error(`   Status: ${res.statusCode}`);
          try {
            const error = JSON.parse(data);
            console.error(`   Message: ${error.message}`);
          } catch {
            console.error(`   Response: ${data.substring(0, 200)}`);
          }
          console.error('\n💡 Fix:');
          console.error('   1. Go to: https://github.com/settings/tokens');
          console.error('   2. Create new token with "repo" scope');
          console.error('   3. Update: $env:GITHUB_TOKEN="new_token"');
          reject(new Error('Invalid token'));
        } else {
          console.error(`❌ Unexpected status: ${res.statusCode}`);
          console.error(`   Response: ${data.substring(0, 200)}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.error('❌ Request timeout');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

testToken()
  .then(() => {
    console.log('\n✅ Token test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Token test failed!');
    process.exit(1);
  });
