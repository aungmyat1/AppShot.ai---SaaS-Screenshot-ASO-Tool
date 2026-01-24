# Deployment Monitoring Setup

This repository includes automated deployment monitoring for Vercel deployments.

## 🚀 Features

- **Automated deployment status monitoring**
- **GitHub Actions integration**
- **Real-time deployment notifications**
- **CLI tool for manual monitoring**

## 📋 Setup Instructions

### 1. Get Vercel API Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "GitHub Actions" or similar
4. Copy the token

### 2. Get Vercel Project ID

Run in your project:
```bash
vercel project ls
```

Or check your project settings in Vercel dashboard → Settings → General → Project ID

### 3. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `VERCEL_TEAM_ID` - (Optional) Your Vercel team ID if using a team

### 4. Optional: Add Notification Webhooks

For Slack:
- `SLACK_WEBHOOK_URL` - Your Slack webhook URL

For Discord:
- `DISCORD_WEBHOOK_URL` - Your Discord webhook URL

## 🔧 Usage

### Automated Monitoring (GitHub Actions)

The workflows will automatically run on every push to `main` branch and:
1. Wait for Vercel to start the deployment
2. Monitor the deployment status
3. Report success/failure
4. Send notifications (if configured)

### Manual Monitoring (CLI)

Run locally:
```bash
# Set environment variables
export VERCEL_TOKEN="your_token_here"
export VERCEL_PROJECT_ID="your_project_id"

# Monitor current deployment
node scripts/monitor-vercel-deployment.js

# Watch mode (keep checking until deployment completes)
node scripts/monitor-vercel-deployment.js --watch

# Custom check interval (in milliseconds)
node scripts/monitor-vercel-deployment.js --watch --interval=5000
```

### Add to package.json

```json
{
  "scripts": {
    "deploy:monitor": "node scripts/monitor-vercel-deployment.js --watch",
    "deploy:check": "node scripts/monitor-vercel-deployment.js"
  }
}
```

Then use:
```bash
npm run deploy:monitor
```

## 📊 Monitoring Output

The monitoring script provides:
- ✅ Deployment status (READY, BUILDING, ERROR, etc.)
- 🔗 Deployment URL
- ⏱️ Build duration
- 📝 Commit information
- 🔍 Inspector URL for debugging
- 📋 Recent deployment history

## 🔔 Notifications

### Slack Setup

1. Create a Slack webhook: https://api.slack.com/messaging/webhooks
2. Add `SLACK_WEBHOOK_URL` to GitHub secrets
3. Notifications will be sent automatically

### Discord Setup

1. Create a Discord webhook in your server settings
2. Add `DISCORD_WEBHOOK_URL` to GitHub secrets
3. Notifications will be sent automatically

## 🐛 Troubleshooting

### "VERCEL_TOKEN is required"
- Make sure you've set the `VERCEL_TOKEN` environment variable or GitHub secret

### "No deployments found"
- Verify your `VERCEL_PROJECT_ID` is correct
- Check if you need to set `VERCEL_TEAM_ID` (for team projects)

### "Vercel API error (401)"
- Your token may be expired or invalid
- Generate a new token at https://vercel.com/account/tokens

### Deployment not detected
- The script waits 30s for Vercel to pick up the commit
- You may need to increase this delay in the workflow file

## 🔄 Workflow Files

- `.github/workflows/vercel-deploy-monitor.yml` - Monitors deployment status
- `.github/workflows/deploy-notification.yml` - Sends deployment notifications

## 📚 Additional Resources

- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://support.discord.com/hc/en-us/articles/228383668)
