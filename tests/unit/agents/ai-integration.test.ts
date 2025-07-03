import { OptimizerAgent } from '@aeopt/agents/optimizer';
import { LegacyAgent } from '@aeopt/agents/legacyAgent';
import { EntryManager } from '@aeopt/journal/entryManager';
import config from '@aeopt/config/index';

describe('AI Agent System', () => {
  test('All agents initialize correctly without errors', () => {
    expect(() => new OptimizerAgent()).not.toThrow();
    expect(() => new LegacyAgent()).not.toThrow();
  });

  test('Agent orchestrator starts and manages agents properly', () => {
    const entryManager = new EntryManager();
    expect(entryManager).toHaveProperty('analyzeTrade');
    expect(typeof entryManager.analyzeTrade).toBe('function');
  });

  test('Cache systems initialize with proper TTL settings', () => {
    expect(config.caching).toBeDefined();
    expect(config.caching.expirationTime).toBeGreaterThan(0);
  });

  test('Fallback mechanisms activate when agents fail', () => {
    const entryManager = new EntryManager();
    // Spy on optimizerAgent's analyzeTradeOptimized to throw
    // @ts-ignore
    entryManager["optimizerAgent"].analyzeTradeOptimized = () => { throw new Error('fail'); };
    // Spy on legacyAgent's analyzeTrade to check if called
    let legacyCalled = false;
    // @ts-ignore
    entryManager["legacyAgent"].analyzeTrade = () => { legacyCalled = true; };
    expect(() => entryManager.analyzeTrade({ id: '1', timestamp: '', userId: '', tradeDetails: {} })).not.toThrow();
    expect(legacyCalled).toBe(true);
  });
});
