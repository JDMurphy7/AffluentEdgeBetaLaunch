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
