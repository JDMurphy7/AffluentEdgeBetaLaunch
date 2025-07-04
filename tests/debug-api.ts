// tests/debug-api.ts
import './setup-sql-test-db.js';
import request from 'supertest';
import { app } from '../server/index.js';

// Directly insert a test trade to verify database connectivity
import { db } from '../server/db.js';
import { trades } from '../shared/schema.js';

async function debugImportAPI() {
  console.log('Debugging import API...');

  // Test direct database insert
  try {
    const insertResult = await db.insert(trades).values({
      userId: 1,
      symbol: 'EURUSD',
      direction: 'long',
      entryTime: new Date('2024-01-01'),
      exitTime: new Date('2024-01-02'),
      entryPrice: 1.1,
      exitPrice: 1.2,
      quantity: 100,
      assetClass: 'forex',
      notes: 'Test',
      status: 'closed',
    }).returning().get();
    
    console.log('Direct DB insert success:', insertResult);
  } catch (err) {
    console.error('Direct DB insert failed:', err);
  }

  // Test CSV import
  try {
    const res = await request(app)
      .post('/api/v1/import')
      .send({ 
        broker: 'csv', 
        credentials: { 
          csvData: 'symbol,direction,entryTime,exitTime,entryPrice,exitPrice,quantity,notes\nEURUSD,long,2024-01-01,2024-01-02,1.1,1.2,100,Test' 
        } 
      });
    
    console.log('CSV Import Response Status:', res.status);
    console.log('CSV Import Response Body:', res.body);
    console.log('CSV Import Response Error:', res.error);
  } catch (err) {
    console.error('CSV Import Test Error:', err);
  }
}

debugImportAPI().catch(err => console.error('Debug Test Error:', err));
