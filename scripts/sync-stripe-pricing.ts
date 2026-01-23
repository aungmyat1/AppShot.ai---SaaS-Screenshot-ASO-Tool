#!/usr/bin/env tsx
/**
 * Stripe Pricing Sync Script
 * 
 * This script syncs pricing plans from the centralized config to Stripe.
 * It creates or updates Stripe products and prices based on apps/web/lib/pricing-config.ts
 * 
 * Usage:
 *   npm run stripe:sync
 *   npm run stripe:sync -- --dry-run  (preview changes without making them)
 *   npm run stripe:sync -- --force    (force update existing prices)
 */

import Stripe from "stripe";
import { PRICING_PLANS, getActivePricingPlans } from "../apps/web/lib/pricing-config";

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE_UPDATE = process.argv.includes("--force");

if (DRY_RUN) {
  console.log("🔍 DRY RUN MODE - No changes will be made to Stripe\n");
}

// Load Stripe secret key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error("❌ Error: STRIPE_SECRET_KEY environment variable is required");
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

interface SyncResult {
  planId: string;
  productId: string | null;
  priceId: string | null;
  action: "created" | "updated" | "skipped" | "error";
  error?: string;
}

async function syncPlanToStripe(plan: typeof PRICING_PLANS.PRO): Promise<SyncResult> {
  const result: SyncResult = {
    planId: plan.id,
    productId: null,
    priceId: null,
    action: "skipped",
  };

  try {
    // Skip free plans
    if (plan.priceCents === 0) {
      return result;
    }

    const productName = plan.stripeProductName || `${plan.name} Plan`;
    const productDescription = plan.stripeProductDescription || `${plan.name} subscription plan`;

    // Search for existing product by name
    const existingProducts = await stripe.products.search({
      query: `name:'${productName}' AND active:'true'`,
    });

    let product: Stripe.Product;
    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`  ✓ Found existing product: ${product.id} (${product.name})`);
    } else {
      if (DRY_RUN) {
        console.log(`  🔍 Would create product: ${productName}`);
        result.productId = "prod_DRYRUN";
      } else {
        product = await stripe.products.create({
          name: productName,
          description: productDescription,
          metadata: {
            planId: plan.id,
            screenshotLimit: plan.screenshotLimit.toString(),
            perJobCap: plan.perJobCap.toString(),
          },
        });
        console.log(`  ✓ Created product: ${product.id}`);
      }
      result.productId = product.id;
      result.action = "created";
    }

    if (!product) {
      throw new Error("Product not found or created");
    }

    // Check for existing prices
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    // Find matching price (same amount and recurring)
    const matchingPrice = existingPrices.data.find(
      (p) =>
        p.unit_amount === plan.priceCents &&
        p.recurring?.interval === "month" &&
        p.recurring?.interval_count === 1
    );

    if (matchingPrice) {
      const currentPriceId = process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
      
      if (currentPriceId && matchingPrice.id === currentPriceId) {
        console.log(`  ✓ Price already exists and matches env var: ${matchingPrice.id}`);
        result.priceId = matchingPrice.id;
        result.action = "skipped";
        return result;
      }

      if (FORCE_UPDATE) {
        console.log(`  ⚠️  Found existing price ${matchingPrice.id}, but FORCE_UPDATE is set`);
        // In force mode, we could archive the old price and create a new one
        // For now, we'll just note it
        result.priceId = matchingPrice.id;
        result.action = "skipped";
        return result;
      }

      console.log(`  ✓ Price already exists: ${matchingPrice.id} ($${(matchingPrice.unit_amount || 0) / 100}/month)`);
      result.priceId = matchingPrice.id;
      result.action = "skipped";
      return result;
    }

    // Create new price
    if (DRY_RUN) {
      console.log(`  🔍 Would create price: $${plan.priceDollars}/month`);
      result.priceId = "price_DRYRUN";
      result.action = "created";
    } else {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceCents,
        currency: "usd",
        recurring: {
          interval: "month",
          interval_count: 1,
        },
        metadata: {
          planId: plan.id,
          screenshotLimit: plan.screenshotLimit.toString(),
          perJobCap: plan.perJobCap.toString(),
        },
      });
      console.log(`  ✓ Created price: ${price.id} ($${plan.priceDollars}/month)`);
      result.priceId = price.id;
      result.action = "created";
    }

    return result;
  } catch (error: any) {
    console.error(`  ❌ Error syncing plan ${plan.id}:`, error.message);
    result.action = "error";
    result.error = error.message;
    return result;
  }
}

async function main() {
  console.log("🚀 Syncing pricing plans to Stripe...\n");

  const activePlans = getActivePricingPlans();
  
  if (activePlans.length === 0) {
    console.log("⚠️  No active pricing plans found (plans with price > $0)");
    return;
  }

  console.log(`Found ${activePlans.length} active plan(s) to sync:\n`);

  const results: SyncResult[] = [];

  for (const plan of activePlans) {
    console.log(`📦 Syncing ${plan.name} plan (${plan.id}):`);
    console.log(`   Price: $${plan.priceDollars}/month`);
    console.log(`   Screenshot limit: ${plan.screenshotLimit}/month`);
    
    const result = await syncPlanToStripe(plan);
    results.push(result);
    console.log();
  }

  // Summary
  console.log("📊 Summary:");
  console.log("─".repeat(50));
  
  const created = results.filter((r) => r.action === "created");
  const updated = results.filter((r) => r.action === "updated");
  const skipped = results.filter((r) => r.action === "skipped");
  const errors = results.filter((r) => r.action === "error");

  if (created.length > 0) {
    console.log(`✓ Created: ${created.length}`);
    created.forEach((r) => {
      if (r.priceId) {
        console.log(`  - ${r.planId}: Price ID = ${r.priceId}`);
      }
    });
  }
  
  if (updated.length > 0) {
    console.log(`✓ Updated: ${updated.length}`);
  }
  
  if (skipped.length > 0) {
    console.log(`⊘ Skipped: ${skipped.length}`);
  }
  
  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}`);
    errors.forEach((r) => {
      console.log(`  - ${r.planId}: ${r.error}`);
    });
  }

  // Show environment variable updates needed
  const newPrices = results.filter((r) => r.action === "created" && r.priceId);
  if (newPrices.length > 0 && !DRY_RUN) {
    console.log("\n📝 Update your environment variables:");
    console.log("─".repeat(50));
    
    for (const result of newPrices) {
      if (result.planId === "PRO" && result.priceId) {
        console.log(`STRIPE_PRICE_PRO=${result.priceId}`);
        console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO=${result.priceId}`);
      }
    }
    console.log("\n⚠️  Don't forget to update these in:");
    console.log("   - Your local .env file");
    console.log("   - Vercel Dashboard → Settings → Environment Variables");
  }

  if (DRY_RUN) {
    console.log("\n💡 Run without --dry-run to apply these changes");
  }

  console.log();
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});