import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/api/admin/_auth";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await req.json().catch(() => null);
  const paymentIntentId = body?.paymentIntentId as string | undefined;
  const amount = body?.amount as number | undefined;
  if (!paymentIntentId) return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });

  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(typeof amount === "number" ? { amount } : {}),
  });
  return NextResponse.json({ refund });
}

