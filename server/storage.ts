import { 
  users, 
  strategies, 
  trades, 
  portfolioSnapshots,
  type User, 
  type InsertUser,
  type Strategy,
  type InsertStrategy,
  type Trade,
  type InsertTrade,
  type PortfolioSnapshot,
  type InsertPortfolioSnapshot
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<User>;
  updateUserBalance(userId: number, balance: string): Promise<void>;
  updateUserBetaStatus(userId: number, status: string): Promise<void>;
  linkUserToHubSpot(userId: number, hubspotContactId: string): Promise<void>;
  // Replit Auth methods
  upsertUser(userData: { id: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<any>;
  
  // Admin methods
  getAllUsersWithPasswords(): Promise<Array<{ id: number; email: string; firstName?: string; lastName?: string; betaStatus: string; password: string; }>>

  // Strategy methods
  getStrategies(): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  getUserStrategies(userId: number): Promise<Strategy[]>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;

  // Trade methods
  getTrades(userId: number, limit?: number): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, updates: Partial<Trade>): Promise<Trade>;
  getTradesByStrategy(userId: number, strategyId: number): Promise<Trade[]>;

  // Portfolio methods
  getPortfolioSnapshots(userId: number, limit?: number): Promise<PortfolioSnapshot[]>;
  createPortfolioSnapshot(snapshot: InsertPortfolioSnapshot): Promise<PortfolioSnapshot>;
  getLatestPortfolioSnapshot(userId: number): Promise<PortfolioSnapshot | undefined>;

  // Analytics methods
  getPortfolioMetrics(userId: number): Promise<{
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    totalPnL: number;
    maxDrawdown: number;
    sharpeRatio: number;
  }>;
  getStrategyPerformance(userId: number): Promise<Array<{
    strategy: Strategy;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    averageGrade: string;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }



  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserBalance(userId: number, balance: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        accountBalance: balance,
        customBalance: true
      })
      .where(eq(users.id, userId));
  }

  async updateUserBetaStatus(userId: number, status: string): Promise<void> {
    await db
      .update(users)
      .set({ betaStatus: status })
      .where(eq(users.id, userId));
  }

  async linkUserToHubSpot(userId: number, hubspotContactId: string): Promise<void> {
    await db
      .update(users)
      .set({ hubspotContactId })
      .where(eq(users.id, userId));
  }

  async upsertUser(userData: { id: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<any> {
    // For Replit Auth, we'll just return the user data since we don't store Replit users in our database
    // This method exists to satisfy the interface requirement
    return userData;
  }

  // Strategy methods
  async getStrategies(): Promise<Strategy[]> {
    return await db.select().from(strategies).where(eq(strategies.isBuiltIn, true));
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
    return strategy || undefined;
  }

  async getUserStrategies(userId: number): Promise<Strategy[]> {
    return await db.select().from(strategies)
      .where(and(eq(strategies.createdBy, userId), eq(strategies.isBuiltIn, false)));
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const [newStrategy] = await db
      .insert(strategies)
      .values(strategy)
      .returning();
    return newStrategy;
  }

  // Trade methods
  async getTrades(userId: number, limit: number = 50): Promise<Trade[]> {
    return await db.select()
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.createdAt))
      .limit(limit);
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade || undefined;
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db
      .insert(trades)
      .values(trade)
      .returning();
    return newTrade;
  }

  async updateTrade(id: number, updates: Partial<Trade>): Promise<Trade> {
    const [updatedTrade] = await db
      .update(trades)
      .set(updates)
      .where(eq(trades.id, id))
      .returning();
    return updatedTrade;
  }

  async getTradesByStrategy(userId: number, strategyId: number): Promise<Trade[]> {
    return await db.select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.strategyId, strategyId)))
      .orderBy(desc(trades.createdAt));
  }

  // Portfolio methods
  async getPortfolioSnapshots(userId: number, limit: number = 365): Promise<PortfolioSnapshot[]> {
    return await db.select()
      .from(portfolioSnapshots)
      .where(eq(portfolioSnapshots.userId, userId))
      .orderBy(desc(portfolioSnapshots.snapshotTime))
      .limit(limit);
  }

  async createPortfolioSnapshot(snapshot: InsertPortfolioSnapshot): Promise<PortfolioSnapshot> {
    const [newSnapshot] = await db
      .insert(portfolioSnapshots)
      .values(snapshot)
      .returning();
    return newSnapshot;
  }

  async getLatestPortfolioSnapshot(userId: number): Promise<PortfolioSnapshot | undefined> {
    const [snapshot] = await db.select()
      .from(portfolioSnapshots)
      .where(eq(portfolioSnapshots.userId, userId))
      .orderBy(desc(portfolioSnapshots.snapshotTime))
      .limit(1);
    return snapshot || undefined;
  }

  // Analytics methods
  async getPortfolioMetrics(userId: number): Promise<{
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    totalPnL: number;
    maxDrawdown: number;
    sharpeRatio: number;
  }> {
    const userTrades = await db.select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, 'closed')));

    const totalTrades = userTrades.length;
    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        totalPnL: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      };
    }

    const winningTrades = userTrades.filter(trade => parseFloat(trade.pnl || '0') > 0);
    const losingTrades = userTrades.filter(trade => parseFloat(trade.pnl || '0') < 0);
    
    const winRate = (winningTrades.length / totalTrades) * 100;
    const totalPnL = userTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || '0'), 0);
    
    const grossProfit = winningTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || '0'), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || '0'), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

    // Calculate max drawdown from portfolio snapshots
    const snapshots = await this.getPortfolioSnapshots(userId, 365);
    let maxDrawdown = 0;
    let peak = 0;
    
    for (const snapshot of snapshots.reverse()) {
      const balance = parseFloat(snapshot.balance);
      if (balance > peak) peak = balance;
      const drawdown = ((peak - balance) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Simple Sharpe ratio calculation (would need risk-free rate for proper calculation)
    const returns = userTrades.map(trade => parseFloat(trade.pnl || '0'));
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return {
      totalTrades,
      winRate,
      profitFactor,
      totalPnL,
      maxDrawdown,
      sharpeRatio,
    };
  }

  async getStrategyPerformance(userId: number): Promise<Array<{
    strategy: Strategy;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    averageGrade: string;
  }>> {
    const userTrades = await db.select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, 'closed')));

    const strategiesMap = new Map<number, Strategy>();
    const performanceMap = new Map<number, {
      trades: Trade[];
      strategy: Strategy;
    }>();

    // Get all strategies used by the user
    const allStrategies = await db.select().from(strategies);
    allStrategies.forEach(strategy => strategiesMap.set(strategy.id, strategy));

    // Group trades by strategy
    for (const trade of userTrades) {
      if (!trade.strategyId) continue;
      
      const strategy = strategiesMap.get(trade.strategyId);
      if (!strategy) continue;

      if (!performanceMap.has(trade.strategyId)) {
        performanceMap.set(trade.strategyId, {
          trades: [],
          strategy,
        });
      }
      performanceMap.get(trade.strategyId)!.trades.push(trade);
    }

    // Calculate performance metrics for each strategy
    const results = Array.from(performanceMap.values()).map(({ trades: strategyTrades, strategy }) => {
      const totalTrades = strategyTrades.length;
      const winningTrades = strategyTrades.filter(trade => parseFloat(trade.pnl || '0') > 0);
      const losingTrades = strategyTrades.filter(trade => parseFloat(trade.pnl || '0') < 0);
      
      const winRate = (winningTrades.length / totalTrades) * 100;
      
      const grossProfit = winningTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || '0'), 0);
      const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || '0'), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

      // Calculate average grade
      const gradesWithValues = strategyTrades
        .filter(trade => trade.aiGrade)
        .map(trade => {
          const gradeMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
          return gradeMap[trade.aiGrade as keyof typeof gradeMap] || 0;
        });
      
      const averageGradeValue = gradesWithValues.length > 0 
        ? gradesWithValues.reduce((sum, grade) => sum + grade, 0) / gradesWithValues.length 
        : 0;
      
      const gradeMap = ['F', 'D', 'C', 'B', 'A'];
      const averageGrade = gradeMap[Math.round(averageGradeValue)] || 'N/A';

      return {
        strategy,
        winRate,
        profitFactor,
        totalTrades,
        averageGrade,
      };
    });

    return results;
  }
  async getAllUsersWithPasswords(): Promise<Array<{ id: number; email: string; firstName?: string; lastName?: string; betaStatus: string; password: string; }>> {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      betaStatus: users.betaStatus,
      password: users.password
    })
    .from(users)
    .where(sql`${users.betaStatus} IN ('approved', 'active', 'blocked') AND ${users.betaStatus} != 'deleted'`);
    
    return allUsers.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      betaStatus: user.betaStatus,
      password: user.password
    }));
  }

  async deleteUser(userId: number): Promise<void> {
    // Delete all trades for user
    await db.delete(trades).where(eq(trades.userId, userId));
    // Delete all strategies created by user
    await db.delete(strategies).where(eq(strategies.createdBy, userId));
    // Delete all portfolio snapshots for user
    await db.delete(portfolioSnapshots).where(eq(portfolioSnapshots.userId, userId));
    // Finally, delete the user
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
