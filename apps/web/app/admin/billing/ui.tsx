"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminBillingClient() {
  const [status, setStatus] = React.useState("");
  const invoices = useQuery({
    queryKey: ["admin", "billing", "invoices", status],
    queryFn: async () => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`/api/admin/billing/invoices${qs}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data.invoices as Array<any>;
    },
  });

  const [pi, setPi] = React.useState("");
  const refund = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/billing/refund", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentIntentId: pi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");
      return data.refund;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Filter invoice status (paid/open/...)" value={status} onChange={(e) => setStatus(e.target.value)} />
        <Button variant="outline" onClick={() => invoices.refetch()}>
          Refresh
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        {invoices.isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : invoices.data?.length ? (
          invoices.data.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between gap-2 rounded border p-2">
              <div className="text-muted-foreground">
                {new Date(inv.createdAt).toISOString().slice(0, 10)} • {inv.status} • {inv.user?.email} •{" "}
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
          <div className="text-muted-foreground">No invoices.</div>
        )}
      </div>

      <div className="rounded border p-3">
        <div className="text-sm font-medium">Refund (manual)</div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input placeholder="payment_intent id (pi_...)" value={pi} onChange={(e) => setPi(e.target.value)} />
          <Button onClick={() => refund.mutate()} disabled={refund.isPending || !pi}>
            {refund.isPending ? "Refunding…" : "Create refund"}
          </Button>
        </div>
        {refund.error ? <div className="mt-2 text-sm text-destructive">{String((refund.error as Error).message)}</div> : null}
      </div>
    </div>
  );
}

