import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  const dbUser = await getOrCreateUser(userId);
  if (!dbUser.stripeSubscriptionId) return NextResponse.json({ error: "No subscription" }, { status: 400 });

  const sub = await stripe.subscriptions.update(dbUser.stripeSubscriptionId, { cancel_at_period_end: true });
  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      stripeStatus: sub.status,
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
    },
  });

  return NextResponse.json({ ok: true, cancelAtPeriodEnd: sub.cancel_at_period_end });
}

