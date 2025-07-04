import { mean, std } from "mathjs";
import { Trade } from "../../../shared/schema.js";

export function calculateSharpeRatio(returns: number[]): number {
  const avg = mean(returns);
  const risk = std(returns, 'uncorrected') as number;
  return risk === 0 ? 0 : avg / risk;
}

export function calculateWinRate(trades: Trade[]): number {
  const wins = trades.filter(t => Number(t.pnl) > 0).length;
  return trades.length === 0 ? 0 : wins / trades.length;
}

export function calculateMaxDrawdown(returns: number[]): number {
  let maxDrawdown = 0;
  let peak = 0;
  let trough = 0;
  let maxPeak = 0;
  let runningTotal = 0;
  for (const r of returns) {
    runningTotal += r;
    if (runningTotal > maxPeak) maxPeak = runningTotal;
    const drawdown = maxPeak - runningTotal;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}

export function calculateExpectancy(trades: Trade[]): number {
  if (!trades.length) return 0;
  const wins = trades.filter(t => Number(t.pnl) > 0);
  const losses = trades.filter(t => Number(t.pnl) <= 0);
  const avgWin = wins.length ? wins.reduce((a, t) => a + Number(t.pnl), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((a, t) => a + Number(t.pnl), 0) / losses.length : 0;
  const winRate = wins.length / trades.length;
  const lossRate = losses.length / trades.length;
  return (avgWin * winRate) + (avgLoss * lossRate);
}

export function calculateBenchmarkComparison(returns: number[], benchmarkReturns: number[]): number {
  if (!returns.length || !benchmarkReturns.length) return 0;
  const avgReturn = mean(returns);
  const avgBenchmark = mean(benchmarkReturns);
  return avgReturn - avgBenchmark;
}

export function calculateRollingReturns(returns: number[], window: number = 10): number[] {
  if (returns.length < window) return [];
  const result: number[] = [];
  for (let i = 0; i <= returns.length - window; i++) {
    const windowSlice = returns.slice(i, i + window);
    result.push(mean(windowSlice));
  }
  return result;
}

export function calculateVolatility(returns: number[]): number {
  return std(returns, 'uncorrected') as number;
}

// Add more: advanced time-series analysis functions as needed.
