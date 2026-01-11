import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  const dbUser = await getOrCreateUser(userId);

  const priceId = process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (!priceId) return NextResponse.json({ error: "Missing STRIPE_PRICE_PRO" }, { status: 500 });

  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      metadata: { clerkUserId: userId, dbUserId: dbUser.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } });
  }

  // Create subscription using PaymentIntents (default_incomplete).
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId, quantity: 1 }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent", "items.data.price"],
    metadata: { clerkUserId: userId, dbUserId: dbUser.id },
  });

  const latestInvoice = subscription.latest_invoice as any;
  const paymentIntent = latestInvoice?.payment_intent as any;
  const clientSecret = paymentIntent?.client_secret as string | undefined;
  if (!clientSecret) {
    return NextResponse.json({ error: "Missing PaymentIntent client_secret" }, { status: 500 });
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeStatus: subscription.status,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
    },
  });

  return NextResponse.json({ clientSecret, subscriptionId: subscription.id });
}

