import { Router } from "express";
import client from "../../monitoring/metrics.js";
import { getAIAnalysisQueueStats } from "../../ai-analysis-queue.js";
import { getHttpRequestDurationSummary } from "../../monitoring/metrics.js";
import { sendAlert, setAlertConfig, getAlertConfig } from "../../services/alerting.js";
import { getRecentIncidents } from "../../monitoring/incident-log.js";

const router = Router();

router.get("/health", async (req, res, next) => {
  try {
    // Example: API health, queue stats, and custom metrics
    const queueStats = await getAIAnalysisQueueStats();
    const apiLatency = await getHttpRequestDurationSummary();
    res.json({
      status: 'ok',
      queue: queueStats,
      apiLatency,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

router.get("/errors", async (req, res, next) => {
  try {
    // Sentry does not provide direct error listing via API for security reasons.
    // Instead, expose a flag if SENTRY_DSN is set and link to Sentry dashboard.
    res.json({
      sentryEnabled: !!process.env.SENTRY_DSN,
      sentryDashboard: process.env.SENTRY_DSN ? "https://sentry.io/organizations/YOUR_ORG/projects/" : null
    });
  } catch (err) {
    next(err);
  }
});

router.get("/system", async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    const uptime = process.uptime();
    // DB connection count placeholder (implement real check if using pool)
    const dbConnections = 1;
    res.json({
      memory,
      cpu,
      uptime,
      dbConnections,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Alerting configuration and testing endpoints
router.post("/alerting/config", (req, res) => {
  setAlertConfig(req.body);
  res.json({ success: true });
});

router.get("/alerting/config", (req, res) => {
  res.json(getAlertConfig());
});

// Example: Alert on queue overload
router.post("/alerting/test", async (req, res) => {
  await sendAlert("Test Alert", "This is a test alert from AffluentEdge.");
  res.json({ success: true });
});

router.get("/incidents", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json(getRecentIncidents(limit));
});

export default router;
