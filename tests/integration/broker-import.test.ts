// Import the test database setup before anything else
import '../setup-sql-test-db.js';
import request from 'supertest';
import { app } from '../../server/index.js';

describe('Broker Import API', () => {
  it('imports trades from CSV', async () => {
    const res = await request(app)
      .post('/api/v1/import')
      .send({ broker: 'csv', credentials: { csvData: 'symbol,direction,entryTime,exitTime,entryPrice,exitPrice,quantity,notes\nEURUSD,long,2024-01-01,2024-01-02,1.1,1.2,100,Test' } });
    expect(res.status).toBe(200);
    expect(res.body.imported).toBe(1);
  });

  it('imports trades from MetaTrader CSV', async () => {
    const res = await request(app)
      .post('/api/v1/import')
      .send({ broker: 'metatrader', credentials: { csvData: 'Symbol,Type,Open Time,Close Time,Open Price,Close Price,Volume,Comment\nEURUSD,buy,2024-01-01,2024-01-02,1.1,1.2,100,Test' } });
    expect(res.status).toBe(200);
    expect(res.body.imported).toBe(1);
  });

  it('imports trades from Interactive Brokers XML', async () => {
    const xmlData = `<?xml version="1.0"?><FlexQueryResponse><Trades><Trade><Symbol>EURUSD</Symbol><BuySell>BUY</BuySell><TradeDate>2024-01-01</TradeDate><TradePrice>1.1</TradePrice><Quantity>100</Quantity></Trade></Trades></FlexQueryResponse>`;
    const res = await request(app)
      .post('/api/v1/import')
      .send({ broker: 'interactivebrokers', credentials: { xmlData } });
    expect(res.status).toBe(200);
    expect(res.body.imported).toBe(1);
  });
});
