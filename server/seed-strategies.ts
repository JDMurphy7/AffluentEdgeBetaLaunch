import { db } from "./db";
import { strategies } from "@shared/schema";
import { eq } from "drizzle-orm";

export const builtInStrategies = [
  {
    name: "Trend Following",
    description: "Follow established market trends with momentum indicators and breakout patterns",
    category: "trend_following",
    isBuiltIn: true,
    rules: {
      principles: [
        "Only trade in the direction of the higher timeframe trend",
        "Wait for pullbacks to key support/resistance levels before entry",
        "Use moving averages (20, 50, 200) for trend confirmation",
        "Place stop loss below/above the previous swing low/high",
        "Target minimum 2:1 risk-reward ratio"
      ],
      indicators: ["Moving Averages", "RSI", "MACD", "Volume"],
      timeframes: ["1H", "4H", "Daily"],
      assetClasses: ["forex", "crypto", "commodities", "indices", "stocks"],
      riskManagement: {
        maxRiskPerTrade: 2,
        positionSizing: "1-2% of account per trade",
        stopLossRule: "Below previous swing low/high"
      }
    }
  },
  {
    name: "ICT Concepts",
    description: "Inner Circle Trader methodology focusing on smart money concepts and institutional order flow",
    category: "ict_concepts", 
    isBuiltIn: true,
    rules: {
      principles: [
        "Identify Order Blocks and Fair Value Gaps",
        "Trade during London/New York session overlaps",
        "Look for liquidity grabs before reversals",
        "Use premium/discount arrays for entry timing",
        "Target equal highs/lows for take profit"
      ],
      indicators: ["Order Blocks", "Fair Value Gaps", "Liquidity Pools", "Premium/Discount Arrays"],
      timeframes: ["15M", "1H", "4H"],
      assetClasses: ["forex", "indices"],
      riskManagement: {
        maxRiskPerTrade: 1,
        positionSizing: "0.5-1% of account per trade",
        stopLossRule: "Below Order Block or above/below liquidity"
      }
    }
  },
  {
    name: "Support & Resistance",
    description: "Trade bounces and breakouts from key horizontal and diagonal support/resistance levels",
    category: "support_resistance",
    isBuiltIn: true,
    rules: {
      principles: [
        "Identify clear horizontal S/R levels on higher timeframes",
        "Wait for price reaction at key levels before entry",
        "Confirm with volume and candlestick patterns",
        "Use previous resistance as new support (and vice versa)",
        "Exit at next major S/R level"
      ],
      indicators: ["Horizontal Lines", "Trendlines", "Volume", "Candlestick Patterns"],
      timeframes: ["1H", "4H", "Daily"],
      assetClasses: ["forex", "crypto", "commodities", "indices", "stocks"],
      riskManagement: {
        maxRiskPerTrade: 2,
        positionSizing: "1-2% of account per trade", 
        stopLossRule: "Beyond S/R level with buffer"
      }
    }
  },
  {
    name: "Scalping",
    description: "Quick intraday trades capturing small price movements with tight risk management",
    category: "scalping",
    isBuiltIn: true,
    rules: {
      principles: [
        "Trade only during high-volume sessions",
        "Use very tight stop losses (5-15 pips for forex)",
        "Target 1:1 to 1.5:1 risk-reward ratios maximum",
        "Exit trades within 5-30 minutes",
        "Focus on major pairs with tight spreads"
      ],
      indicators: ["1-5 minute charts", "Level 2 data", "Volume", "Orderbook"],
      timeframes: ["1M", "5M", "15M"],
      assetClasses: ["forex", "crypto"],
      riskManagement: {
        maxRiskPerTrade: 0.5,
        positionSizing: "0.25-0.5% of account per trade",
        stopLossRule: "Very tight - 5-15 pips maximum"
      }
    }
  },
  {
    name: "Candlestick Patterns",
    description: "Trade based on Japanese candlestick reversal and continuation patterns",
    category: "candlestick_patterns",
    isBuiltIn: true,
    rules: {
      principles: [
        "Identify high-probability reversal patterns (doji, hammer, engulfing)",
        "Confirm patterns with higher timeframe context",
        "Wait for pattern completion before entry",
        "Use pattern size for stop loss placement",
        "Target previous swing levels for profit taking"
      ],
      indicators: ["Candlestick Patterns", "Volume", "Support/Resistance"],
      timeframes: ["1H", "4H", "Daily"],
      assetClasses: ["forex", "crypto", "commodities", "indices", "stocks"],
      riskManagement: {
        maxRiskPerTrade: 1.5,
        positionSizing: "1-1.5% of account per trade",
        stopLossRule: "Beyond pattern low/high"
      }
    }
  },
  {
    name: "Breakout Trading",
    description: "Trade breakouts from consolidation patterns and key resistance/support levels",
    category: "breakout",
    isBuiltIn: true,
    rules: {
      principles: [
        "Identify clear consolidation patterns (triangles, rectangles)",
        "Wait for decisive breakout with volume confirmation",
        "Enter on retest of broken level (if applicable)",
        "Use pattern height for profit target",
        "Stop loss just inside the pattern"
      ],
      indicators: ["Chart Patterns", "Volume", "Volatility"],
      timeframes: ["1H", "4H", "Daily"],
      assetClasses: ["forex", "crypto", "commodities", "indices", "stocks"],
      riskManagement: {
        maxRiskPerTrade: 2,
        positionSizing: "1-2% of account per trade",
        stopLossRule: "Inside the pattern or below breakout level"
      }
    }
  }
];

export async function seedStrategies() {
  try {
    // Check if strategies already exist
    const existingStrategies = await db.select().from(strategies).where(eq(strategies.isBuiltIn, true));
    
    if (existingStrategies.length > 0) {
      console.log("Built-in strategies already exist, skipping seed");
      return;
    }

    console.log("Seeding built-in trading strategies...");
    
    for (const strategy of builtInStrategies) {
      await db.insert(strategies).values(strategy);
    }
    
    console.log(`Successfully seeded ${builtInStrategies.length} built-in strategies`);
  } catch (error) {
    console.error("Error seeding strategies:", error);
  }
}