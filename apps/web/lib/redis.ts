import type { ConnectionOptions } from "bullmq";

const DEFAULT_REDIS_PORT = 6379;

export function getRedisConnectionOptions(redisUrl: string): ConnectionOptions {
  const parsed = new URL(redisUrl);
  const port = parsed.port ? Number(parsed.port) : DEFAULT_REDIS_PORT;
  const dbPath = parsed.pathname.startsWith("/")
    ? parsed.pathname.slice(1)
    : parsed.pathname;
  const db = dbPath ? Number(dbPath) : undefined;

  const options: ConnectionOptions = {
    host: parsed.hostname,
    port: Number.isNaN(port) ? DEFAULT_REDIS_PORT : port,
    maxRetriesPerRequest: null,
  };

  if (parsed.username) {
    options.username = decodeURIComponent(parsed.username);
  }

  if (parsed.password) {
    options.password = decodeURIComponent(parsed.password);
  }

  if (db !== undefined && !Number.isNaN(db)) {
    options.db = db;
  }

  if (parsed.protocol === "rediss:") {
    options.tls = {};
  }

  return options;
}
