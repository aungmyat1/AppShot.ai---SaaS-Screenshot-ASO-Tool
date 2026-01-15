import type { Plan } from "@prisma/client";
import { getPricingPlanByStripePriceId } from "@/lib/pricing-config";

export const PLAN_CREDITS: Record<Plan, number> = {
  // Billing is primarily screenshot-metered; this keeps old fields compatible.
  FREE: 0,
  STARTER: 0,
  PRO: 0,
};

export function priceIdToPlan(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  const plan = getPricingPlanByStripePriceId(priceId);
  return plan ? plan.id : null;
}

