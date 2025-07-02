// In-memory cache for DB results with TTL and size limit
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheStore<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  set(key: string, value: T, ttlMs: number) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear() {
    this.cache.clear();
  }
}
