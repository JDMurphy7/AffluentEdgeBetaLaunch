import { BaseAgent } from '../core/base-agent.js';
import type { AgentConfig, AgentResult } from '../core/types.js';
import { MetricsCache } from './metrics-cache.js';
import { calculatePortfolioMetrics } from './calculator.js';

export class PortfolioAgent extends BaseAgent {
  private cache = new MetricsCache();

  getId() {
    return this.config.id;
  }

  async getOptimizedMetrics(trades: any[]): Promise<AgentResult> {
    const start = Date.now();
    const key = `portfolio-metrics:${trades.length}`;
    let cacheHit = false;
    try {
      const cached = this.cache.get(key);
      if (cached) {
        cacheHit = true;
        this.updateMetrics(true, Date.now() - start, true);
        return { success: true, data: cached, source: 'agent', executionTime: Date.now() - start, cacheHit };
      }
      const metrics = calculatePortfolioMetrics(trades);
      this.cache.set(key, metrics);
      this.updateMetrics(true, Date.now() - start, false);
      return { success: true, data: metrics, source: 'agent', executionTime: Date.now() - start, cacheHit: false };
    } catch (error: any) {
      this.updateMetrics(false, Date.now() - start, false, error.message);
      return { success: false, data: null, source: 'agent', executionTime: Date.now() - start, error: error.message };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
