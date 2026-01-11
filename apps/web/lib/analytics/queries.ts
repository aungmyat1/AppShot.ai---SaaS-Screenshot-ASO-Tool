import { prisma } from "@/lib/prisma";

export type TimePoint = { t: string; v: number };

export type UserAnalytics = {
  rangeDays: number;
  screenshotsPerDay: TimePoint[];
  jobsPerHourUtc: { hour: number; count: number }[];
  statusDistribution: { status: string; count: number }[];
  errorTop: { error: string; count: number }[];
};

export async function getUserAnalytics(params: { userId: string; rangeDays?: number }): Promise<UserAnalytics> {
  const rangeDays = params.rangeDays ?? 30;

  const screenshotsPerDay = (await prisma.$queryRaw<
    Array<{ t: string; v: number }>
  >`
    select
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as t,
      coalesce(sum("screenshotCount")::int, 0) as v
    from "ScrapeJob"
    where "userId" = ${params.userId}
      and "status" = 'COMPLETE'
      and "createdAt" >= now() - (${rangeDays} * interval '1 day')
    group by 1
    order by 1 asc
  `) satisfies TimePoint[];

  const jobsPerHourUtc = await prisma.$queryRaw<Array<{ hour: number; count: number }>>`
    select
      extract(hour from ("createdAt" at time zone 'utc'))::int as hour,
      count(*)::int as count
    from "ScrapeJob"
    where "userId" = ${params.userId}
      and "createdAt" >= now() - (${rangeDays} * interval '1 day')
    group by 1
    order by 1 asc
  `;

  const statusDistribution = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
    select
      "status"::text as status,
      count(*)::int as count
    from "ScrapeJob"
    where "userId" = ${params.userId}
      and "createdAt" >= now() - (${rangeDays} * interval '1 day')
    group by 1
    order by 2 desc
  `;

  const errorTop = await prisma.$queryRaw<Array<{ error: string; count: number }>>`
    select
      left(coalesce("error",'Unknown'), 120) as error,
      count(*)::int as count
    from "ScrapeJob"
    where "userId" = ${params.userId}
      and "status" = 'FAILED'
      and "createdAt" >= now() - (${rangeDays} * interval '1 day')
    group by 1
    order by 2 desc
    limit 10
  `;

  return { rangeDays, screenshotsPerDay, jobsPerHourUtc, statusDistribution, errorTop };
}

export type AdminAnalytics = {
  rangeDays: number;
  usersNewPerDay: TimePoint[];
  planDistribution: { plan: string; count: number }[];
  scrapeHealth: { total: number; failed: number; failureRate: number };
  revenue: { paidInvoicesLast30dUsd: number };
};

export async function getAdminAnalytics(params: { rangeDays?: number }): Promise<AdminAnalytics> {
  const rangeDays = params.rangeDays ?? 30;

  const usersNewPerDay = await prisma.$queryRaw<Array<{ t: string; v: number }>>`
    select
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as t,
      count(*)::int as v
    from "User"
    where "createdAt" >= now() - (${rangeDays} * interval '1 day')
    group by 1
    order by 1 asc
  `;

  const planDistribution = await prisma.$queryRaw<Array<{ plan: string; count: number }>>`
    select
      "plan"::text as plan,
      count(*)::int as count
    from "User"
    group by 1
    order by 2 desc
  `;

  const scrapeCounts = await prisma.$queryRaw<Array<{ status: string; count: number }>>`
    select
      "status"::text as status,
      count(*)::int as count
    from "ScrapeJob"
    where "createdAt" >= now() - (${rangeDays} * interval '1 day')
    group by 1
  `;
  const total = scrapeCounts.reduce((a, r) => a + r.count, 0);
  const failed = scrapeCounts.find((r) => r.status === "FAILED")?.count ?? 0;
  const failureRate = total ? failed / total : 0;

  const paidInvoicesLast30d = await prisma.$queryRaw<Array<{ cents: number }>>`
    select
      coalesce(sum("amountDue")::bigint, 0)::int as cents
    from "Invoice"
    where coalesce("status",'') in ('paid','open')
      and "createdAt" >= now() - (30 * interval '1 day')
  `;

  return {
    rangeDays,
    usersNewPerDay,
    planDistribution,
    scrapeHealth: { total, failed, failureRate },
    revenue: { paidInvoicesLast30dUsd: (paidInvoicesLast30d[0]?.cents ?? 0) / 100 },
  };
}

