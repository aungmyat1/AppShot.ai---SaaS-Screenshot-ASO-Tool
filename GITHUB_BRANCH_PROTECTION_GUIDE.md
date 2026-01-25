# GitHub Branch Protection Rules Setup Guide

This document explains how to set up branch protection rules in GitHub to enforce proper workflow practices for the AppShot.ai project.

## Overview

Branch protection rules help maintain code quality and enforce team collaboration workflows by requiring certain conditions to be met before changes can be merged into protected branches (like `main`).

## Recommended Branch Protection Settings

### For the `main` branch:

1. **Require pull request reviews before merging**
   - Require at least 1 reviewer
   - Require approval from authorized reviewers (disable approval from authors)
   - Require review from code owners if CODEOWNERS file exists

2. **Require status checks to pass before merging**
   - Enable "Require branches to be up to date before merging"
   - Select the required status checks:
     - `build` (from your CI/CD pipeline)
     - `test` (from your CI/CD pipeline)
     - `lint` (from your CI/CD pipeline)
     - Any other relevant checks for your workflow

3. **Require signed commits**
   - Enable "Require signed commits" to ensure code integrity

4. **Restrict who can push to matching branches**
   - Restrict pushes to authorized users, teams, or apps only
   - Consider allowing only maintainers or specific roles to push directly

5. **Other recommended settings**
   - Enable "Include administrators" to apply these rules to repo admins as well
   - Enable "Allow force pushes" only for specific authorized users (typically disabled)
   - Enable "Lock branch" if you want to prevent any changes whatsoever

## Setting Up Branch Protection Rules

### Step-by-step instructions:

1. Navigate to your repository on GitHub
2. Go to the "Settings" tab
3. Click "Branches" in the left sidebar
4. Click "Add rule" under "Branch protection rules"

5. Enter `main` as the branch name pattern (or `*` if you want to apply to all branches with a wildcard)

6. Configure the protection settings as outlined above:
   - Check "Require pull request reviews before merging"
   - Set the number of approving reviewers required
   - Check "Require status checks to pass before merging"
   - Select the required status checks from your CI/CD pipeline
   - Check "Require branches to be up to date before merging"
   - Check "Include administrators"

7. Click "Create" to save the branch protection rule

## Integration with Project Workflow

These branch protection rules support the project's workflow by:

- Ensuring all code changes go through peer review
- Requiring automated tests to pass before merging
- Maintaining a linear history by requiring PRs instead of direct commits
- Enforcing that contributors sync with the latest main branch before merging

## CI/CD Integration

Make sure your CI/CD pipeline includes the following checks that correspond to your branch protection rules:

- Build process: `npm run build` or `turbo build`
- Linting: `npm run lint` or equivalent
- Testing: Unit, integration, and E2E tests as appropriate
- Security scanning (optional but recommended)

## Additional Recommendations

1. **Consider separate rules for different branches:**
   - Main branch: Full protection as described above
   - Develop branch: Slightly less restrictive for day-to-day development

2. **Regularly review and update protection rules** as your team and project grow

3. **Document code owner responsibilities** if using CODEOWNERS files

4. **Train team members** on the proper PR workflow to minimize friction

## Troubleshooting

### If legitimate changes are blocked:
- Check that CI/CD workflows are passing
- Verify you have appropriate permissions
- Ensure your branch is up-to-date with the target branch

### If you need temporary access:
- Create an emergency process for urgent fixes
- Consider having backup maintainers with admin rights
- Document the process for temporarily adjusting protection rules if absolutely necessary

## Conclusion

Setting up proper branch protection rules is crucial for maintaining code quality and enforcing good development practices in your team. These rules help ensure that all changes go through proper review and testing before reaching your main branch.