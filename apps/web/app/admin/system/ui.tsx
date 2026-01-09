"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as React from "react";

export function SystemAdminClient() {
  const [q, setQ] = React.useState("");

  const health = useQuery({
    queryKey: ["admin", "system", "health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/health", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    refetchInterval: 10_000,
  });

  const errors = useQuery({
    queryKey: ["admin", "system", "errors", q],
    queryFn: async () => {
      const res = await fetch(`/api/admin/system/errors?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.errors as Array<any>;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Health</CardTitle>
          <CardDescription>DB connectivity and queue stats.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {health.isLoading ? "Loading…" : health.data ? JSON.stringify(health.data, null, 2) : "—"}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error logs</CardTitle>
          <CardDescription>Recent failed scrape jobs (filtered).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Input placeholder="Filter error text…" value={q} onChange={(e) => setQ(e.target.value)} />
          {errors.isLoading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : errors.data?.length ? (
            errors.data.map((e) => (
              <div key={e.id} className="rounded border p-2">
                <div className="text-muted-foreground">
                  {new Date(e.createdAt).toISOString()} • {e.store} • {e.appUrl}
                </div>
                <div className="mt-1">{e.error}</div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No errors.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

