// Optimized portfolio calculations
export function calculatePortfolioMetrics(trades: any[]): any {
  // Example: calculate total return, win rate, etc.
  let totalReturn = 0;
  let wins = 0;
  let losses = 0;
  for (const t of trades) {
    if (typeof t.pnl === 'number') totalReturn += t.pnl;
    if (t.pnl > 0) wins++;
    else if (t.pnl < 0) losses++;
  }
  return {
    totalReturn,
    winRate: trades.length ? wins / trades.length : 0,
    lossRate: trades.length ? losses / trades.length : 0,
    tradeCount: trades.length,
  };
}
