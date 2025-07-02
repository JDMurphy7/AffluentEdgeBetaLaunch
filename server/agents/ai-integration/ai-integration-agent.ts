import { BaseAgent } from '../core/base-agent.js';
import type { AgentConfig, AgentResult } from '../core/types.js';
import { CacheManager } from './cache-manager.js';
import { CostOptimizer } from './cost-optimizer.js';
import * as openaiService from '../../services/openai.js';
import { analyzeTradeWithAI } from '../../services/openai.js';

export class AIIntegrationAgent extends BaseAgent {
  private cache = new CacheManager<AgentResult>(300);
  private costOptimizer = new CostOptimizer();
  private cacheTTL = 30 * 60 * 1000; // 30 min

  constructor(config: AgentConfig, fallback: (...args: any[]) => Promise<any>) {
    super(config, fallback);
  }

  getId() {
    return this.config.id;
  }

  generateTradeCacheKey(trade: any): string {
    return [trade.symbol, trade.direction, trade.entry, trade.exit, trade.stopLoss, trade.takeProfit].join('|');
  }

  async analyzeTradeOptimized(trade: any): Promise<AgentResult> {
    const start = Date.now();
    const key = this.generateTradeCacheKey(trade);
    let cacheHit = false;
    let result: AgentResult;
    try {
      if (this.cache.has(key)) {
        cacheHit = true;
        result = this.cache.get(key)!;
        this.updateMetrics(true, Date.now() - start, true);
        this.costOptimizer.addCostSaved(0.02); // Example: $0.02 per call saved
        return { ...result, cacheHit, executionTime: Date.now() - start, source: 'agent' };
      }
      // Pass the full trade object to analyzeTradeWithAI
      const data = await this.executeWithTimeout(() => analyzeTradeWithAI(trade), this.config.timeout);
      result = { success: true, data, source: 'agent', executionTime: Date.now() - start };
      this.cache.set(key, result, this.cacheTTL);
      this.updateMetrics(true, Date.now() - start, false);
      this.costOptimizer.addCost(0.02); // Example: $0.02 per call
      return { ...result, cacheHit: false };
    } catch (error: any) {
      this.updateMetrics(false, Date.now() - start, false, error.message);
      // Fallback to original
      try {
        const data = await this.fallback(trade);
        return { success: true, data, source: 'fallback', executionTime: Date.now() - start };
      } catch (fallbackError: any) {
        return { success: false, data: null, source: 'fallback', executionTime: Date.now() - start, error: fallbackError.message };
      }
    }
  }

  getCostSavings(): number {
    return this.costOptimizer.getCostSaved();
  }
}
