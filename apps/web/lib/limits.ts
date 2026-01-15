import type { Plan } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPricingPlan } from "@/lib/pricing-config";

export type LimitDecision = {
  screenshotLimit: number;
};

function startOfUtcMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

export async function enforcePlanLimits(params: {
  userId: string; // DB user id
  plan: Plan;
}): Promise<LimitDecision> {
  const monthStart = startOfUtcMonth();
  const used = await prisma.scrapeJob.aggregate({
    where: { userId: params.userId, status: "COMPLETE", createdAt: { gte: monthStart } },
    _sum: { screenshotCount: true },
  });
  const usedScreenshots = used._sum.screenshotCount ?? 0;

  const pricingPlan = getPricingPlan(params.plan);
  const limit = pricingPlan.screenshotLimit;
  const remaining = Math.max(0, limit - usedScreenshots);
  if (remaining <= 0) {
    throw new Error(`Monthly screenshot limit reached (${limit}/month).`);
  }

  // Cap per-job screenshots to a sane max, while still respecting remaining quota.
  const perJobCap = pricingPlan.perJobCap;
  return { screenshotLimit: Math.min(remaining, perJobCap) };
}

export async function getUsageSummary(params: { userId: string; plan: Plan }) {
  const monthStart = startOfUtcMonth();
  const agg = await prisma.scrapeJob.aggregate({
    where: { userId: params.userId, status: "COMPLETE", createdAt: { gte: monthStart } },
    _sum: { screenshotCount: true },
  });
  const used = agg._sum.screenshotCount ?? 0;
  const pricingPlan = getPricingPlan(params.plan);
  const limit = pricingPlan.screenshotLimit;
  return { window: "month" as const, limit, used, remaining: Math.max(0, limit - used) };
}

