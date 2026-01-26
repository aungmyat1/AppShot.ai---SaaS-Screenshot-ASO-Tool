# Setup GitHub Token for Branch Protection Script
# This script helps you set up the GITHUB_TOKEN environment variable

Write-Host "`n🔑 GitHub Token Setup for Branch Protection`n" -ForegroundColor Cyan

Write-Host "To use the branch protection script without GitHub CLI, you need a GitHub Personal Access Token.`n" -ForegroundColor Yellow

Write-Host "Steps to create a token:" -ForegroundColor White
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor Gray
Write-Host "3. Give it a name (e.g., 'Branch Protection Script')" -ForegroundColor Gray
Write-Host "4. Select scope: repo (Full control of private repositories)" -ForegroundColor Gray
Write-Host "5. Click 'Generate token'" -ForegroundColor Gray
Write-Host "6. Copy the token (you won't see it again!)`n" -ForegroundColor Gray

$token = Read-Host "Enter your GitHub token (or press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "`n⚠️  No token provided. Skipping setup." -ForegroundColor Yellow
    Write-Host "`nYou can set it manually later:" -ForegroundColor White
    Write-Host '  $env:GITHUB_TOKEN="your_token_here"' -ForegroundColor Gray
    Write-Host "`nOr add it to your PowerShell profile for persistence." -ForegroundColor White
    exit 0
}

# Set for current session
$env:GITHUB_TOKEN = $token
Write-Host "`n✅ Token set for current PowerShell session" -ForegroundColor Green

# Ask if user wants to add to profile
$addToProfile = Read-Host "`nAdd to PowerShell profile for persistence? (y/n)"

if ($addToProfile -eq 'y' -or $addToProfile -eq 'Y') {
    $profilePath = $PROFILE
    
    if (-not (Test-Path $profilePath)) {
        New-Item -Path $profilePath -ItemType File -Force | Out-Null
        Write-Host "Created PowerShell profile at: $profilePath" -ForegroundColor Gray
    }
    
    # Check if token already exists in profile
    $profileContent = Get-Content $profilePath -ErrorAction SilentlyContinue
    if ($profileContent -notmatch 'GITHUB_TOKEN') {
        Add-Content -Path $profilePath -Value "`n# GitHub Token for Branch Protection Scripts"
        Add-Content -Path $profilePath -Value "`$env:GITHUB_TOKEN = '$token'"
        Write-Host "`n✅ Token added to PowerShell profile" -ForegroundColor Green
        Write-Host "   Profile location: $profilePath" -ForegroundColor Gray
    } else {
        Write-Host "`n⚠️  GITHUB_TOKEN already exists in profile. Update it manually if needed." -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Setup complete! You can now run:" -ForegroundColor Green
Write-Host "   npm run branch:protection:apply" -ForegroundColor White
Write-Host "`n"
