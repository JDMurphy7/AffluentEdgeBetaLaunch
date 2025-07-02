import { BaseAgent } from '../core/base-agent.js';
import type { AgentConfig, AgentResult } from '../core/types.js';
import { QueryOptimizer } from './query-optimizer.js';
import * as storage from '../../storage.js';

export class DatabaseAgent extends BaseAgent {
  private optimizer = new QueryOptimizer();

  constructor(config: AgentConfig, fallback: (...args: any[]) => Promise<any>) {
    super(config, fallback);
  }

  getId() {
    return this.config.id;
  }

  async getPortfolioMetricsOptimized(userId: number): Promise<AgentResult> {
    const start = Date.now();
    let cacheHit = false;
    try {
      const cached = this.optimizer.getPortfolio(userId);
      if (cached) {
        cacheHit = true;
        this.updateMetrics(true, Date.now() - start, true);
        return { success: true, data: cached, source: 'agent', executionTime: Date.now() - start, cacheHit };
      }
      const data = await this.executeWithTimeout(() => storage.getPortfolioMetrics(userId), this.config.timeout);
      this.optimizer.setPortfolio(userId, data);
      this.updateMetrics(true, Date.now() - start, false);
      return { success: true, data, source: 'agent', executionTime: Date.now() - start, cacheHit: false };
    } catch (error: any) {
      this.updateMetrics(false, Date.now() - start, false, error.message);
      // Fallback
      try {
        const data = await this.fallback(userId);
        return { success: true, data, source: 'fallback', executionTime: Date.now() - start };
      } catch (fallbackError: any) {
        return { success: false, data: null, source: 'fallback', executionTime: Date.now() - start, error: fallbackError.message };
      }
    }
  }

  async getTradesOptimized(userId: number, limit?: number): Promise<AgentResult> {
    const start = Date.now();
    let cacheHit = false;
    try {
      const cached = this.optimizer.getTrades(userId, limit);
      if (cached) {
        cacheHit = true;
        this.updateMetrics(true, Date.now() - start, true);
        return { success: true, data: cached, source: 'agent', executionTime: Date.now() - start, cacheHit };
      }
      const data = await this.executeWithTimeout(() => storage.getTrades(userId, limit), this.config.timeout);
      this.optimizer.setTrades(userId, data, limit);
      this.updateMetrics(true, Date.now() - start, false);
      return { success: true, data, source: 'agent', executionTime: Date.now() - start, cacheHit: false };
    } catch (error: any) {
      this.updateMetrics(false, Date.now() - start, false, error.message);
      // Fallback
      try {
        const data = await this.fallback(userId, limit);
        return { success: true, data, source: 'fallback', executionTime: Date.now() - start };
      } catch (fallbackError: any) {
        return { success: false, data: null, source: 'fallback', executionTime: Date.now() - start, error: fallbackError.message };
      }
    }
  }

  clearCache() {
    this.optimizer.clear();
  }
}
