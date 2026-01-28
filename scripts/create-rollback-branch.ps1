# Create a separate branch at the commit BEFORE cc9fbcf (refactor: switch to npm ci).
# Usage: .\scripts\create-rollback-branch.ps1
# Then: git push origin rollback/pre-npm-ci-refactor

$Commit = if ($args[0]) { $args[0] } else { "cc9fbcf" }
$Branch = "rollback/pre-npm-ci-refactor"

Write-Host "Creating branch '$Branch' at commit before $Commit..."
git branch $Branch "$Commit^"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done. Branch '$Branch' points to state before the refactor commit."
Write-Host ""
Write-Host "To push:  git push origin $Branch"
Write-Host "To use it: git checkout $Branch"
