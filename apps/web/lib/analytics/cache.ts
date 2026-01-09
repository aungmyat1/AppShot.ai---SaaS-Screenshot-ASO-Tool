type CacheEntry<T> = { expiresAt: number; value: T };

const mem = new Map<string, CacheEntry<unknown>>();

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = mem.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() < hit.expiresAt) return hit.value;
  const value = await fn();
  mem.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

