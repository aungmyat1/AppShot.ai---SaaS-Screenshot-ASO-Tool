import { Worker } from "bullmq";
import IORedis from "ioredis";

import { SCRAPE_QUEUE_NAME } from "../lib/queue";
import { processScrapeJob } from "../lib/core/process-scrape-job";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const connection = requiredEnv("REDIS_URL");
const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);

const redis = new IORedis(connection, { maxRetriesPerRequest: null });

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
  { connection: redis, concurrency },
);

// eslint-disable-next-line no-console
console.log(`Worker started for queue "${SCRAPE_QUEUE_NAME}" (concurrency=${concurrency})`);

