import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ email: z.string().email("Invalid email") });

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { email } = bodySchema.parse(body);
    const normalized = email.toLowerCase().trim();

    const existing = await prisma.waitlistEmail.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already registered" });
    }

    await prisma.waitlistEmail.create({
      data: { email: normalized, source: "preview" },
    });
    return NextResponse.json({ success: true, message: "Added to waitlist" });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json({ success: true, message: "Already registered" });
    }
    return NextResponse.json({ error: "Failed to add email" }, { status: 500 });
  }
}
