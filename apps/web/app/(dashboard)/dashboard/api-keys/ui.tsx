"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withCsrfHeaders } from "@/lib/security/csrf";

type ApiKey = {
  id: string;
  name?: string | null;
  key_last4: string;
  rate_limit: number;
  revoked_at?: string | null;
  expires_at?: string | null;
  created_at: string;
};

export function ApiKeysClient() {
  const qc = useQueryClient();
  const [newName, setNewName] = React.useState("");
  const [secret, setSecret] = React.useState<string | null>(null);

  const keys = useQuery({
    queryKey: ["api-keys"],
    queryFn: async (): Promise<ApiKey[]> => {
      const res = await fetch("/api/dev/api-keys", { cache: "no-store" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to load keys");
      return data.keys as ApiKey[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/dev/api-keys", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ name: newName || null }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      return data as { secret: string };
    },
    onSuccess: async (data) => {
      setNewName("");
      setSecret(data.secret);
      await qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dev/api-keys/${id}/revoke`, { method: "POST", headers: withCsrfHeaders() });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to revoke");
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const rotate = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dev/api-keys/${id}/rotate`, { method: "POST", headers: withCsrfHeaders() });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to rotate");
      return data as { secret: string };
    },
    onSuccess: async (data) => {
      setSecret(data.secret);
      await qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API keys</CardTitle>
          <CardDescription>Generate keys for programmatic access to the FastAPI endpoints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Key name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create key"}
            </Button>
          </div>
          {secret ? (
            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium">New key (copy now — shown once):</div>
              <code className="mt-2 block break-all rounded bg-muted p-2">{secret}</code>
              <Button className="mt-2" variant="outline" onClick={() => setSecret(null)}>
                Dismiss
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your keys</CardTitle>
          <CardDescription>Each key has independent rate limits and permissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {keys.isLoading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : keys.data?.length ? (
            keys.data.map((k) => (
              <div key={k.id} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium">
                    {k.name || "Untitled"} • ****{k.key_last4}
                  </div>
                  <div className="text-muted-foreground">
                    {k.revoked_at ? "Revoked" : "Active"} • {k.rate_limit}/min
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => rotate.mutate(k.id)} disabled={rotate.isPending}>
                    Rotate
                  </Button>
                  <Button variant="destructive" onClick={() => revoke.mutate(k.id)} disabled={revoke.isPending}>
                    Revoke
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No keys yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

