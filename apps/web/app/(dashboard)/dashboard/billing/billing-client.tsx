"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setLoading(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not ready");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) throw new Error(result.error.message || "Payment failed");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="rounded-md border p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing…" : "Subscribe"}
      </Button>
    </form>
  );
}

export function BillingClient() {
  const usage = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: async () => {
      const res = await fetch("/api/billing/usage", { cache: "no-store" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to load usage");
      return data as { plan: string; usage: { used: number; limit: number; remaining: number; window: string }; stripeStatus?: string };
    },
  });

  const invoices = useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: async () => {
      const res = await fetch("/api/billing/invoices", { cache: "no-store" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to load invoices");
      return data.invoices as Array<{ stripeInvoiceId: string; status?: string | null; amountDue?: number | null; hostedInvoiceUrl?: string | null; createdAt: string }>;
    },
  });

  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const canUseStripe = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  async function startCheckout() {
    setCreating(true);
    try {
      const res = await fetch("/api/billing/subscription/create", { method: "POST" });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to start subscription");
      setClientSecret(data.clientSecret);
    } finally {
      setCreating(false);
    }
  }

  async function cancel() {
    await fetch("/api/billing/subscription/cancel", { method: "POST" });
    window.location.reload();
  }

  async function openPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) throw new Error(data.error || "Failed to open portal");
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Monthly screenshot quota.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {usage.isLoading ? "Loading…" : usage.data ? `${usage.data.usage.used}/${usage.data.usage.limit} used (${usage.data.usage.window})` : "—"}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Upgrade to Pro or manage your subscription.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!canUseStripe ? (
            <p className="text-sm text-muted-foreground">
              Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and{" "}
              <code className="rounded bg-muted px-1 py-0.5">STRIPE_PRICE_PRO</code> to enable billing.
            </p>
          ) : null}

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button onClick={startCheckout} disabled={creating}>
                {creating ? "Preparing…" : "Upgrade to Pro"}
              </Button>
              <Button variant="outline" onClick={openPortal}>
                Billing portal
              </Button>
              <Button variant="outline" onClick={cancel}>
                Cancel at period end
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Recent invoices from Stripe (synced via webhook).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {invoices.isLoading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : invoices.data?.length ? (
            invoices.data.map((inv) => (
              <div key={inv.stripeInvoiceId} className="flex items-center justify-between gap-2">
                <div className="text-muted-foreground">
                  {new Date(inv.createdAt).toISOString().slice(0, 10)} • {inv.status || "unknown"} •{" "}
                  {typeof inv.amountDue === "number" ? `$${(inv.amountDue / 100).toFixed(2)}` : "—"}
                </div>
                {inv.hostedInvoiceUrl ? (
                  <a className="underline" href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No invoices yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

