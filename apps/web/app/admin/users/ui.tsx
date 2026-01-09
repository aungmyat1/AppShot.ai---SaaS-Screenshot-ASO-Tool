"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserRow = {
  id: string;
  email: string;
  plan: string;
  isAdmin: boolean;
  suspendedAt: string | null;
  createdAt: string;
};

export function UsersAdminClient() {
  const [q, setQ] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [suspended, setSuspended] = React.useState("");

  const users = useQuery({
    queryKey: ["admin", "users", q, plan, suspended],
    queryFn: async (): Promise<UserRow[]> => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (plan) params.set("plan", plan);
      if (suspended) params.set("suspended", suspended);
      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      return data.users as UserRow[];
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input placeholder="Search email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input placeholder="Plan (FREE/PRO)" value={plan} onChange={(e) => setPlan(e.target.value)} />
        <Input placeholder="Suspended (true/false)" value={suspended} onChange={(e) => setSuspended(e.target.value)} />
        <Button variant="outline" onClick={() => users.refetch()}>
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : users.data?.length ? (
            users.data.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>{u.plan}</TableCell>
                <TableCell>{u.isAdmin ? "yes" : "no"}</TableCell>
                <TableCell>{u.suspendedAt ? "suspended" : "active"}</TableCell>
                <TableCell>{new Date(u.createdAt).toISOString().slice(0, 10)}</TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/users/${u.id}`}>Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

