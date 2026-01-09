import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { PLAN_CREDITS, priceIdToPlan } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Subscription events will follow; we just acknowledge.
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const priceId = sub.items.data[0]?.price?.id ?? null;
        const plan = priceIdToPlan(priceId) ?? "FREE";

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan,
            creditsBalance: PLAN_CREDITS[plan],
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            stripeStatus: sub.status,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            creditsBalance: PLAN_CREDITS.FREE,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeStatus: sub.status,
            currentPeriodEnd: null,
          },
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Webhook error" }, { status: 500 });
  }
}

