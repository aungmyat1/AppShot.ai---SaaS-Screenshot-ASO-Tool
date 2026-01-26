# GitHub Branch Protection Configuration Script (PowerShell)
# This script configures branch protection rules using GitHub CLI
# 
# Prerequisites:
#   1. Install GitHub CLI: winget install --id GitHub.cli
#   2. Authenticate: gh auth login
#
# Usage:
#   .\scripts\configure-branch-protection.ps1
#   .\scripts\configure-branch-protection.ps1 -Branch main
#   .\scripts\configure-branch-protection.ps1 -Branch staging
#   .\scripts\configure-branch-protection.ps1 -Branch develop
#   .\scripts\configure-branch-protection.ps1 -All

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("main", "staging", "develop", "all")]
    [string]$Branch = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$REPO_OWNER = "aungmyat1"
$REPO_NAME = "AppShot.ai---SaaS-Screenshot-ASO-Tool"

# Status checks from CI workflow
$STATUS_CHECKS = @{
    main = @(
        "Web • lint / typecheck / unit tests",
        "API • black / pylint / mypy / pytest",
        "API • integration smoke (uvicorn + /health)",
        "Web • E2E (Playwright)",
        "Security • dependency and secret scanning"
    )
    staging = @(
        "Web • lint / typecheck / unit tests",
        "API • black / pylint / mypy / pytest",
        "Web • E2E (Playwright)"
    )
    develop = @(
        "Web • lint / typecheck / unit tests",
        "API • black / pylint / mypy / pytest"
    )
}

# Branch protection configurations
$PROTECTION_CONFIG = @{
    main = @{
        requiredApprovals = 2
        requireCodeOwners = $true
        requireLinearHistory = $true
        requireSignedCommits = $true
        enforceAdmins = $true
        allowForcePushes = $false
        allowDeletions = $false
        requireConversationResolution = $true
    }
    staging = @{
        requiredApprovals = 1
        requireCodeOwners = $false
        requireLinearHistory = $false
        requireSignedCommits = $false
        enforceAdmins = $false
        allowForcePushes = $false
        allowDeletions = $false
        requireConversationResolution = $true
    }
    develop = @{
        requiredApprovals = 1
        requireCodeOwners = $false
        requireLinearHistory = $false
        requireSignedCommits = $false
        enforceAdmins = $false
        allowForcePushes = $false
        allowDeletions = $false
        requireConversationResolution = $true
    }
}

function Test-GitHubCLI {
    try {
        $null = gh --version 2>&1
        return $true
    } catch {
        return $false
    }
}

function Test-GitHubAuth {
    try {
        $status = gh auth status 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Configure-BranchProtection {
    param(
        [string]$BranchName,
        [hashtable]$Config,
        [string[]]$StatusChecks
    )
    
    Write-Host "`n🔒 Configuring branch protection for: $BranchName" -ForegroundColor Cyan
    
    # Build status checks JSON
    $statusChecksJson = ($StatusChecks | ForEach-Object { "`"$_`"" }) -join ","
    $statusChecksJson = "[$statusChecksJson]"
    $requiredStatusChecks = @{
        strict = $true
        contexts = $StatusChecks
    } | ConvertTo-Json -Compress
    
    # Build PR reviews JSON
    $requiredPRReviews = @{
        required_approving_review_count = $Config.requiredApprovals
        dismiss_stale_reviews = $true
        require_code_owner_reviews = $Config.requireCodeOwners
    } | ConvertTo-Json -Compress
    
    # Build the API call
    $apiUrl = "repos/$REPO_OWNER/$REPO_NAME/branches/$BranchName/protection"
    
    $body = @{
        required_status_checks = $requiredStatusChecks | ConvertFrom-Json | ConvertTo-Json -Compress
        enforce_admins = $Config.enforceAdmins
        required_pull_request_reviews = $requiredPRReviews | ConvertFrom-Json | ConvertTo-Json -Compress
        restrictions = $null
        required_linear_history = $Config.requireLinearHistory
        allow_force_pushes = $Config.allowForcePushes
        allow_deletions = $Config.allowDeletions
    }
    
    if ($DryRun) {
        Write-Host "`n[DRY RUN] Would execute:" -ForegroundColor Yellow
        Write-Host "gh api $apiUrl --method PUT \"
        Write-Host "  --field required_status_checks='$requiredStatusChecks' \"
        Write-Host "  --field enforce_admins=$($Config.enforceAdmins.ToString().ToLower()) \"
        Write-Host "  --field required_pull_request_reviews='$requiredPRReviews' \"
        Write-Host "  --field restrictions=null \"
        Write-Host "  --field required_linear_history=$($Config.requireLinearHistory.ToString().ToLower()) \"
        Write-Host "  --field allow_force_pushes=$($Config.allowForcePushes.ToString().ToLower()) \"
        Write-Host "  --field allow_deletions=$($Config.allowDeletions.ToString().ToLower())"
        return
    }
    
    # Execute the API call
    try {
        $statusChecksField = $requiredStatusChecks | ConvertTo-Json -Compress
        $prReviewsField = $requiredPRReviews | ConvertTo-Json -Compress
        
        $command = "gh api $apiUrl --method PUT " +
                   "--field required_status_checks='$statusChecksField' " +
                   "--field enforce_admins=$($Config.enforceAdmins.ToString().ToLower()) " +
                   "--field required_pull_request_reviews='$prReviewsField' " +
                   "--field restrictions=null " +
                   "--field required_linear_history=$($Config.requireLinearHistory.ToString().ToLower()) " +
                   "--field allow_force_pushes=$($Config.allowForcePushes.ToString().ToLower()) " +
                   "--field allow_deletions=$($Config.allowDeletions.ToString().ToLower())"
        
        Write-Host "Executing: gh api $apiUrl --method PUT" -ForegroundColor Gray
        Invoke-Expression $command
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully configured protection for $BranchName" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to configure protection for $BranchName" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error configuring protection: $_" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Main execution
Write-Host "`n📋 GitHub Branch Protection Configuration`n" -ForegroundColor Cyan

# Check GitHub CLI
if (-not (Test-GitHubCLI)) {
    Write-Host "❌ GitHub CLI is not installed." -ForegroundColor Red
    Write-Host "`nInstall it with:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "`nOr download from: https://cli.github.com/" -ForegroundColor White
    exit 1
}

# Check authentication
if (-not (Test-GitHubAuth)) {
    Write-Host "❌ GitHub CLI is not authenticated." -ForegroundColor Red
    Write-Host "`nAuthenticate with:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor White
    exit 1
}

Write-Host "✅ GitHub CLI is installed and authenticated`n" -ForegroundColor Green

# Configure branches
$branchesToConfigure = @()

if ($Branch -eq "all") {
    $branchesToConfigure = @("main", "staging", "develop")
} else {
    $branchesToConfigure = @($Branch)
}

foreach ($branchName in $branchesToConfigure) {
    if ($PROTECTION_CONFIG.ContainsKey($branchName) -and $STATUS_CHECKS.ContainsKey($branchName)) {
        Configure-BranchProtection -BranchName $branchName -Config $PROTECTION_CONFIG[$branchName] -StatusChecks $STATUS_CHECKS[$branchName]
    } else {
        Write-Host "⚠️  No configuration found for branch: $branchName" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Configuration complete!`n" -ForegroundColor Green
