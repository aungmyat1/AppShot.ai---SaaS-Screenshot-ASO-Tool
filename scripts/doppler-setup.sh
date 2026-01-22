#!/bin/bash

# Doppler Setup Script for getappshots Project
# This script automates the setup of Doppler configuration for the project

set -e  # Exit on error

echo "Setting up Doppler for getappshots project..."
echo ""

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null
then
    echo "✗ Error: Doppler CLI is not installed."
    echo ""
    echo "Please install Doppler CLI first:"
    echo "  macOS: brew install dopplerhq/doppler/doppler"
    echo "  Ubuntu/Debian: curl -Ls https://cli.doppler.com/install.sh | sh"
    echo "  Windows: winget install doppler"
    echo "  Manual: https://docs.doppler.com/docs/enclave-installation"
    echo ""
    exit 1
fi

echo "✓ Doppler CLI is installed."

# Check if user is logged in
if ! doppler me &> /dev/null
then
    echo "⚠ Not logged in to Doppler."
    echo ""
    echo "Please login to Doppler first:"
    echo "  Run: doppler login"
    echo "  This will open your browser to authenticate."
    echo ""
    exit 1
fi

echo "✓ Logged in to Doppler."

# Setup the Doppler project
echo ""
echo "Setting up Doppler project..."
echo "Project: getappshots"
echo ""
doppler setup --project getappshots

# Create configurations for different environments
echo ""
echo "Creating Doppler configurations..."
echo ""

# Create dev config (using existing 'dev' environment)
echo "Creating dev configuration (environment: dev)..."
if doppler configs create dev --environment dev 2>&1 | grep -q "already exists\|duplicate"; then
    echo "⚠ dev configuration already exists, skipping..."
else
    echo "✓ dev configuration created."
fi

# Create staging config (using existing 'preview' environment)
echo "Creating staging configuration (environment: preview)..."
if doppler configs create staging --environment preview 2>&1 | grep -q "already exists\|duplicate"; then
    echo "⚠ staging configuration already exists, skipping..."
else
    echo "✓ staging configuration created."
fi

# Create prod config (using existing 'prd' environment)
echo "Creating prod configuration (environment: prd)..."
if doppler configs create prod --environment prd 2>&1 | grep -q "already exists\|duplicate"; then
    echo "⚠ prod configuration already exists, skipping..."
else
    echo "✓ prod configuration created."
fi

echo ""
echo "✓ Doppler setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Add your environment variables to each config:"
echo "   doppler secrets set SECRET_KEY=value --config dev"
echo "   doppler secrets set SECRET_KEY=value --config staging"
echo "   doppler secrets set SECRET_KEY=value --config prod"
echo ""
echo "2. Set up Vercel integration (see docs/DOPPLER_VERCEL_INTEGRATION.md)"
echo ""
echo "3. Run your application with Doppler:"
echo "   npm run dev:doppler"
echo "   doppler run -- npm run dev"
echo ""
echo "For more information:"
echo "  - Integration guide: docs/DOPPLER_VERCEL_INTEGRATION.md"
echo "  - Doppler docs: https://docs.doppler.com/docs/enclave-overview.html"
echo ""