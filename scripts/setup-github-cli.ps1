# Setup GitHub CLI for Branch Protection
# This script helps you install and authenticate GitHub CLI

Write-Host "`n🔧 GitHub CLI Setup for Branch Protection`n" -ForegroundColor Cyan

# Function to check if gh is available (handles PATH issues)
function Test-GitHubCLI {
    try {
        # Try to find gh in common installation paths
        $ghPaths = @(
            "$env:ProgramFiles\GitHub CLI\gh.exe",
            "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe",
            "$env:ProgramFiles(x86)\GitHub CLI\gh.exe"
        )
        
        # Check if gh is in PATH
        $ghInPath = Get-Command gh -ErrorAction SilentlyContinue
        if ($ghInPath) {
            return $ghInPath.Source
        }
        
        # Check common installation paths
        foreach ($path in $ghPaths) {
            if (Test-Path $path) {
                return $path
            }
        }
        
        return $null
    } catch {
        return $null
    }
}

# Check if GitHub CLI is already installed
$ghPath = Test-GitHubCLI
if ($ghPath) {
    Write-Host "✅ GitHub CLI is installed!" -ForegroundColor Green
    Write-Host "   Location: $ghPath" -ForegroundColor Gray
    
    # Try to get version
    try {
        if ($ghPath -match 'gh\.exe$') {
            $ghVersion = & $ghPath --version 2>&1
        } else {
            $ghVersion = gh --version 2>&1
        }
        Write-Host "   Version: $($ghVersion -split "`n" | Select-Object -First 1)" -ForegroundColor Gray
        
        # Check authentication status
        Write-Host "`nChecking authentication status...`n" -ForegroundColor Yellow
        try {
            if ($ghPath -match 'gh\.exe$') {
                & $ghPath auth status 2>&1 | Out-Null
            } else {
                gh auth status 2>&1 | Out-Null
            }
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ GitHub CLI is authenticated!" -ForegroundColor Green
                Write-Host "`nYou can now run: npm run branch:protection:apply`n" -ForegroundColor Cyan
                exit 0
            } else {
                Write-Host "⚠️  GitHub CLI is installed but not authenticated.`n" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  GitHub CLI is installed but not authenticated.`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   (Could not get version - may need terminal restart)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ GitHub CLI is not installed or not found in PATH.`n" -ForegroundColor Red
    Write-Host "   Note: If you just installed it, restart your terminal first.`n" -ForegroundColor Yellow
}

# Installation instructions
Write-Host "To install GitHub CLI on Windows:" -ForegroundColor White
Write-Host "`nOption 1: Using winget (Recommended)" -ForegroundColor Cyan
Write-Host "  winget install --id GitHub.cli" -ForegroundColor Gray
Write-Host "`nOption 2: Using Chocolatey" -ForegroundColor Cyan
Write-Host "  choco install gh" -ForegroundColor Gray
Write-Host "`nOption 3: Using Scoop" -ForegroundColor Cyan
Write-Host "  scoop install gh" -ForegroundColor Gray
Write-Host "`nOption 4: Download from GitHub" -ForegroundColor Cyan
Write-Host "  Visit: https://cli.github.com/" -ForegroundColor Gray

$install = Read-Host "`nWould you like to install GitHub CLI now using winget? (y/n)"

if ($install -eq 'y' -or $install -eq 'Y') {
    Write-Host "`nInstalling GitHub CLI...`n" -ForegroundColor Yellow
    
    try {
        winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq -1978335189) {
            # Exit code -1978335189 means already installed
            Write-Host "`n✅ GitHub CLI installation completed!`n" -ForegroundColor Green
            
            # Try to refresh PATH and find gh
            Write-Host "Refreshing environment...`n" -ForegroundColor Yellow
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            # Wait a moment for PATH to update
            Start-Sleep -Seconds 2
            
            # Check if gh is now available
            $ghPath = Test-GitHubCLI
            if ($ghPath) {
                Write-Host "✅ GitHub CLI is now available!`n" -ForegroundColor Green
                
                # Try to authenticate
                Write-Host "Starting authentication...`n" -ForegroundColor Yellow
                try {
                    if ($ghPath -match 'gh\.exe$') {
                        & $ghPath auth login
                    } else {
                        gh auth login
                    }
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "`n✅ Setup complete! You can now run:" -ForegroundColor Green
                        Write-Host "   npm run branch:protection:apply`n" -ForegroundColor White
                    } else {
                        Write-Host "`n⚠️  Authentication may need to be completed manually.`n" -ForegroundColor Yellow
                        Write-Host "After restarting your terminal, run:" -ForegroundColor Yellow
                        Write-Host "   gh auth login" -ForegroundColor White
                        Write-Host "   npm run branch:protection:apply`n" -ForegroundColor White
                    }
                } catch {
                    Write-Host "`n⚠️  Please restart your terminal, then run:" -ForegroundColor Yellow
                    Write-Host "   gh auth login" -ForegroundColor White
                    Write-Host "   npm run branch:protection:apply`n" -ForegroundColor White
                }
            } else {
                Write-Host "⚠️  GitHub CLI installed, but not yet available in this session.`n" -ForegroundColor Yellow
                Write-Host "Please restart your terminal, then run:" -ForegroundColor Yellow
                Write-Host "   gh auth login" -ForegroundColor White
                Write-Host "   npm run branch:protection:apply`n" -ForegroundColor White
            }
        } else {
            Write-Host "`n❌ Installation failed. Please install manually.`n" -ForegroundColor Red
        }
    } catch {
        Write-Host "`n❌ Error during installation: $_`n" -ForegroundColor Red
        Write-Host "Please install GitHub CLI manually.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📝 Manual Installation Steps:" -ForegroundColor Cyan
    Write-Host "`n1. Install GitHub CLI:" -ForegroundColor White
    Write-Host "   winget install --id GitHub.cli" -ForegroundColor Gray
    Write-Host "`n2. Restart your terminal" -ForegroundColor White
    Write-Host "`n3. Authenticate:" -ForegroundColor White
    Write-Host "   gh auth login" -ForegroundColor Gray
    Write-Host "`n4. Verify:" -ForegroundColor White
    Write-Host "   gh auth status" -ForegroundColor Gray
    Write-Host "`n5. Run branch protection:" -ForegroundColor White
    Write-Host "   npm run branch:protection:apply`n" -ForegroundColor Gray
}
