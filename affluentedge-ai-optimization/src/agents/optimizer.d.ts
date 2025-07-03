export declare class OptimizerAgent {
  constructor();
  analyzeTradeOptimized(tradeData: any): void;
  generateTradeCacheKey(tradeData: any): string;
  getCostSavings(originalCost: number, optimizedCost: number): number;
}
