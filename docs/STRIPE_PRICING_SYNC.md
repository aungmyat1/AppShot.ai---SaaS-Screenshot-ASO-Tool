# Stripe Integration & Pricing Management

This guide covers Stripe setup, pricing management, and webhook configuration for GetAppShots.

## Overview

This guide covers:
1. **Stripe Setup** - Initial Stripe integration and configuration
2. **Pricing Management** - Centralized pricing configuration and sync
3. **Webhook Setup** - Configuring Stripe webhooks for subscription events

Pricing is centralized in `apps/web/lib/pricing-config.ts`. When you update prices in this file, you can automatically sync them to Stripe using the sync script.

---

## Part 1: Initial Stripe Setup

### Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to "Developers" → "API keys"
3. Copy your keys:
   - **Secret key** (starts with `sk_test_` for testing or `sk_live_` for production)
   - **Publishable key** (starts with `pk_test_` for testing or `pk_live_` for production)

### Step 2: Set Environment Variables

**For Local Development:**
```bash
# Add to .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**For Vercel:**
- Use Vercel's Stripe integration (recommended) - see [Vercel Integrations Guide](./DEPLOY_VERCEL_INTEGRATIONS.md)
- Or manually add in Vercel Dashboard → Settings → Environment Variables

### Step 3: Create Products and Prices

Run the sync script to automatically create products and prices:

```bash
npm run stripe:sync
```

This will:
- Create "AppShot.ai Pro" product in Stripe
- Create monthly recurring price ($29.00)
- Output price IDs for environment variables

### Step 4: Set Price Environment Variables

After running the sync script, copy the price IDs from the output:

```bash
# Add to .env.local or Vercel
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
```

### Step 5: Configure Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   - **Local**: Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - **Production**: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.created`
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add to environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 6: Verify Setup

Run the verification script:

```bash
npm run stripe:check
```

This checks:
- ✅ Environment variables are set
- ✅ Products and prices exist in Stripe
- ✅ Webhook secret is configured

---

## Part 2: Pricing Management

### How It Works

1. **Single Source of Truth**: All pricing information is defined in `apps/web/lib/pricing-config.ts`
2. **Automatic Sync**: Run `npm run stripe:sync` to create/update Stripe products and prices
3. **Auto-Update**: The application automatically uses the pricing config for limits and display

## Pricing Configuration

Edit `apps/web/lib/pricing-config.ts` to update prices:

```typescript
export const PRICING_PLANS: Record<Plan, PricingPlan> = {
  PRO: {
    id: "PRO",
    name: "Pro",
    priceCents: 2900, // $29.00 - Change this to update price
    priceDollars: 29,
    screenshotLimit: 500,
    perJobCap: 30,
    features: ["500 screenshots / month", "Priority support"],
  },
  // ...
};
```

### When You Change Prices

1. **Update the config file** (`apps/web/lib/pricing-config.ts`)
2. **Run the sync script**: `npm run stripe:sync`
3. **Update environment variables** with the new price IDs (the script will show you what to update)

## Syncing to Stripe

### First Time Setup

1. Make sure `STRIPE_SECRET_KEY` is set in your environment
2. Run the sync script:
   ```bash
   npm run stripe:sync
   ```
3. The script will:
   - Create Stripe products if they don't exist
   - Create new prices for your plans
   - Show you the price IDs to add to your environment variables

### Updating Prices

When you change a price in `pricing-config.ts`:

1. **Preview changes** (optional):
   ```bash
   npm run stripe:sync -- --dry-run
   ```

2. **Sync to Stripe**:
   ```bash
   npm run stripe:sync
   ```

3. **Update environment variables**:
   - The script will output the new price IDs
   - Update `STRIPE_PRICE_PRO` and `NEXT_PUBLIC_STRIPE_PRICE_PRO` in:
     - Your local `.env` file
     - Vercel Dashboard → Settings → Environment Variables

### Important Notes

- **Existing Subscriptions**: When you create a new price, existing subscriptions will continue using their current price until they renew or you manually update them
- **Price IDs**: Each price change creates a new price ID. Old price IDs remain valid for existing subscriptions
- **Force Update**: Use `--force` flag only if you need to archive old prices (not recommended for production)

## Environment Variables

After syncing, you'll need these environment variables:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from sync script output)
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
```

## Script Options

```bash
# Normal sync (creates/updates products and prices)
npm run stripe:sync

# Dry run (preview changes without making them)
npm run stripe:sync -- --dry-run

# Force update (use with caution)
npm run stripe:sync -- --force
```

## Troubleshooting

### "STRIPE_SECRET_KEY not found"
- Make sure you have `STRIPE_SECRET_KEY` set in your environment
- For local development, add it to your `.env` file

### "Product already exists"
- This is normal if you've run the script before
- The script will reuse existing products and create new prices if the amount changed

### "Price ID doesn't match"
- If you see a warning about price IDs not matching your env vars, update your environment variables with the new price ID shown in the output

## Integration with Application

The pricing config is automatically used by:

- **`apps/web/lib/limits.ts`**: Enforces screenshot limits based on plan
- **`apps/web/app/page.tsx`**: Displays pricing on the homepage
- **`apps/web/app/(marketing)/pricing/page.tsx`**: Shows pricing table
- **Stripe webhooks**: Maps Stripe price IDs to plans

## Best Practices

1. **Test First**: Always run with `--dry-run` first to preview changes
2. **Version Control**: Commit pricing changes to `pricing-config.ts` so your team stays in sync
3. **Document Changes**: When updating prices, document the reason and effective date
4. **Notify Users**: If increasing prices, notify existing customers in advance
5. **Staging First**: Test price changes in a staging environment before production

## Example Workflow

```bash
# 1. Update price in pricing-config.ts (e.g., change $29 to $39)
# Edit apps/web/lib/pricing-config.ts

# 2. Preview the changes
npm run stripe:sync -- --dry-run

# 3. Sync to Stripe
npm run stripe:sync

# 4. Update environment variables (copy from script output)
# STRIPE_PRICE_PRO=price_new123...
# NEXT_PUBLIC_STRIPE_PRICE_PRO=price_new123...

# 5. Redeploy application
# (Vercel will pick up new env vars on next deploy)
```

## Support

For issues or questions:
- Check the script output for error messages
- Verify your Stripe API key has the correct permissions
- Ensure your pricing config matches your Stripe account currency (USD)
