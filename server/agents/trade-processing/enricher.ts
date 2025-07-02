// Data enrichment for trades
export function enrichTrade(trade: any): any {
  // Example: add derived fields
  return {
    ...trade,
    riskReward: trade.takeProfit && trade.stopLoss ?
      Math.abs((trade.takeProfit - trade.entry) / (trade.entry - trade.stopLoss)) : null,
    duration: trade.exitTime && trade.entryTime ?
      (new Date(trade.exitTime).getTime() - new Date(trade.entryTime).getTime()) / 1000 : null,
  };
}
