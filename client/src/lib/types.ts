export interface User {
  id: number;
  username: string;
  email: string;
  accountBalance: string;
  createdAt: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  rules: Record<string, any>;
  category: string;
  isBuiltIn: boolean;
  createdBy?: number;
  createdAt: string;
}

export interface Trade {
  id: number;
  userId: number;
  strategyId?: number;
  symbol: string;
  assetClass: string;
  direction: string;
  entryPrice: string;
  exitPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  quantity: string;
  pnl?: string;
  status: string;
  aiGrade?: string;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    strategyNotes: string;
    riskAssessment: string;
  };
  strategyAdherence?: number;
  riskManagementScore?: string;
  notes?: string;
  entryTime: string;
  exitTime?: string;
  createdAt: string;
}

export interface PortfolioSnapshot {
  id: number;
  userId: number;
  balance: string;
  equity: string;
  drawdown: string;
  snapshotTime: string;
}

export interface PortfolioMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface StrategyPerformance {
  strategy: Strategy;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  averageGrade: string;
}
