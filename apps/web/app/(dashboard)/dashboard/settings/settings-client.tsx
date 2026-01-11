"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { withCsrfHeaders } from "@/lib/security/csrf";

export function SettingsClient() {
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function deleteAccount() {
    if (!confirm("Delete your account data? This cannot be undone.")) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST", headers: withCsrfHeaders() });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Delete failed");
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Export or delete your data (GDPR-style controls).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href="/api/account/export">Export my data</a>
          </Button>
          <Button variant="destructive" onClick={deleteAccount} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete my data"}
          </Button>
        </CardContent>
      </Card>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}
    </div>
  );
}

