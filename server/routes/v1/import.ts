import { Router } from "express";
import { z } from "zod";
import { CsvBrokerIntegration } from "../../integrations/csv-importer.js";
import { MetaTraderBrokerIntegration } from "../../integrations/metatrader-importer.js";
import { InteractiveBrokersIntegration } from "../../integrations/interactivebrokers-importer.js";
import { storage } from "../../storage.js";
import { insertTradeSchema } from "../../../shared/schema.js";

const router = Router();

const importSchema = z.object({
  broker: z.string(),
  credentials: z.any(),
  options: z.any().optional(),
});

// POST /api/v1/import
router.post("/", async (req, res, next) => {
  try {
    console.log("[Import API] Request body:", JSON.stringify(req.body));
    const { broker, credentials, options } = importSchema.parse(req.body);
    console.log(`[Import API] Using broker: ${broker}`);
    
    let integration;
    if (broker === "csv") {
      integration = CsvBrokerIntegration;
    } else if (broker === "metatrader") {
      integration = MetaTraderBrokerIntegration;
    } else if (broker === "interactivebrokers") {
      integration = InteractiveBrokersIntegration;
    } else {
      return res.status(400).json({ error: "Unsupported broker" });
    }
    
    let userId: number | undefined;
    if (req.session.betaUser) {
      userId = req.session.betaUser.id;
      console.log(`[Import API] Using beta user ID: ${userId}`);
    } else if (req.session.adminUser) {
      // Optionally support admin imports
      userId = 0;
      console.log(`[Import API] Using admin user ID: ${userId}`);
    } else {
      console.log("[Import API] No authenticated user found in session:", req.session);
      // For testing purposes, use a default user ID
      if (process.env.NODE_ENV === 'test') {
        userId = 1; // Use demo user for tests
        console.log("[Import API] Test environment, using default user ID: 1");
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
    
    console.log("[Import API] Importing trades...");
    const trades = await integration.importTrades(userId, credentials, options);
    console.log(`[Import API] Imported ${trades.length} trades from broker`);
    
    // Save imported trades to DB
    const savedTrades = [];
    for (const trade of trades) {
      try {
        // Map BrokerTrade to InsertTrade
        const insertTrade = insertTradeSchema.parse({
          userId,
          symbol: trade.symbol,
          direction: trade.direction,
          entryTime: trade.entryTime instanceof Date ? trade.entryTime : new Date(trade.entryTime),
          exitTime: trade.exitTime ? (trade.exitTime instanceof Date ? trade.exitTime : new Date(trade.exitTime)) : undefined,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          assetClass: trade.assetClass || "forex",
          notes: trade.notes,
          status: "closed",
        });
        
        console.log(`[Import API] Saving trade: ${trade.symbol}`);
        const saved = await storage.createTrade(insertTrade);
        savedTrades.push(saved);
      } catch (e) {
        console.error("[Import API] Error saving trade:", e);
        // skip invalid trades
      }
    }
    
    console.log(`[Import API] Successfully saved ${savedTrades.length} trades`);
    res.json({ success: true, imported: savedTrades.length, trades: savedTrades });
  } catch (err) {
    console.error("[Import API] Error in import endpoint:", err);
    next(err);
  }
});

export default router;
