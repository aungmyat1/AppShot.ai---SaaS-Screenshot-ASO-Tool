# Set GitHub Token from Terminal

## Quick Setup

You have a GitHub token visible in your terminal. Here's how to set it properly:

### Step 1: Set the Token (Use Quotes!)

```powershell
# Set the token with quotes (IMPORTANT!)


# Verify it's set
echo $env:GITHUB_TOKEN
```

### Step 2: Test the Token

```powershell
# Test GitHub CLI authentication
gh auth status

# Test API access
gh api user

# If both work, you're good to go!
```

### Step 3: Apply Branch Protection Rules

Once the token is set and working:

```powershell
# Use the script (recommended)
node scripts/apply-branch-protection-from-json.js

# Or use GitHub CLI directly
gh api repos/aungmyat1/AppShot.ai---SaaS-Screenshot-ASO-Tool/branches/main/protection --method PUT --input branch-protection-rules.json
```

## Make Token Persistent (Optional)

To keep the token across PowerShell sessions:



## Security Note

⚠️ **Important:** This token is now visible in your terminal history. Consider:
1. Revoking this token after testing
2. Creating a new token
3. Not storing it in plain text files

---

**Last Updated**: 2026-01-27
**Status**: Instructions to set token from terminal
