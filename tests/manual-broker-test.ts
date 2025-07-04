// tests/manual-broker-test.ts
import { db } from './setup-test-db-tables.js';
import { CsvBrokerIntegration } from '../server/integrations/csv-importer.js';
import { storage } from '../server/storage.js';

async function testBrokerImport() {
  console.log('Running broker import test...');
  
  const userId = 1; // Use demo user
  
  const csvData = 'symbol,direction,entryTime,exitTime,entryPrice,exitPrice,quantity,notes\nEURUSD,long,2024-01-01,2024-01-02,1.1,1.2,100,Test';
  
  try {
    const trades = await CsvBrokerIntegration.importTrades(userId, { csvData });
    console.log(`Imported ${trades.length} trades from CSV`);
    
    // Save to database
    for (const trade of trades) {
      try {
        const insertTrade = {
          userId,
          symbol: trade.symbol,
          direction: trade.direction,
          entryTime: trade.entryTime instanceof Date ? trade.entryTime : new Date(trade.entryTime),
          exitTime: trade.exitTime ? (trade.exitTime instanceof Date ? trade.exitTime : new Date(trade.exitTime)) : undefined,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          quantity: trade.quantity,
          assetClass: 'forex',
          notes: trade.notes,
          status: 'closed',
        };
        
        console.log('Inserting trade:', insertTrade);
        const saved = await storage.createTrade(insertTrade);
        console.log('Saved trade:', saved);
      } catch (e) {
        console.error('Error saving trade:', e);
      }
    }
    
    console.log('Test completed successfully');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testBrokerImport().catch(err => console.error('Uncaught error:', err));
