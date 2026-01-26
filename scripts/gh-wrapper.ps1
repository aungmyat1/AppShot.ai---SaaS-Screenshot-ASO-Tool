# GitHub CLI Wrapper Script
# This script finds and runs GitHub CLI even if it's not in PATH

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Function to find GitHub CLI
function Find-GitHubCLI {
    # Check if gh is in PATH
    $ghInPath = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghInPath) {
        return $ghInPath.Source
    }
    
    # Check common installation paths
    $ghPaths = @(
        "$env:ProgramFiles\GitHub CLI\gh.exe",
        "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe",
        "$env:ProgramFiles(x86)\GitHub CLI\gh.exe"
    )
    
    foreach ($path in $ghPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    return $null
}

# Find GitHub CLI
$ghPath = Find-GitHubCLI

if (-not $ghPath) {
    Write-Host "❌ GitHub CLI not found." -ForegroundColor Red
    Write-Host "`nPlease install GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host "`nOr restart your terminal if you just installed it.`n" -ForegroundColor Yellow
    exit 1
}

# Run GitHub CLI with provided arguments
& $ghPath $Arguments
