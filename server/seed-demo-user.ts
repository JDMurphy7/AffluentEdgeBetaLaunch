import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { portfolioSnapshots, trades } from "../shared/schema.js";
import { eq } from "drizzle-orm";

export async function seedDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, 'demo@affluentedge.com'));
    
    if (existingUser.length > 0) {
      console.log("Demo user already exists, skipping seed");
      return;
    }

    console.log("Creating demo user with sample data...");
    
    // Create demo user
    const [demoUser] = await db.insert(users).values({
      email: 'demo@affluentedge.com',
      password: 'demo123', // In production, this would be hashed
      firstName: 'Demo',
      lastName: 'User',
      accountBalance: 127450.00,
      customBalance: false,
      betaStatus: 'active'
    }).returning();

    // Create sample portfolio snapshots for equity curve (last 12 months)
    const snapshots = [
      { balance: 100000.00, equity: 100000.00, drawdown: 0.00, days: 330 },
      { balance: 105000.00, equity: 104800.00, drawdown: 0.19, days: 300 },
      { balance: 102000.00, equity: 101900.00, drawdown: 2.86, days: 270 },
      { balance: 108000.00, equity: 107850.00, drawdown: 0.14, days: 240 },
      { balance: 115000.00, equity: 114750.00, drawdown: 0.22, days: 210 },
      { balance: 112000.00, equity: 111800.00, drawdown: 2.78, days: 180 },
      { balance: 118000.00, equity: 117900.00, drawdown: 0.08, days: 150 },
      { balance: 125000.00, equity: 124800.00, drawdown: 0.16, days: 120 },
      { balance: 120000.00, equity: 119850.00, drawdown: 4.12, days: 90 },
      { balance: 127000.00, equity: 126900.00, drawdown: 0.08, days: 60 },
      { balance: 124000.00, equity: 123800.00, drawdown: 2.44, days: 30 },
      { balance: 127450.00, equity: 127450.00, drawdown: 0.00, days: 0 }
    ];

    for (const snapshot of snapshots) {
      const snapshotDate = new Date();
      snapshotDate.setDate(snapshotDate.getDate() - snapshot.days);
      
      await db.insert(portfolioSnapshots).values({
        userId: demoUser.id,
        balance: snapshot.balance,
        equity: snapshot.equity,
        drawdown: snapshot.drawdown,
        snapshotTime: snapshotDate
      });
    }

    // Create sample trades with AI analysis
    const sampleTrades = [
      {
        symbol: 'EUR/USD',
        assetClass: 'forex',
        direction: 'long',
        entryPrice: 1.0850,
        exitPrice: 1.0920,
        stopLoss: 1.0800,
        takeProfit: 1.0920,
        quantity: 100000,
        pnl: 700.00,
        status: 'closed',
        aiGrade: 'A',
        aiAnalysis: {
          strengths: ['Perfect trend following execution', 'Proper risk management', 'Good entry timing'],
          weaknesses: [],
          suggestions: ['Continue following this disciplined approach'],
          strategyNotes: 'Excellent adherence to trend following rules',
          riskAssessment: 'Low risk, well-managed position'
        },
        strategyAdherence: 95,
        riskManagementScore: 'A',
        notes: 'Clean trend following trade on EUR/USD',
        days: 30
      },
      {
        symbol: 'GBP/JPY',
        assetClass: 'forex',
        direction: 'short',
        entryPrice: 185.50,
        exitPrice: 183.20,
        stopLoss: 186.50,
        takeProfit: 183.00,
        quantity: 50000,
        pnl: 1150.00,
        status: 'closed',
        aiGrade: 'A',
        aiAnalysis: {
          strengths: ['Excellent risk-reward ratio', 'Perfect strategy execution', 'Strong market analysis'],
          weaknesses: [],
          suggestions: ['Scale position size on similar setups'],
          strategyNotes: 'Textbook ICT concepts execution',
          riskAssessment: 'Optimal risk management'
        },
        strategyAdherence: 92,
        riskManagementScore: 'A',
        notes: 'ICT Order Block rejection trade',
        days: 3
      },
      {
        symbol: 'BTC/USD',
        assetClass: 'crypto',
        direction: 'long',
        entryPrice: 42500.00,
        exitPrice: 45200.00,
        stopLoss: 41500.00,
        takeProfit: 45000.00,
        quantity: 0.25,
        pnl: 675.00,
        status: 'closed',
        aiGrade: 'B',
        aiAnalysis: {
          strengths: ['Good market timing', 'Proper position sizing'],
          weaknesses: ['Slightly early exit', 'Could have held longer'],
          suggestions: ['Use trailing stops for trend continuation'],
          strategyNotes: 'Good breakout trade execution',
          riskAssessment: 'Appropriate risk for crypto volatility'
        },
        strategyAdherence: 88,
        riskManagementScore: 'B',
        notes: 'Bitcoin breakout above resistance',
        days: 2
      },
      {
        symbol: 'GOLD',
        assetClass: 'commodities',
        direction: 'long',
        entryPrice: 2045.50,
        exitPrice: 2038.20,
        stopLoss: 2040.00,
        takeProfit: 2055.00,
        quantity: 10,
        pnl: -73.00,
        status: 'closed',
        aiGrade: 'C',
        aiAnalysis: {
          strengths: ['Quick stop loss execution', 'Followed plan'],
          weaknesses: ['Poor market timing', 'Entered too early'],
          suggestions: ['Wait for clearer confirmation signals', 'Check multiple timeframes'],
          strategyNotes: 'Strategy followed but market conditions not ideal',
          riskAssessment: 'Risk was controlled despite loss'
        },
        strategyAdherence: 85,
        riskManagementScore: 'A',
        notes: 'Gold support level trade - stopped out',
        days: 1
      }
    ];

    for (const trade of sampleTrades) {
      const tradeDate = new Date();
      tradeDate.setDate(tradeDate.getDate() - trade.days);
      
      await db.insert(trades).values({
        userId: demoUser.id,
        symbol: trade.symbol,
        assetClass: trade.assetClass,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        quantity: trade.quantity,
        pnl: trade.pnl,
        status: trade.status,
        aiGrade: trade.aiGrade,
        aiAnalysis: trade.aiAnalysis,
        strategyAdherence: trade.strategyAdherence,
        riskManagementScore: trade.riskManagementScore,
        notes: trade.notes,
        entryTime: tradeDate,
        exitTime: trade.status === 'closed' ? tradeDate : null
      });
    }

    console.log(`Successfully created demo user with sample trading data`);
  } catch (error) {
    console.error("Error seeding demo user:", error);
  }
}