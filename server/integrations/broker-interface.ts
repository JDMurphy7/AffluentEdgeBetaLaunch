export interface BrokerTrade {
  symbol: string;
  direction: 'long' | 'short';
  entryTime: Date;
  exitTime?: Date;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  assetClass?: string;
  notes?: string;
  broker: string;
  raw?: any;
}

export interface BrokerIntegration {
  name: string;
  importTrades(userId: number, credentials: any, options?: any): Promise<BrokerTrade[]>;
  // Optionally, support OAuth/token refresh, etc.
}
