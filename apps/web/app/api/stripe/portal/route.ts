import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const stripe = getStripe();

  const dbUser = await getOrCreateUser(userId);
  if (!dbUser.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer on file." }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}

