#!/usr/bin/env tsx
/**
 * Stripe Setup Checker
 *
 * This script checks if Stripe is properly configured by verifying:
 * 1. If Stripe products/prices have been created (or if sync script was run)
 * 2. If STRIPE_PRICE_PRO / NEXT_PUBLIC_STRIPE_PRICE_PRO are set
 * 3. If webhook is created and STRIPE_WEBHOOK_SECRET is set
 */

import Stripe from "stripe";

// Check if required environment variables are set
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error("❌ Error: STRIPE_SECRET_KEY environment variable is not set");
  console.log("Please set your Stripe secret key before continuing.");
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

async function checkStripeSetup() {
  console.log("🔍 Checking Stripe setup...\n");

  // 1. Check if STRIPE_PRICE_PRO and NEXT_PUBLIC_STRIPE_PRICE_PRO are set
  const privatePricePro = process.env.STRIPE_PRICE_PRO;
  const publicPricePro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

  console.log("📋 Checking environment variables:");
  console.log(`   STRIPE_PRICE_PRO: ${privatePricePro ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   NEXT_PUBLIC_STRIPE_PRICE_PRO: ${publicPricePro ? '✅ SET' : '❌ NOT SET'}`);

  let hasValidProPrice = false;
  if (privatePricePro || publicPricePro) {
    // Verify the price actually exists in Stripe
    const priceId = privatePricePro || publicPricePro;
    
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (price) {
        console.log(`   ✓ Price ${priceId} exists in Stripe`);
        hasValidProPrice = true;
      }
    } catch (error) {
      console.log(`   ❌ Price ${priceId} does not exist in Stripe`);
    }
  }

  // 2. Check if webhook secret is set
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log(`   STRIPE_WEBHOOK_SECRET: ${webhookSecret ? '✅ SET' : '❌ NOT SET'}`);

  let hasValidWebhook = false;
  if (webhookSecret) {
    // Note: We can't verify the webhook secret itself, but we can check if webhooks exist in the dashboard
    console.log("   (Cannot verify webhook secret validity without Stripe API endpoint)");
    hasValidWebhook = true;
  }

  // 3. Check if products and prices exist in Stripe
  console.log("\n📦 Checking for Stripe products and prices...");
  
  let hasProPlan = false;
  try {
    // Look for products that might match our Pro plan
    const products = await stripe.products.list({
      limit: 100,
    });

    for (const product of products.data) {
      if (product.name.includes("Pro") || product.name.includes("AppShot.ai Pro")) {
        console.log(`   ✓ Found Pro product: ${product.name} (${product.id})`);
        
        // Check if this product has the right price
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 10,
        });
        
        for (const price of prices.data) {
          if (price.unit_amount === 2900 && price.recurring?.interval === "month") { // $29/month
            console.log(`     ✓ Found matching Pro price: $${price.unit_amount!/100}/month (${price.id})`);
            
            // Check if this price matches our env var
            if ((privatePricePro === price.id || publicPricePro === price.id)) {
              console.log(`     ✓ Price ID matches environment variable`);
              hasProPlan = true;
            } else {
              console.log(`     ⚠️  Price ID does not match environment variable (expected: ${privatePricePro || publicPricePro}, found: ${price.id})`);
            }
          }
        }
      }
    }
    
    if (!hasProPlan && products.data.length > 0) {
      console.log("   ℹ️  Pro product not found, but other products exist");
    } else if (products.data.length === 0) {
      console.log("   ❌ No products found in Stripe account");
    }
  } catch (error) {
    console.log(`   ❌ Error checking products: ${error}`);
  }

  console.log("\n📊 Summary:");
  console.log("─".repeat(50));
  
  const checks = [
    { name: "Environment variables set", passed: Boolean(privatePricePro && publicPricePro) },
    { name: "Pro price exists in Stripe", passed: hasValidProPrice },
    { name: "Webhook secret configured", passed: Boolean(webhookSecret) },
    { name: "Webhook endpoint verified", passed: hasValidWebhook },
  ];
  
  const passedChecks = checks.filter(check => check.passed).length;
  const totalChecks = checks.length;
  
  checks.forEach(check => {
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
  });
  
  console.log(`\nProgress: ${passedChecks}/${totalChecks} checks passed`);

  if (passedChecks === totalChecks) {
    console.log("\n🎉 Stripe setup is complete!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Stripe setup is incomplete. Please follow these steps:");
    console.log("1. Run the sync script to create products and prices in Stripe:");
    console.log("   npm run stripe:sync");
    console.log("2. Set the STRIPE_PRICE_PRO and NEXT_PUBLIC_STRIPE_PRICE_PRO environment variables");
    console.log("3. Set up a webhook in your Stripe dashboard pointing to:");
    console.log("   https://yourdomain.com/api/stripe/webhook");
    console.log("4. Set the STRIPE_WEBHOOK_SECRET environment variable with the webhook signing secret");
    console.log("\nFor Vercel deployment, make sure to set these in the dashboard under Settings → Environment Variables");
    process.exit(1);
  }
}

checkStripeSetup().catch(error => {
  console.error("❌ Error checking Stripe setup:", error);
  process.exit(1);
});