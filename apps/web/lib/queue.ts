import { Queue } from "bullmq";

let queue: Queue | null = null;

export const SCRAPE_QUEUE_NAME = process.env.SCRAPE_QUEUE_NAME || "scrape-jobs";

export type ScrapeJobPayload = {
  scrapeJobId: string;
};

export function isQueueEnabled() {
  return (process.env.SCRAPE_QUEUE_MODE || "sync").toLowerCase() === "queue" && !!process.env.REDIS_URL;
}

export function getScrapeQueue() {
  if (queue) return queue;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("Missing REDIS_URL (required for queue mode)");

  // Pass connection string directly to BullMQ to avoid type incompatibility
  // BullMQ will create its own Redis connection using its bundled ioredis
  // This avoids TypeScript errors from incompatible ioredis versions
  queue = new Queue<ScrapeJobPayload>(SCRAPE_QUEUE_NAME, {
    connection: url as any, // Type assertion to avoid ioredis version mismatch
  });
  return queue;
}

