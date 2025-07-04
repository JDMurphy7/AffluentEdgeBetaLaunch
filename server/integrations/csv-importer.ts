import { BrokerIntegration, BrokerTrade } from "./broker-interface.js";
import { parse } from "csv-parse/sync";

export const CsvBrokerIntegration: BrokerIntegration = {
  name: "csv",
  async importTrades(userId, credentials, options) {
    console.log("[CSV Integration] Starting import for user", userId);
    // credentials: { csvData: string }
    const { csvData } = credentials;
    if (!csvData) throw new Error("Missing CSV data");
    
    try {
      console.log("[CSV Integration] Parsing CSV data...");
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
      });
      console.log("[CSV Integration] Parsed records:", JSON.stringify(records));
      
      // Map CSV columns to BrokerTrade fields
      const trades: BrokerTrade[] = records.map((row: any) => ({
        symbol: row.symbol,
        direction: row.direction,
        entryTime: new Date(row.entryTime),
        exitTime: row.exitTime ? new Date(row.exitTime) : undefined,
        entryPrice: parseFloat(row.entryPrice),
        exitPrice: row.exitPrice ? parseFloat(row.exitPrice) : undefined,
        quantity: parseFloat(row.quantity),
        notes: row.notes,
        broker: "csv",
        raw: row,
      }));
      
      console.log("[CSV Integration] Processed trades:", JSON.stringify(trades));
      return trades;
    } catch (error: any) {
      console.error("[CSV Integration] Error parsing CSV:", error);
      throw new Error(`CSV parsing error: ${error?.message || 'Unknown error'}`);
    }
  },
};
