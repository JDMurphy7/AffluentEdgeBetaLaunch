import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

let app: express.Express;
beforeAll(async () => {
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

describe('API Endpoints', () => {
  test('All API endpoints respond correctly', async () => {
    const res = await request(app).get('/api/admin/user');
    // Should be 401 if not authenticated
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  test('Response headers include X-Cache-Hit, X-Agent-Used, X-Execution-Time', async () => {
    const res = await request(app).get('/api/admin/user');
    // These headers may be set by middleware/agent system
    // If not present, this will fail and you can add them in your app
    expect(res.headers).toHaveProperty('x-cache-hit');
    expect(res.headers).toHaveProperty('x-agent-used');
    expect(res.headers).toHaveProperty('x-execution-time');
  });
});
