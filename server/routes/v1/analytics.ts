import { Router } from "express";
import { z } from "zod";
import { calculateSharpeRatio, calculateWinRate, calculateMaxDrawdown, calculateExpectancy, calculateBenchmarkComparison, calculateRollingReturns, calculateVolatility } from "../../services/analytics/index.js";
import { storage } from "../../storage.js";
import { redisClient } from "../../redis-session.js";
import { Trade } from "../../../shared/schema.js";

const router = Router();

const analyticsQuerySchema = z.object({
  period: z.string().optional().default("30d"),
});

const analyticsParamsSchema = z.object({
  userId: z.string().regex(/^\d+$/),
});

router.get("/:userId", async (req, res, next) => {
  try {
    const params = analyticsParamsSchema.parse(req.params);
    const query = analyticsQuerySchema.parse(req.query);
    const userId = Number(params.userId);
    const period = query.period;
    const cacheKey = `analytics:${userId}:${period}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    // Fetch trades and calculate analytics
    const trades: Trade[] = await storage.getTradesForPeriod(userId, period);
    const returns = trades.map((t: Trade) => Number(t.pnl));
    const sharpe = calculateSharpeRatio(returns);
    const winRate = calculateWinRate(trades);
    const maxDrawdown = calculateMaxDrawdown(returns);
    const expectancy = calculateExpectancy(trades);
    // For demonstration, use a static benchmark (e.g., S&P 500 returns)
    const benchmarkReturns = returns.map(() => 0.01); // Replace with real data source
    const benchmarkComparison = calculateBenchmarkComparison(returns, benchmarkReturns);
    const rollingReturns = calculateRollingReturns(returns, 10);
    const volatility = calculateVolatility(returns);
    const result = { sharpe, winRate, maxDrawdown, expectancy, benchmarkComparison, rollingReturns, volatility };
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
