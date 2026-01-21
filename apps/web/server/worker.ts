import { Worker } from "bullmq";

import { SCRAPE_QUEUE_NAME } from "../lib/queue";
import { processScrapeJob } from "../lib/core/process-scrape-job";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const redisUrl = requiredEnv("REDIS_URL");
const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);

// Pass connection string directly to BullMQ to avoid type incompatibility
// BullMQ will create its own Redis connection using its bundled ioredis
// This avoids TypeScript errors from incompatible ioredis versions

// This file is meant to be run as a separate Node process:
//   node --loader tsx server/worker.ts
// or via: npm run worker
// Do NOT run it inside Next.js runtime.
new Worker(
  SCRAPE_QUEUE_NAME,
  async (job) => {
    const scrapeJobId = (job.data as { scrapeJobId?: string }).scrapeJobId;
    if (!scrapeJobId) throw new Error("Missing scrapeJobId in job payload");
    await processScrapeJob(scrapeJobId);
  },
  { connection: redisUrl as any, concurrency }, // Type assertion to avoid ioredis version mismatch
);

// eslint-disable-next-line no-console
console.log(`Worker started for queue "${SCRAPE_QUEUE_NAME}" (concurrency=${concurrency})`);

