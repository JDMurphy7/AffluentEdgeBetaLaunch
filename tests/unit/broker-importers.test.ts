import { CsvBrokerIntegration } from '../../server/integrations/csv-importer';
import { MetaTraderBrokerIntegration } from '../../server/integrations/metatrader-importer';
import { InteractiveBrokersIntegration } from '../../server/integrations/interactivebrokers-importer';

describe('Broker Importers', () => {
  it('imports trades from CSV', async () => {
    const csvData = 'symbol,direction,entryTime,exitTime,entryPrice,exitPrice,quantity,notes\nEURUSD,long,2024-01-01,2024-01-02,1.1,1.2,100,Test';
    const trades = await CsvBrokerIntegration.importTrades(1, { csvData });
    expect(trades).toHaveLength(1);
    expect(trades[0].symbol).toBe('EURUSD');
  });

  it('imports trades from MetaTrader CSV', async () => {
    const csvData = 'Symbol,Type,Open Time,Close Time,Open Price,Close Price,Volume,Comment\nEURUSD,buy,2024-01-01,2024-01-02,1.1,1.2,100,Test';
    const trades = await MetaTraderBrokerIntegration.importTrades(1, { csvData });
    expect(trades).toHaveLength(1);
    expect(trades[0].symbol).toBe('EURUSD');
    expect(trades[0].direction).toBe('long');
  });

  it('imports trades from Interactive Brokers XML', async () => {
    const xmlData = `<?xml version="1.0"?><FlexQueryResponse><Trades><Trade><Symbol>EURUSD</Symbol><BuySell>BUY</BuySell><TradeDate>2024-01-01</TradeDate><TradePrice>1.1</TradePrice><Quantity>100</Quantity></Trade></Trades></FlexQueryResponse>`;
    const trades = await InteractiveBrokersIntegration.importTrades(1, { xmlData });
    expect(trades).toHaveLength(1);
    expect(trades[0].symbol).toBe('EURUSD');
    expect(trades[0].direction).toBe('long');
  });
});
