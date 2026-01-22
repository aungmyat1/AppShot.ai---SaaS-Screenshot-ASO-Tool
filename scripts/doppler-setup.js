const { execSync } = require('child_process');
const os = require('os');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function execDoppler(command, options = {}) {
  try {
    const result = execSync(command, { 
      stdio: options.stdio || 'pipe',
      encoding: 'utf8',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString()
    };
  }
}

function getExistingEnvironments() {
  const result = execDoppler('doppler environments --json');
  if (!result.success) {
    return [];
  }
  
  try {
    const envs = JSON.parse(result.output);
    return envs.map(env => ({
      id: env.id,
      name: env.name,
      slug: env.slug || env.id
    }));
  } catch (e) {
    // If JSON parsing fails, try to parse text output
    const lines = result.output.split('\n').filter(line => line.trim());
    const envs = [];
    for (const line of lines) {
      // Parse table format: ID | NAME | ...
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2 && parts[0] && parts[0] !== 'ID') {
        envs.push({
          id: parts[0],
          name: parts[1] || parts[0],
          slug: parts[0]
        });
      }
    }
    return envs;
  }
}

function environmentExists(envs, envId) {
  return envs.some(env => 
    env.id === envId || 
    env.slug === envId || 
    env.name.toLowerCase() === envId.toLowerCase()
  );
}

function createEnvironmentIfNeeded(envId, envName) {
  const existing = getExistingEnvironments();
  
  // Check if environment already exists
  if (environmentExists(existing, envId)) {
    console.log(`✓ Environment "${envId}" already exists.`);
    return { success: true, created: false, id: envId };
  }
  
  console.log(`Creating environment "${envId}" (${envName})...`);
  const result = execDoppler(`doppler environments create ${envName} ${envId}`);
  
  if (result.success) {
    console.log(`✓ Environment "${envId}" created.`);
    return { success: true, created: true, id: envId };
  } else {
    // Check if it was created by another process
    const checkAgain = getExistingEnvironments();
    if (environmentExists(checkAgain, envId)) {
      console.log(`✓ Environment "${envId}" exists (created elsewhere).`);
      return { success: true, created: false, id: envId };
    }
    console.log(`⚠ Could not create environment "${envId}": ${result.error}`);
    return { success: false, created: false, id: envId };
  }
}

function createConfigIfNeeded(configName, environmentId) {
  // First check if config already exists
  const checkResult = execDoppler(`doppler configs get ${configName} --json`);
  if (checkResult.success) {
    console.log(`⚠ Config "${configName}" already exists, skipping...`);
    return { success: true, created: false };
  }
  
  console.log(`Creating config "${configName}" (environment: ${environmentId})...`);
  const result = execDoppler(
    `doppler configs create ${configName} --environment ${environmentId}`,
    { stdio: 'inherit' }
  );
  
  if (result.success) {
    console.log(`✓ Config "${configName}" created.`);
    return { success: true, created: true };
  } else {
    const errorOutput = result.stderr || result.error || '';
    if (errorOutput.includes('already exists') || errorOutput.includes('duplicate')) {
      console.log(`⚠ Config "${configName}" already exists, skipping...`);
      return { success: true, created: false };
    }
    throw new Error(`Failed to create config "${configName}": ${result.error || result.stderr}`);
  }
}

