import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { password } = bodySchema.parse(body);
    const expected = process.env.DEV_PASSWORD ?? "dev123";
    if (password !== expected) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
