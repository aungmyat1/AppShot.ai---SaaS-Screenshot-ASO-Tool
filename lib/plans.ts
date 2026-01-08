import type { Plan } from "@prisma/client";

export const PLAN_CREDITS: Record<Plan, number> = {
  // Kept for compatibility with existing DB field; primary enforcement is query-based limits.
  FREE: 0,
  STARTER: 20,
  PRO: 999,
};

export function priceIdToPlan(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  const starter = process.env.STRIPE_PRICE_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER;
  const pro = process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (starter && priceId === starter) return "STARTER";
  if (pro && priceId === pro) return "PRO";
  return null;
}

