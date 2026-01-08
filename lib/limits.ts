import type { Plan, StoreType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type LimitDecision = {
  screenshotLimit: number;
};

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function enforcePlanLimits(params: {
  userId: string; // DB user id
  plan: Plan;
  requestedStore: StoreType;
}): Promise<LimitDecision> {
  // Only count non-failed attempts against quotas.
  const nonFailed = { not: "FAILED" as const };

  if (params.plan === "FREE") {
    // 1 app per day (UTC)
    const since = startOfUtcDay();
    const jobsToday = await prisma.scrapeJob.findMany({
      where: { userId: params.userId, createdAt: { gte: since }, status: nonFailed },
      select: { store: true },
    });

    if (jobsToday.length >= 1) {
      throw new Error("Free plan limit: 1 app per day. Upgrade to Starter for more.");
    }

    // Play Store OR App Store (not both) — enforce as “cannot switch stores within the day”.
    const storeUsed = jobsToday[0]?.store;
    if (storeUsed && storeUsed !== params.requestedStore) {
      throw new Error("Free plan limit: choose Play Store OR App Store for the day. Upgrade to Starter for both.");
    }

    return { screenshotLimit: 5 };
  }

  if (params.plan === "STARTER") {
    // 20 apps / month — implement as rolling 30 days.
    const since = daysAgo(30);
    const used = await prisma.scrapeJob.count({
      where: { userId: params.userId, createdAt: { gte: since }, status: nonFailed },
    });
    if (used >= 20) {
      throw new Error("Starter plan limit reached: 20 apps in the last 30 days.");
    }
    return { screenshotLimit: 30 };
  }

  // PRO (not specified in new plans) — keep permissive for now.
  return { screenshotLimit: 30 };
}

export async function getUsageSummary(params: { userId: string; plan: Plan }) {
  const nonFailed = { not: "FAILED" as const };
  if (params.plan === "FREE") {
    const since = startOfUtcDay();
    const usedToday = await prisma.scrapeJob.count({
      where: { userId: params.userId, createdAt: { gte: since }, status: nonFailed },
    });
    return { window: "today" as const, limit: 1, used: usedToday, remaining: Math.max(0, 1 - usedToday) };
  }

  if (params.plan === "STARTER") {
    const since = daysAgo(30);
    const used = await prisma.scrapeJob.count({
      where: { userId: params.userId, createdAt: { gte: since }, status: nonFailed },
    });
    return { window: "30d" as const, limit: 20, used, remaining: Math.max(0, 20 - used) };
  }

  return { window: "n/a" as const, limit: 0, used: 0, remaining: 0 };
}

