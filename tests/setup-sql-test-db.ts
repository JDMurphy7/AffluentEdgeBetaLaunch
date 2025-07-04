// tests/setup-sql-test-db.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Set up test database
const dbPath = path.resolve(process.cwd(), './data/test.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
console.log('Using test database at:', dbPath);

// Create database connection
const db = new Database(dbPath);

// Create tables
const createTables = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        account_balance REAL DEFAULT 100000,
        custom_balance BOOLEAN DEFAULT false,
        beta_status TEXT DEFAULT 'pending',
        hubspot_contact_id TEXT,
        reset_token TEXT,
        reset_expires TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

      CREATE TABLE IF NOT EXISTS strategies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        rules TEXT NOT NULL,
        category TEXT NOT NULL,
        is_built_in BOOLEAN DEFAULT false,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        strategy_id INTEGER,
        symbol TEXT NOT NULL,
        asset_class TEXT NOT NULL DEFAULT 'forex',
        direction TEXT NOT NULL,
        entry_price REAL NOT NULL,
        exit_price REAL,
        stop_loss REAL,
        take_profit REAL,
        quantity REAL NOT NULL,
        pnl REAL,
        status TEXT NOT NULL DEFAULT 'open',
        ai_grade TEXT,
        ai_analysis TEXT,
        strategy_adherence INTEGER,
        risk_management_score TEXT,
        notes TEXT,
        entry_time DATETIME NOT NULL,
        exit_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portfolio_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        balance REAL NOT NULL,
        equity REAL NOT NULL,
        drawdown REAL,
        snapshot_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created database tables');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

// Create a demo user for testing
const createDemoUser = () => {
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@affluentedge.com');
    
    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (email, password, first_name, last_name, account_balance, beta_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'demo@affluentedge.com', 
        'demo123', 
        'Demo', 
        'User', 
        100000, 
        'approved'
      );
      console.log('Created demo user');
    } else {
      console.log('Demo user already exists');
    }
  } catch (err) {
    console.error('Error creating demo user:', err);
  }
};

// Run the setup
createTables();
createDemoUser();

// Set environment variables
process.env.DATABASE_URL = `sqlite:${dbPath}`;
process.env.NODE_ENV = 'test';

console.log('Test database setup complete');

export { db };
