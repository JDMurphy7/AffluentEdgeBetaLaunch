# AffluentEdge Test Suite

## Overview
This directory contains the comprehensive automated test suite for the AffluentEdge trading journal application. It covers unit, integration, performance, end-to-end, and monitoring tests for all critical systems, including the new AI agent optimization system.

## Structure
- `unit/` - Unit tests for agents, services, and utilities
- `integration/` - Integration tests for API endpoints, auth, trade lifecycle, and agent integration
- `performance/` - Performance and load tests (cache, response times, memory)
- `e2e/` - End-to-end user flow tests (registration, trade creation, dashboard, admin)
- `monitoring/` - Health checks, error handling, and fallback system tests

## Running Tests

### Prerequisites
- Install dependencies:
  ```sh
  npm install
  npm install --save-dev jest ts-jest supertest @types/jest @types/supertest playwright k6 dotenv jest-html-reporter
  ```
- Configure environment variables for local and production testing as needed.

### Test Commands
- Run all tests:
  ```sh
  npm run test:all
  ```
- Run unit tests:
  ```sh
  npm run test:unit
  ```
- Run integration tests:
  ```sh
  npm run test:integration
  ```
- Run E2E tests:
  ```sh
  npm run test:e2e
  ```
- Run performance tests:
  ```sh
  npm run test:performance
  ```
- Generate HTML report:
  ```sh
  npm run test:report
  ```

## Test Data Management
- Test data is seeded and cleaned up using setup/teardown hooks in each suite.
- E2E tests use Playwright fixtures for user and trade creation.

## Test Database Setup

The test database is a SQLite database located at `data/test.db`. It is used for integration tests to ensure that the application works correctly with a real database.

### Schema

The test database schema is defined in `tests/setup-sql-test-db.ts`. This file creates tables with column names that match the Drizzle ORM schema defined in `shared/schema.ts`.

Important note: The Drizzle ORM uses snake_case for column names in the database, but camelCase for JavaScript property names. For example, `userId` in JavaScript corresponds to `user_id` in the database.

### Tables

The main tables in the test database are:

1. `users` - User accounts
2. `strategies` - Trading strategies
3. `trades` - Trading history
4. `portfolio_snapshots` - Historical portfolio performance

### Test Data

The test database includes a demo user with the following credentials:
- Email: demo@affluentedge.com
- Password: demo123

### Recreating the Test Database

To recreate the test database from scratch, you can run:

```bash
rm -f data/test.db && npx tsx tests/setup-sql-test-db.ts
```

### Running Tests with the Test Database

Integration tests that use the test database should set the `NODE_ENV` environment variable to 'test':

```bash
NODE_ENV=test npx vitest run tests/integration/broker-import.test.ts
```

## Performance Benchmarks
- Performance tests measure cache hit rates, response times, and memory usage.
- Compare results to baseline metrics after each deployment.

## Expected Results
- 100% backward compatibility
- Verified performance improvements (cache hit rates, response times)
- Comprehensive error handling and graceful degradation
- Security and data integrity maintained
- Production stability (live app continues to function)

## Notes
- Tests can be run against both local and production environments.
- Update environment variables and endpoints as needed for each environment.
- Review test output and reports for pass/fail status and performance metrics.

---

For questions or issues, contact the AffluentEdge development team.
