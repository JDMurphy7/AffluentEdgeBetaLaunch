import { BaseAgent } from '../core/base-agent.js';
import type { AgentConfig, AgentResult } from '../core/types.js';
import { validateTrade } from './validator.js';
import { enrichTrade } from './enricher.js';

export class TradeAgent extends BaseAgent {
  getId() {
    return this.config.id;
  }

  async validateAndEnrich(trade: any): Promise<AgentResult> {
    const start = Date.now();
    try {
      const validation = validateTrade(trade);
      if (!validation.valid) {
        this.updateMetrics(false, Date.now() - start, false, validation.errors.join(', '));
        return { success: false, data: null, source: 'agent', executionTime: Date.now() - start, error: validation.errors.join(', ') };
      }
      const enriched = enrichTrade(trade);
      this.updateMetrics(true, Date.now() - start, false);
      return { success: true, data: enriched, source: 'agent', executionTime: Date.now() - start };
    } catch (error: any) {
      this.updateMetrics(false, Date.now() - start, false, error.message);
      return { success: false, data: null, source: 'agent', executionTime: Date.now() - start, error: error.message };
    }
  }
}
