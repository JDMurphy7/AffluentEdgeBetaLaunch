// Real-time P&L calculation engine (starter)
import { Trade } from "../../shared/schema.js";

export function calculatePnL(trades: Trade[]) {
  let openPnL = 0;
  let closedPnL = 0;
  for (const trade of trades) {
    if (trade.status === "open") {
      // TODO: Use current market price for open trades
      openPnL += Number(trade.pnl || 0);
    } else if (trade.status === "closed") {
      closedPnL += Number(trade.pnl || 0);
    }
  }
  return { openPnL, closedPnL };
}
