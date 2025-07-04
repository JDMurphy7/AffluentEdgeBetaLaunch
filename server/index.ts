import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { seedStrategies } from "./seed-strategies.js";
import { seedDemoUser } from "./seed-demo-user.js";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import { setupSocket } from "./realtime/socket.js";
import Sentry from "./monitoring/sentry.js";
import client, { httpRequestDuration } from "./monitoring/metrics.js";
import analyticsRouter from "./routes/analytics.js";
import helmet from "helmet";
import statusRouter from "./routes/status.js";
import { sendAlert } from "./services/alerting.js";
import { getAIAnalysisQueueStats } from "./ai-analysis-queue.js";
import { logIncident } from "./monitoring/incident-log.js";

const SLOW_REQUEST_THRESHOLD_MS = 500;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

// CSRF protection - disable in test environment
if (process.env.NODE_ENV !== 'test') {
  // Exclude certain API endpoints from CSRF protection for development and testing
  app.use((req, res, next) => {
    const publicEndpoints = [
      '/api/portfolio/snapshots',
      '/api/portfolio/metrics',
      '/api/auth/demo'
    ];
    
    // Skip CSRF for specific endpoints or for non-API endpoints during development
    if (publicEndpoints.includes(req.path) || process.env.NODE_ENV === 'development') {
      next();
    } else {
      csrf()(req, res, next);
    }
  });
  console.log('CSRF protection enabled with exceptions');
} else {
  console.log('CSRF protection disabled for tests');
}

// Security headers - use less strict settings in test environment
if (process.env.NODE_ENV !== 'test') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "cdn.jsdelivr.net"],
        connectSrc: ["'self'", "ws:", "wss:", "api.affluentedge.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        objectSrc: ["'none'"]
      }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xssFilter: true,
    noSniff: true
  }));
  console.log('Strict security headers enabled');
} else {
  app.use(helmet({
    contentSecurityPolicy: false,  // Disable CSP for tests
    xssFilter: true,
    noSniff: true
  }));
  console.log('Relaxed security headers for tests');
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
      if (duration > SLOW_REQUEST_THRESHOLD_MS) {
        log(`[PERF] Slow API request: ${req.method} ${path} took ${duration}ms`);
      }
    }
  });

  next();
});

// Example: Stream large trade dataset as JSON
app.get('/api/trades/export', async (req, res) => {
  // TODO: Replace with actual storage cursor/stream implementation
  // For demonstration, simulate streaming with a static array
  const trades = await (globalThis as any).storage?.getAllTrades?.() || [];
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  let first = true;
  for (const trade of trades) {
    if (!first) res.write(',');
    res.write(JSON.stringify(trade));
    first = false;
  }
  res.write(']');
  res.end();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

(async () => {
  // Seed database with demo data
  try {
    await seedStrategies();
    await seedDemoUser();
  } catch (error) {
    console.error("Error seeding database:", error);
    // Continue startup even if seeding fails
  }
  
  const server = await registerRoutes(app);

  // Register analytics API
  app.use("/api/analytics", analyticsRouter);
  // Public status page
  app.use("/status", statusRouter);

  // Setup Socket.io for real-time updates
  const { io, emitPortfolioUpdate } = setupSocket(server);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    Sentry.captureException(err, {
      extra: {
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        user: req.session?.betaUser || req.session?.adminUser || null,
      }
    });
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Automated health/queue alerting
  setInterval(async () => {
    try {
      // Check queue overload
      const queueStats = await getAIAnalysisQueueStats();
      if (queueStats.waiting > 100) {
        await sendAlert(
          "Queue Overload Alert",
          `AI analysis queue waiting jobs: ${queueStats.waiting}`
        );
      }
    } catch (err) {
      await sendAlert(
        "Health Check Failure",
        `Automated health/queue check failed: ${typeof err === 'object' && err && 'message' in err ? (err as any).message : String(err)}`
      );
      logIncident({ type: "health_check_failure", message: typeof err === 'object' && err && 'message' in err ? (err as any).message : String(err) });
    }
  }, 60 * 1000); // every 60 seconds
})();

// Add global error handler middleware at the end of the Express app setup
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Express error handler caught:", err);
  
  // Log the stack trace for debugging
  if (err.stack) {
    console.error("Error stack:", err.stack);
  }
  
  // Log request details that might be useful
  console.error("Request details:", {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Send appropriate response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

export { app };
