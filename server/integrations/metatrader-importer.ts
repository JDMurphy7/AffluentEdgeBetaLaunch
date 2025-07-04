import { BrokerIntegration, BrokerTrade } from "./broker-interface.js";
import { parse } from "csv-parse/sync";

export const MetaTraderBrokerIntegration: BrokerIntegration = {
  name: "metatrader",
  async importTrades(userId, credentials, options) {
    console.log("[MetaTrader Integration] Starting import for user", userId);
    const { csvData } = credentials;
    if (!csvData) throw new Error("Missing MetaTrader CSV data");
    
    try {
      console.log("[MetaTrader Integration] Parsing CSV data...");
      const records = parse(csvData, { columns: true, skip_empty_lines: true });
      console.log("[MetaTrader Integration] Parsed records:", JSON.stringify(records));
      
      // Map MetaTrader CSV columns to BrokerTrade fields
      const trades: BrokerTrade[] = records.map((row: any) => ({
        symbol: row['Symbol'],
        direction: row['Type'] === 'buy' ? 'long' : 'short',
        entryTime: new Date(row['Open Time']),
        exitTime: row['Close Time'] ? new Date(row['Close Time']) : undefined,
        entryPrice: parseFloat(row['Open Price']),
        exitPrice: row['Close Price'] ? parseFloat(row['Close Price']) : undefined,
        quantity: parseFloat(row['Volume']),
        notes: row['Comment'],
        broker: "metatrader",
        raw: row,
      }));
      
      console.log("[MetaTrader Integration] Processed trades:", JSON.stringify(trades));
      return trades;
    } catch (error: any) {
      console.error("[MetaTrader Integration] Error parsing CSV:", error);
      throw new Error(`MetaTrader CSV parsing error: ${error?.message || 'Unknown error'}`);
    }
  },
};
