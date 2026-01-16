const { execSync } = require('child_process');
const os = require('os');

function runDopplerSetup() {
  console.log('Setting up Doppler for getappshots project...');

  // Check if Doppler CLI is installed
  try {
    execSync('doppler --version', { stdio: 'pipe' });
    console.log('Doppler CLI is installed.');
  } catch (error) {
    console.error('Error: Doppler CLI is not installed.');
    console.error('Please install Doppler CLI first:');
    console.error('  macOS: brew install dopplerhq/doppler/doppler');
    console.error('  Ubuntu/Debian: curl -Ls https://cli.doppler.com/install.sh | sh');
    console.error('  Windows: winget install doppler');
    process.exit(1);
  }

  // Determine the OS and run appropriate script
  const platform = os.platform();
  
  try {
    // Setup the Doppler project
    console.log('Setting up Doppler project...');
    execSync('doppler setup --project getappshots', { stdio: 'inherit' });

    // Create configurations for different environments
    console.log('Creating Doppler configurations...');

    console.log('Creating dev configuration...');
    execSync('doppler configs create dev', { stdio: 'inherit' });

    console.log('Creating staging configuration...');
    execSync('doppler configs create staging', { stdio: 'inherit' });

    console.log('Creating prod configuration...');
    execSync('doppler configs create prod', { stdio: 'inherit' });

    console.log('');
    console.log('Doppler setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Add your environment variables to each config:');
    console.log('   doppler secrets set SECRET_KEY=value --config dev');
    console.log('   doppler secrets set SECRET_KEY=value --config staging');
    console.log('   doppler secrets set SECRET_KEY=value --config prod');
    console.log('');
    console.log('2. Run your application with Doppler:');
    console.log('   doppler run -- node app.js');
    console.log('   doppler run -- python -m uvicorn app.main:app --reload');
    console.log('');
    console.log('3. To use in development:');
    console.log('   doppler run -- npm run dev');
    console.log('');
  } catch (error) {
    console.error('An error occurred during Doppler setup:', error.message);
    process.exit(1);
  }
}

// Run the setup
runDopplerSetup();