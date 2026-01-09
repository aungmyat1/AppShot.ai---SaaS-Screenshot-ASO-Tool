"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { withCsrfHeaders } from "@/lib/security/csrf";

export function BillingActions() {
  const pro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function goCheckout(priceId: string) {
    setError(null);
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: withCsrfHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      if (!data.url) throw new Error("Missing checkout url");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST", headers: withCsrfHeaders() });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to open billing portal");
      if (!data.url) throw new Error("Missing portal url");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {pro ? (
          <Button
            variant="secondary"
            onClick={() => goCheckout(pro)}
            disabled={!!loading}
            aria-busy={loading === pro}
          >
            {loading === pro ? "Redirecting…" : "Upgrade: Pro"}
          </Button>
        ) : null}
        <Button variant="outline" onClick={openPortal} disabled={!!loading} aria-busy={loading === "portal"}>
          {loading === "portal" ? "Opening…" : "Billing portal"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!pro ? (
        <p className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_STRIPE_PRICE_PRO</code> to enable upgrades.
        </p>
      ) : null}
    </div>
  );
}

