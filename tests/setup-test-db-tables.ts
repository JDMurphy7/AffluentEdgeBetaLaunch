// tests/setup-test-db-tables.ts
import { db } from './setup-test-db.js';
import * as schema from '../shared/schema.js';

// Create the tables needed for testing
async function createTestTables() {
  const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    firstName TEXT,
    lastName TEXT,
    balance REAL DEFAULT 100000,
    accountSize REAL DEFAULT 100000,
    betaStatus TEXT DEFAULT 'pending',
    hubspotContactId TEXT,
    stripeCustomerId TEXT,
    subscriptionStatus TEXT DEFAULT 'trial',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

  CREATE TABLE IF NOT EXISTS strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    isActive BOOLEAN DEFAULT true,
    rules TEXT,
    tags TEXT,
    performance REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    strategyId INTEGER,
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL,
    entryTime DATETIME NOT NULL,
    exitTime DATETIME,
    entryPrice REAL NOT NULL,
    exitPrice REAL,
    quantity REAL NOT NULL,
    fees REAL DEFAULT 0,
    pnl REAL,
    pnlPercentage REAL,
    risk REAL,
    reward REAL,
    riskRewardRatio REAL,
    assetClass TEXT DEFAULT 'forex',
    notes TEXT,
    tags TEXT,
    rating INTEGER,
    status TEXT DEFAULT 'open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    balance REAL NOT NULL,
    equity REAL NOT NULL,
    drawdown REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `;

  // Split the SQL statement and execute each part
  const statements = sql.split(';').map(s => s.trim()).filter(s => s);
  for (const statement of statements) {
    try {
      // Use the database connection directly to run raw SQL
      // @ts-ignore - the driver property exists but is not in the type definition
      db.$client.exec(statement);
      console.log(`Executed SQL: ${statement.substring(0, 40)}...`);
    } catch (err) {
      console.error(`Error executing SQL: ${statement.substring(0, 40)}...`, err);
    }
  }
}

// Create a demo user for testing
async function createDemoUser() {
  try {
    const result = db.insert(schema.users).values({
      email: 'demo@affluentedge.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
      accountBalance: 100000,
      customBalance: true,
      betaStatus: 'approved',
    }).onConflictDoNothing().returning().get();
    
    console.log('Created demo user:', result);
  } catch (err) {
    console.error('Error creating demo user:', err);
  }
}

// Run setup
createTestTables();
createDemoUser();

console.log('Test database tables and demo user created');

export { db };
