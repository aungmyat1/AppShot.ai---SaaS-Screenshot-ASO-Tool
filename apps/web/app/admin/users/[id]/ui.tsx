"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withCsrfHeaders } from "@/lib/security/csrf";

export function UserAdminDetailClient({ id }: { id: string }) {
  const qc = useQueryClient();
  const [plan, setPlan] = React.useState("");

  const q = useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to load user");
      return data.user as any;
    },
  });

  const update = useMutation({
    mutationFn: async (patch: any) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data.user;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "user", id] });
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  React.useEffect(() => {
    if (q.data?.plan) setPlan(q.data.plan);
  }, [q.data?.plan]);

  if (q.isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (q.error) return <div className="text-sm text-destructive">{String((q.error as Error).message)}</div>;
  const user = q.data!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{user.email}</h1>
          <p className="text-muted-foreground">User ID: {user.id}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage subscription tier and access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="w-full">
              <label className="text-sm font-medium">Plan</label>
              <Input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="FREE / PRO" />
            </div>
            <Button onClick={() => update.mutate({ plan })} disabled={update.isPending}>
              Save plan
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={user.suspendedAt ? "secondary" : "destructive"}
              onClick={() => update.mutate({ suspended: !user.suspendedAt })}
              disabled={update.isPending}
            >
              {user.suspendedAt ? "Activate" : "Suspend"}
            </Button>
            <Button
              variant="outline"
              onClick={() => update.mutate({ isAdmin: !user.isAdmin })}
              disabled={update.isPending}
            >
              {user.isAdmin ? "Remove admin" : "Make admin"}
            </Button>
            <Button asChild variant="outline">
              <Link href={`/dashboard/overview?asUserId=${encodeURIComponent(user.id)}`}>Support: view analytics as user</Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Status: <span className="font-medium">{user.suspendedAt ? "suspended" : "active"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent scrapes</CardTitle>
          <CardDescription>Last 20 scrape jobs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user.scrapeJobs?.length ? (
            user.scrapeJobs.map((j: any) => (
              <div key={j.id} className="flex items-start justify-between gap-2 rounded border p-2">
                <div className="text-muted-foreground">
                  {new Date(j.createdAt).toISOString().slice(0, 19).replace("T", " ")} • {j.status} • {j.screenshotCount}
                </div>
                {j.zipUrl ? (
                  <a className="underline" href={j.zipUrl} target="_blank" rel="noreferrer">
                    ZIP
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No scrapes.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

