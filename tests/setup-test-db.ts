// tests/setup-test-db.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "../shared/schema.js";
import fs from 'fs';
import path from 'path';

// Explicitly set DATABASE_URL for tests
process.env.DATABASE_URL = 'sqlite:./data/test.db';
process.env.NODE_ENV = 'test';

// Create database directory if it doesn't exist
const dbPath = path.resolve(process.cwd(), './data/test.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Create database connection
const db = drizzle(new Database(dbPath), { schema });

// Export for other modules
export { db };

console.log('Test database setup complete, path:', dbPath);
