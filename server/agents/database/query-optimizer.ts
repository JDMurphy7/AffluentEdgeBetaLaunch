// Query optimizer for smart query caching
import { CacheStore } from './cache-store.js';

export class QueryOptimizer {
  private cache: CacheStore<any>;
  private tradesTTL = 2 * 60 * 1000; // 2 min
  private portfolioTTL = 5 * 60 * 1000; // 5 min

  constructor(cacheSize = 500) {
    this.cache = new CacheStore(cacheSize);
  }

  getTradesKey(userId: number, limit?: number) {
    return `trades:${userId}:${limit ?? 'all'}`;
  }

  getPortfolioKey(userId: number) {
    return `portfolio:${userId}`;
  }

  getTrades(userId: number, limit?: number) {
    return this.cache.get(this.getTradesKey(userId, limit));
  }

  setTrades(userId: number, data: any, limit?: number) {
    this.cache.set(this.getTradesKey(userId, limit), data, this.tradesTTL);
  }

  getPortfolio(userId: number) {
    return this.cache.get(this.getPortfolioKey(userId));
  }

  setPortfolio(userId: number, data: any) {
    this.cache.set(this.getPortfolioKey(userId), data, this.portfolioTTL);
  }

  clear() {
    this.cache.clear();
  }
}
