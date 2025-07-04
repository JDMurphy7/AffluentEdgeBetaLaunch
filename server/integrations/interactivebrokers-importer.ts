import { BrokerIntegration, BrokerTrade } from "./broker-interface.js";
import { parseStringPromise } from "xml2js";

export const InteractiveBrokersIntegration: BrokerIntegration = {
  name: "interactivebrokers",
  async importTrades(userId, credentials, options) {
    console.log("[IB Integration] Starting import with credentials:", JSON.stringify(credentials));
    const { xmlData } = credentials;
    if (!xmlData) throw new Error("Missing Interactive Brokers Flex Query XML data");
    
    try {
      console.log("[IB Integration] Parsing XML data...");
      const result = await parseStringPromise(xmlData);
      console.log("[IB Integration] XML parsing succeeded:", JSON.stringify(result));
      
      // Map XML to BrokerTrade fields (simplified example)
      const trades: BrokerTrade[] = [];
      const tradesArray = result?.FlexQueryResponse?.Trades?.[0]?.Trade || [];
      console.log("[IB Integration] Found trades array:", JSON.stringify(tradesArray));
      
      for (const row of tradesArray) {
        trades.push({
          symbol: row['Symbol']?.[0] || '',
          direction: row['BuySell']?.[0] === 'BUY' ? 'long' : 'short',
          entryTime: new Date(row['TradeDate']?.[0]),
          entryPrice: parseFloat(row['TradePrice']?.[0]),
          quantity: parseFloat(row['Quantity']?.[0]),
          broker: "interactivebrokers",
          raw: row,
        });
      }
      
      console.log("[IB Integration] Processed trades:", JSON.stringify(trades));
      return trades;
    } catch (error: any) {
      console.error("[IB Integration] Error parsing or processing XML:", error);
      throw new Error(`Interactive Brokers XML parsing error: ${error?.message || 'Unknown error'}`);
    }
  },
};
