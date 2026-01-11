import { getStripe } from "@/lib/stripe";

export async function recordStripeUsage(params: { subscriptionItemId: string; quantity: number; timestamp?: number }) {
  const stripe = getStripe();
  await stripe.subscriptionItems.createUsageRecord(params.subscriptionItemId, {
    quantity: params.quantity,
    timestamp: params.timestamp ?? Math.floor(Date.now() / 1000),
    action: "increment",
  });
}

