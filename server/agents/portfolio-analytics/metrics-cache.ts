// Performance metrics caching for portfolio analytics
import { CacheStore } from '../database/cache-store.js';

export class MetricsCache {
  private cache = new CacheStore<any>(200);
  private ttl = 5 * 60 * 1000; // 5 min

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: any) {
    this.cache.set(key, value, this.ttl);
  }

  clear() {
    this.cache.clear();
  }
}
