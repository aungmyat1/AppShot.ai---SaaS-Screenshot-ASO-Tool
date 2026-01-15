/**
 * Centralized pricing configuration
 * 
 * This is the single source of truth for all pricing information.
 * When you update prices here, run `npm run stripe:sync` to sync with Stripe.
 */

import type { Plan } from "@prisma/client";

export interface PricingPlan {
  id: Plan;
  name: string;
  priceCents: number; // Price in cents (e.g., 2900 = $29.00)
  priceDollars: number; // Price in dollars (for display)
  screenshotLimit: number; // Monthly screenshot limit
  perJobCap: number; // Maximum screenshots per job
  features: string[];
  stripeProductName?: string; // Optional: custom Stripe product name
  stripeProductDescription?: string; // Optional: custom Stripe product description
}

export const PRICING_PLANS: Record<Plan, PricingPlan> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceCents: 0,
    priceDollars: 0,
    screenshotLimit: 10,
    perJobCap: 10,
    features: ["10 screenshots / month", "Basic features"],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceCents: 0, // Not currently used, but defined for completeness
    priceDollars: 0,
    screenshotLimit: 0,
    perJobCap: 0,
    features: [],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceCents: 2900, // $29.00
    priceDollars: 29,
    screenshotLimit: 500,
    perJobCap: 30,
    features: ["500 screenshots / month", "Priority support"],
    stripeProductName: "AppShot.ai Pro",
    stripeProductDescription: "Pro plan with 500 screenshots per month and priority support",
  },
};

/**
 * Get pricing plan by ID
 */
export function getPricingPlan(planId: Plan): PricingPlan {
  return PRICING_PLANS[planId];
}

/**
 * Get all active (paid) pricing plans
 */
export function getActivePricingPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS).filter((plan) => plan.priceCents > 0);
}

/**
 * Get pricing plan by Stripe price ID
 */
export function getPricingPlanByStripePriceId(priceId: string | null | undefined): PricingPlan | null {
  if (!priceId) return null;
  
  // Check environment variables for price ID mappings
  const proPriceId = process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (proPriceId && priceId === proPriceId) {
    return PRICING_PLANS.PRO;
  }
  
  return null;
}
