import { db } from "../server/db.js";
import { portfolioSnapshots } from "../shared/schema.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Demo user ID (usually 1)
const DEMO_USER_ID = 1;

// Create a portfolio snapshot for the demo user
async function createPortfolioSnapshot() {
  try {
    // Current balance (random value between 100000 and 150000)
    const balance = Math.round((100000 + Math.random() * 50000) * 100) / 100;
    
    // Equity (balance plus or minus 5%)
    const equity = Math.round((balance * (1 + (Math.random() * 0.1 - 0.05))) * 100) / 100;
    
    // Drawdown (random between 0 and 5%)
    const drawdown = Math.round((Math.random() * 0.05) * 100) / 100;
    
    // Insert the snapshot
    const result = await db.insert(portfolioSnapshots).values({
      userId: DEMO_USER_ID,
      balance: balance,
      equity: equity,
      drawdown: drawdown,
      snapshotTime: new Date()
    }).returning();
    
    console.log("Created portfolio snapshot:", result[0]);
    
    // Create 30 additional historical snapshots for the last 30 days
    for (let i = 1; i <= 30; i++) {
      const historicalBalance = Math.round((100000 + Math.random() * 30000) * 100) / 100;
      const historicalEquity = Math.round((historicalBalance * (1 + (Math.random() * 0.1 - 0.05))) * 100) / 100;
      const historicalDrawdown = Math.round((Math.random() * 0.05) * 100) / 100;
      
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      await db.insert(portfolioSnapshots).values({
        userId: DEMO_USER_ID,
        balance: historicalBalance,
        equity: historicalEquity,
        drawdown: historicalDrawdown,
        snapshotTime: date
      });
      
      console.log(`Created historical snapshot for ${date.toISOString()}`);
    }
    
    console.log("Successfully created 31 portfolio snapshots");
    process.exit(0);
  } catch (error) {
    console.error("Error creating portfolio snapshot:", error);
    process.exit(1);
  }
}

// Run the function
createPortfolioSnapshot();