async function runDopplerSetup() {
  console.log('🚀 Setting up Doppler for getappshots project...\n');

  // Check if Doppler CLI is installed
  const cliCheck = execDoppler('doppler --version');
  if (!cliCheck.success) {
    console.error('✗ Error: Doppler CLI is not installed.');
    console.error('\nPlease install Doppler CLI first:');
    console.error('  macOS: brew install dopplerhq/doppler/doppler');
    console.error('  Ubuntu/Debian: curl -Ls https://cli.doppler.com/install.sh | sh');
    console.error('  Windows: winget install doppler');
    console.error('  Manual: https://docs.doppler.com/docs/enclave-installation\n');
    process.exit(1);
  }
  console.log('✓ Doppler CLI is installed.');

  // Check if user is logged in
  const loginCheck = execDoppler('doppler me');
  if (!loginCheck.success) {
    console.log('⚠ Not logged in to Doppler.');
    console.log('\nPlease login to Doppler first:');
    console.log('  Run: doppler login');
    console.log('  This will open your browser to authenticate.\n');
    process.exit(1);
  }
  console.log('✓ Logged in to Doppler.');

  try {
    // Setup the Doppler project
    console.log('\n📦 Setting up Doppler project...');
    console.log('Project: getappshots\n');
    execSync('doppler setup --project getappshots', { stdio: 'inherit' });

    // Check existing environments
    console.log('\n🔍 Checking existing environments...');
    const existingEnvs = getExistingEnvironments();
    console.log(`Found ${existingEnvs.length} existing environment(s).`);

    // Define our required environments and configs
    // Map: config name -> { environmentId, environmentName }
    const configs = [
      { 
        name: 'dev', 
        envId: 'dev',  // Use existing 'dev' or create 'development'
        envName: 'Development',
        vercelEnv: 'Development'
      },
      { 
        name: 'staging', 
        envId: 'preview',  // Use existing 'preview' or create 'staging'
        envName: 'Staging',
        vercelEnv: 'Preview'
      },
      { 
        name: 'prod', 
        envId: 'prd',  // Use existing 'prd' or create 'production'
        envName: 'Production',
        vercelEnv: 'Production'
      }
    ];

    // Try to use existing environments first, create if needed
    console.log('\n🌍 Setting up environments...\n');
    for (const config of configs) {
      // Check if the environment ID exists
      if (!environmentExists(existingEnvs, config.envId)) {
        // Try alternative names
        const alternatives = {
          'dev': ['development', 'dev'],
          'preview': ['staging', 'preview'],
          'prd': ['production', 'prd', 'prod']
        };
        
        let found = false;
        for (const alt of alternatives[config.envId] || []) {
          if (environmentExists(existingEnvs, alt)) {
            config.envId = alt;
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Create the environment
          createEnvironmentIfNeeded(config.envId, config.envName);
        }
      } else {
        console.log(`✓ Using existing environment "${config.envId}".`);
      }
    }

    // Create configurations
    console.log('\n⚙️  Creating Doppler configurations...\n');
    for (const config of configs) {
      createConfigIfNeeded(config.name, config.envId);
    }

    console.log('\n✅ Doppler setup completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 NEXT STEPS FOR VERCEL DEPLOYMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('1️⃣  Add Storage Secrets to Doppler Configs');
    console.log('   For each config (dev, staging, prod), add your storage credentials:\n');
    console.log('   # Development');
    console.log('   doppler secrets set --config dev \\');
    console.log('     R2_ACCOUNT_ID="your-dev-account-id" \\');
    console.log('     R2_BUCKET_NAME="getappshots-dev" \\');
    console.log('     R2_ACCESS_KEY_ID="dev-access-key" \\');
    console.log('     R2_SECRET_ACCESS_KEY="dev-secret-key" \\');
    console.log('     STORAGE_ENDPOINT_URL="https://account-id.r2.cloudflarestorage.com" \\');
    console.log('     STORAGE_BUCKET="getappshots-dev" \\');
    console.log('     STORAGE_REGION="auto" \\');
    console.log('     STORAGE_ACCESS_KEY_ID="dev-access-key" \\');
    console.log('     STORAGE_SECRET_ACCESS_KEY="dev-secret-key"\n');
    console.log('   # Repeat for staging and prod with appropriate values\n');
    
    console.log('2️⃣  Install Doppler Integration in Vercel');
    console.log('   a. Go to Vercel Dashboard → Your Project → Settings → Integrations');
    console.log('   b. Search for "Doppler" and click "Add Integration"');
    console.log('   c. Authorize the connection');
    console.log('   d. Select project: getappshots');
    console.log('   e. Map environments:');
    console.log('      - Development → dev config');
    console.log('      - Preview → staging config');
    console.log('      - Production → prod config');
    console.log('   f. Click "Save"\n');
    
    console.log('3️⃣  Set Up Vercel Built-in Integrations');
    console.log('   In Vercel Dashboard → Settings → Integrations:\n');
    console.log('   ✓ Clerk Integration (auto-syncs 2 vars)');
    console.log('   ✓ Stripe Integration (auto-syncs 2 vars)');
    console.log('   ✓ Vercel Postgres (auto-creates POSTGRES_URL)');
    console.log('   ✓ Vercel KV (optional, auto-creates 2 vars)\n');
    
    console.log('4️⃣  Add Remaining Environment Variables in Vercel');
    console.log('   In Vercel Dashboard → Settings → Environment Variables:\n');
    console.log('   For each environment (Development/Preview/Production):');
    console.log('   - DATABASE_URL = $POSTGRES_URL (reference)');
    console.log('   - JWT_SECRET_KEY = "your-secure-random-string"');
    console.log('   - SCRAPE_QUEUE_MODE = "sync"');
    console.log('   - PLAY_SCRAPE_MODE = "html"');
    console.log('   - PLAY_SCRAPE_FALLBACK_PLAYWRIGHT = "false"');
    console.log('   - ADMIN_EMAILS = "admin@example.com"');
    console.log('   - NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in"');
    console.log('   - NEXT_PUBLIC_CLERK_SIGN_UP_URL = "/sign-up"');
    console.log('   - STRIPE_WEBHOOK_SECRET = "whsec_..."');
    console.log('   - STRIPE_PRICE_PRO = "price_..."');
    console.log('   - NEXT_PUBLIC_STRIPE_PRICE_PRO = "price_..."\n');
    
    console.log('5️⃣  Verify Setup');
    console.log('   Run: npm run env:check:doppler');
    console.log('   Or check in Vercel Dashboard → Settings → Environment Variables\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 Documentation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('  • Complete guide: docs/DOPPLER_VERCEL_INTEGRATION.md');
    console.log('  • Quick setup: docs/QUICK_SETUP_SECRETS.md');
    console.log('  • Secrets strategy: docs/RECOMMENDED_SECRETS_STRATEGY.md');
    console.log('  • Doppler docs: https://docs.doppler.com/docs/enclave-overview.html\n');
    
  } catch (error) {
    console.error('\n✗ An error occurred during Doppler setup:');
    console.error(error.message);
    if (error.stdout) console.error('Output:', error.stdout.toString());
    if (error.stderr) console.error('Error:', error.stderr.toString());
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
runDopplerSetup();
