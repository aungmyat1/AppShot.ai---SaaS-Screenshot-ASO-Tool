import { NextResponse } from "next/server";

import { requireAdminApi } from "@/app/api/admin/_auth";
import { prisma } from "@/lib/prisma";
import { isQueueEnabled, getScrapeQueue } from "@/lib/queue";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const started = Date.now();
  let dbOk = false;
  try {
    // basic DB connectivity check
    await prisma.user.count();
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const dbLatencyMs = Date.now() - started;

  let queue: any = null;
  if (isQueueEnabled()) {
    try {
      const q = getScrapeQueue();
      const counts = await q.getJobCounts("waiting", "active", "completed", "failed", "delayed");
      queue = { enabled: true, name: q.name, counts };
    } catch (e) {
      queue = { enabled: true, error: e instanceof Error ? e.message : "queue error" };
    }
  } else {
    queue = { enabled: false };
  }

  return NextResponse.json({
    ok: dbOk,
    db: { ok: dbOk, latencyMs: dbLatencyMs },
    queue,
  });
}

