import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  priceId: z.string().min(1),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const stripe = getStripe();

  const dbUser = await getOrCreateUser(userId);

  let stripeCustomerId = dbUser.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      metadata: { clerkUserId: userId, dbUserId: dbUser.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=cancel`,
    subscription_data: {
      metadata: { clerkUserId: userId, dbUserId: dbUser.id },
    },
  });

  if (!session.url) return NextResponse.json({ error: "Stripe session missing url" }, { status: 500 });
  return NextResponse.json({ url: session.url });
}

