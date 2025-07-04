// test-setup.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { seedStrategies } from '../server/seed-strategies.js';
import { seedDemoUser } from '../server/seed-demo-user.js';

// Load test environment variables
const result = config({ path: resolve(__dirname, '../.env.test') });

// Print current environment for debugging
console.log('Test environment setup complete');
console.log('dotenv result:', result.parsed ? 'loaded' : 'not loaded');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Explicitly set DATABASE_URL if not defined
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'sqlite:./data/test.db';
  console.log('Set DATABASE_URL to:', process.env.DATABASE_URL);
}

// Seed the test database
try {
  seedStrategies().catch(err => console.error('Error seeding strategies:', err));
  seedDemoUser().catch(err => console.error('Error seeding demo user:', err));
} catch (err) {
  console.error('Error in test setup:', err);
}
