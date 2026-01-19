#!/usr/bin/env node

/**
 * Update Database Connection to Vercel Postgres
 * 
 * This script helps you update your .env.local with Vercel Postgres credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║     Update Vercel Postgres Database Connection       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log('📋 To get your Vercel Postgres connection string:\n');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Storage → Create Database → Postgres (if not created)');
  console.log('4. Click on your database → .env.local tab');
  console.log('5. Copy the POSTGRES_URL value\n');

  const choice = await question('Do you have your Vercel Postgres URL? (y/n): ');

  if (choice.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please get your Vercel Postgres URL first, then run this script again.');
    console.log('\nAlternatively, run: vercel login && vercel env pull\n');
    rl.close();
    return;
  }

  console.log('\n📝 Enter your Vercel Postgres connection string:');
  console.log('   (It should start with: postgres://... or postgresql://...)');
  let databaseUrl = await question('DATABASE_URL: ');

  // Clean up common input mistakes
  databaseUrl = databaseUrl.trim();
  
  // Remove psql command prefix if present
  if (databaseUrl.startsWith('psql ')) {
    databaseUrl = databaseUrl.replace(/^psql\s+/, '');
  }
  
  // Remove quotes if present
  databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');

  if (!databaseUrl || (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://'))) {
    console.log('\n❌ Invalid database URL. Please make sure it starts with postgres:// or postgresql://\n');
    rl.close();
    return;
  }

  // Update .env.local files
  const envFiles = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), 'apps', 'web', '.env.local')
  ];

  for (const envFile of envFiles) {
    try {
      let envContent = '';
      
      if (fs.existsSync(envFile)) {
        envContent = fs.readFileSync(envFile, 'utf-8');
        
        // Replace or update DATABASE_URL
        if (envContent.includes('DATABASE_URL=')) {
          envContent = envContent.replace(
            /DATABASE_URL=.*/g,
            `DATABASE_URL=${databaseUrl}`
          );
        } else {
          envContent += `\nDATABASE_URL=${databaseUrl}\n`;
        }

        // Remove DATABASE_URL_ASYNC if exists (not needed for Vercel Postgres)
        envContent = envContent.replace(/DATABASE_URL_ASYNC=.*\n?/g, '');
        
      } else {
        envContent = `DATABASE_URL=${databaseUrl}\n`;
      }

      fs.writeFileSync(envFile, envContent);
      console.log(`✓ Updated ${envFile}`);
    } catch (error) {
      console.error(`❌ Error updating ${envFile}:`, error.message);
    }
  }

  console.log('\n✅ Database connection updated!\n');
  console.log('Next steps:');
  console.log('1. Test connection: npx prisma db pull --schema apps/web/prisma/schema.prisma');
  console.log('2. Run migrations: npx prisma migrate deploy --schema apps/web/prisma/schema.prisma');
  console.log('3. Start preview: npm run web:dev\n');

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
