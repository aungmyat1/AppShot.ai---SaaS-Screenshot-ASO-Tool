import type { Plan } from "@prisma/client";

export const PLAN_CREDITS: Record<Plan, number> = {
  FREE: 10,
  STARTER: 100,
  PRO: 500,
};

export function priceIdToPlan(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  const starter = process.env.STRIPE_PRICE_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER;
  const pro = process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (starter && priceId === starter) return "STARTER";
  if (pro && priceId === pro) return "PRO";
  return null;
}

