import { Router } from "express";
import { calculateSharpeRatio, calculateWinRate } from "../services/analytics/index.js";
import { storage } from "../storage.js";
import { redisClient } from "../redis-session.js";
import { Trade } from "../../shared/schema.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const period = req.query.period as string || "30d";
  const cacheKey = `analytics:${userId}:${period}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Fetch trades and calculate analytics
  const trades: Trade[] = await storage.getTradesForPeriod(userId, period);
  const returns = trades.map((t: Trade) => Number(t.pnl));
  const sharpe = calculateSharpeRatio(returns);
  const winRate = calculateWinRate(trades);
  // TODO: Add more analytics (drawdown, expectancy, etc.)
  const result = { sharpe, winRate };
  await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });
  res.json(result);
});

// Deprecated: Use /api/v1/analytics instead. This route will be removed in a future release.

export default router;
