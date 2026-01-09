import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalytics } from "@/lib/analytics/queries";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  await requireAdmin(userId);

  const data = await getAdminAnalytics({ rangeDays: 30 });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin analytics</h1>
          <p className="text-muted-foreground">Last 30 days.</p>
        </div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          Back to users
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User growth</CardTitle>
            <CardDescription>New users per day.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Days: {data.usersNewPerDay.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Paid/open invoices (last 30d).</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">${data.revenue.paidInvoicesLast30dUsd.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription distribution</CardTitle>
            <CardDescription>Users by plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {data.planDistribution.map((p) => (
              <div key={p.plan} className="flex justify-between text-muted-foreground">
                <span>{p.plan}</span>
                <span className="font-medium">{p.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System health</CardTitle>
            <CardDescription>Scrape failures.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {data.scrapeHealth.failed}/{data.scrapeHealth.total} failed ({(data.scrapeHealth.failureRate * 100).toFixed(1)}%)
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

