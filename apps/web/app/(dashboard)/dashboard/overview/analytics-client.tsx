"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Analytics = {
  rangeDays: number;
  screenshotsPerDay: Array<{ t: string; v: number }>;
  jobsPerHourUtc: Array<{ hour: number; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  errorTop: Array<{ error: string; count: number }>;
};

export function AnalyticsClient(props: { asUserId?: string }) {
  const asUserId = props.asUserId;
  const q = useQuery({
    queryKey: ["analytics", "user", 30, asUserId || "self"],
    queryFn: async (): Promise<Analytics> => {
      const qs = new URLSearchParams({ days: "30", ...(asUserId ? { asUserId } : {}) });
      const res = await fetch(`/api/analytics/user?${qs.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to load analytics");
      return data as Analytics;
    },
    refetchInterval: 15_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Last 30 days{asUserId ? " (support view)" : ""}.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={asUserId ? `/api/analytics/user/export?days=30&asUserId=${encodeURIComponent(asUserId)}` : "/api/analytics/user/export?days=30"}>
            Export CSV
          </a>
        </Button>
      </div>

      {q.isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : null}
      {q.error ? <div className="text-sm text-destructive">{String((q.error as Error).message)}</div> : null}

      {q.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Screenshots downloaded</CardTitle>
              <CardDescription>Daily totals (completed jobs only).</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={q.data.screenshotsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak usage (UTC)</CardTitle>
              <CardDescription>Jobs started by hour.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={q.data.jobsPerHourUtc}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status distribution</CardTitle>
              <CardDescription>Jobs over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={q.data.statusDistribution} dataKey="count" nameKey="status" outerRadius={90} fill="hsl(var(--primary))" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top errors</CardTitle>
              <CardDescription>Most frequent failures (truncated).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {q.data.errorTop.length ? (
                q.data.errorTop.map((e) => (
                  <div key={e.error} className="flex items-start justify-between gap-3">
                    <div className="text-muted-foreground">{e.error}</div>
                    <div className="font-medium">{e.count}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No errors in this period.</div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

