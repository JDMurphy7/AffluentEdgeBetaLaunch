# AffluentEdge Trading Journal Platform

## Overview
AffluentEdge is a premium AI-powered trading journal and analytics suite for professional and aspiring traders. It features advanced analytics, real-time updates, broker integrations, robust monitoring, and a modern PWA/mobile-optimized UI.

## Key Features
- **AI Analytics**: Sharpe ratio, drawdown, expectancy, rolling returns, volatility, benchmark comparison
- **Broker Import**: CSV, MetaTrader, Interactive Brokers (Flex Query XML)
- **Real-Time Updates**: Socket.io for live portfolio and trade updates
- **Background Jobs**: BullMQ for AI analysis queue with monitoring
- **Security**: Redis-backed sessions, CSRF, rate limiting, secure cookies, Helmet, audit logging
- **Monitoring**: Prometheus metrics, Sentry error tracking, health endpoints, admin dashboard, public status page
- **PWA/Mobile**: Installable, offline support, responsive UI
- **Performance**: DB indexes, slow request logging, profiling hooks

## Quick Start
1. Clone the repo and install dependencies:
   ```
   git clone <repo-url>
   cd AffluentEdgeBetaLaunch
   npm install
   ```
2. Set up your `.env` with DB, Redis, and Sentry credentials.
3. Generate test data (for portfolio charts, etc.):
   ```
   npx tsx scripts/create-portfolio-snapshot.ts
   ```
4. Start the server:
   ```
   npm run dev
   ```
5. Access the app at `http://localhost:5000`

## Documentation
- [Beta Launch Fixes](./docs/BETA_LAUNCH_FIXES.md) - Database and endpoint fixes
- [Equity Chart Integration](./docs/EQUITY_CHART_FIXES.md) - Portfolio chart data integration
- [Equity Chart Enhancements](./docs/EQUITY_CHART_ENHANCEMENTS.md) - Advanced features and optimizations
- [Test Setup](./tests/README.md) - Setting up and running tests

## Broker Data Import
- POST `/api/v1/import` with `{ broker: 'csv'|'metatrader'|'interactivebrokers', credentials: { csvData|xmlData } }`
- See `server/integrations/` for format details.

## Monitoring & Health
- `/api/v1/monitoring/health` — API, queue, latency
- `/api/v1/monitoring/system` — Memory, CPU, uptime, DB connections
- `/api/v1/monitoring/errors` — Sentry status
- `/status` — Public status page
- Admin dashboard: `/admin/monitoring`

## Testing
- Run all tests: `npm test`
- Run unit tests: `npm run test:unit -- --config jest.config.cjs`
- See `tests/unit/broker-importers.test.ts` for broker import tests

## Documentation
- See code comments and `server/routes/` for API details
- For onboarding, see `README.md` and `/client/` for UI structure

## Contributing
- PRs welcome! Please add tests for new features and update docs as needed.

---
For more, see the admin dashboard and in-app help. For support, contact the AffluentEdge team.
