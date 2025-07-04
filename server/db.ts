import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "../shared/schema.js";
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// For tests, explicitly set DATABASE_URL if not defined
if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'test') {
  process.env.DATABASE_URL = 'sqlite:./data/test.db';
  console.log('Setting DATABASE_URL for test environment:', process.env.DATABASE_URL);
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Always resolve to absolute path
let sqlitePath = process.env.DATABASE_URL.replace('sqlite:', '');
if (!path.isAbsolute(sqlitePath)) {
  sqlitePath = path.resolve(process.cwd(), sqlitePath);
}
fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
console.log(`[DB] Using database file: ${sqlitePath}`);
export const db = drizzle(new Database(sqlitePath), { schema });