import { NextResponse } from "next/server";

import { detectStore, parseAppStoreId, parsePlayPackageName, scrapeRequestSchema } from "@/lib/app-url";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = scrapeRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  try {
    const store = detectStore(parsed.data.url);
    const identifier = store === "APP_STORE" ? parseAppStoreId(parsed.data.url) : parsePlayPackageName(parsed.data.url);
    return NextResponse.json({ store, identifier });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid URL" }, { status: 400 });
  }
}

