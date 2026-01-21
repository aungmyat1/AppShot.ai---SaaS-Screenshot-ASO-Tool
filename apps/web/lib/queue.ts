import { Queue } from "bullmq";

import { getRedisConnectionOptions } from "./redis";

let queue: Queue | null = null;
let connection: ReturnType<typeof getRedisConnectionOptions> | null = null;

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

  connection = connection ?? getRedisConnectionOptions(url);
  queue = new Queue<ScrapeJobPayload>(SCRAPE_QUEUE_NAME, { connection });
  return queue;
}

