import type { Plan } from "@prisma/client";

export const PLAN_CREDITS: Record<Plan, number> = {
  // Billing is primarily screenshot-metered; this keeps old fields compatible.
  FREE: 0,
  STARTER: 0,
  PRO: 0,
};

export function priceIdToPlan(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  const pro = process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (pro && priceId === pro) return "PRO";
  return null;
}

