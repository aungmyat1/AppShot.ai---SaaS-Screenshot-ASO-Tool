import { createClient } from "redis";

import type { AppMetadata, Screenshot, Store } from "@/lib/core/types";

type CacheValue = { screenshots: Screenshot[]; metadata: AppMetadata; cachedAt: string };

class MemoryCache {
  private map = new Map<string, { expiresAt: number; value: CacheValue }>();

  get(key: string): CacheValue | null {
    const hit = this.map.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return hit.value;
  }

  set(key: string, value: CacheValue, ttlSeconds: number) {
    this.map.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string) {
    this.map.delete(key);
  }
}

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let redisConnecting: Promise<RedisClient> | null = null;
const memory = new MemoryCache();
let warnedRedisDown = false;

function cacheKey(appId: string, store: Store) {
  return `screenshots:${store}:${appId}`;
}

async function getRedis(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (redisClient) return redisClient;
  if (redisConnecting) return redisConnecting;

  redisConnecting = (async () => {
    const c = createClient({ url });
    c.on("error", (err) => {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", err instanceof Error ? err.message : err);
      }
      redisClient = null;
    });
    await c.connect();
    redisClient = c;
    return c;
  })().finally(() => {
    redisConnecting = null;
  });

  return redisConnecting;
}

export class CacheManager {
  private readonly ttlSeconds: number;

  constructor(opts?: { ttlSeconds?: number }) {
    this.ttlSeconds = opts?.ttlSeconds ?? Number(process.env.CACHE_TTL_SECONDS || 86_400);
  }

  async getCached(appId: string, store: Store): Promise<CacheValue | null> {
    const key = cacheKey(appId, store);

    const r = await getRedis().catch((e) => {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", e instanceof Error ? e.message : e);
      }
      return null;
    });
    if (!r) return memory.get(key);

    try {
      const raw = await r.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as CacheValue;
    } catch (e) {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", e instanceof Error ? e.message : e);
      }
      return memory.get(key);
    }
  }

  async setCached(appId: string, store: Store, screenshots: Screenshot[], metadata: AppMetadata): Promise<void> {
    const key = cacheKey(appId, store);
    const value: CacheValue = { screenshots, metadata, cachedAt: new Date().toISOString() };
    const payload = JSON.stringify(value);

    const r = await getRedis().catch((e) => {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", e instanceof Error ? e.message : e);
      }
      return null;
    });
    if (!r) {
      memory.set(key, value, this.ttlSeconds);
      return;
    }

    try {
      await r.setEx(key, this.ttlSeconds, payload);
    } catch (e) {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", e instanceof Error ? e.message : e);
      }
      memory.set(key, value, this.ttlSeconds);
    }
  }

  async invalidate(appId: string, store: Store): Promise<void> {
    const key = cacheKey(appId, store);
    const r = await getRedis().catch((e) => {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", e instanceof Error ? e.message : e);
      }
      return null;
    });
    if (!r) return memory.del(key);
    try {
      await r.del(key);
    } catch (e) {
      if (!warnedRedisDown) {
        warnedRedisDown = true;
        // eslint-disable-next-line no-console
        console.warn("Redis unavailable, bypassing cache:", e instanceof Error ? e.message : e);
      }
      memory.del(key);
    }
  }
}

