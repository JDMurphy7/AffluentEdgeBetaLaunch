import express from "express";
import client from "../monitoring/metrics.js";
import { getAIAnalysisQueueStats } from "../ai-analysis-queue.js";
import { getRecentIncidents } from "../monitoring/incident-log.js";

const router = express.Router();

router.get("/", async (req, res) => {
  // Public status: uptime, queue, and basic health
  const queueStats = await getAIAnalysisQueueStats();
  const apiUptime = process.uptime();
  res.json({
    status: "ok",
    uptime: apiUptime,
    queue: queueStats,
    timestamp: new Date().toISOString(),
  });
});

router.get("/html", async (req, res) => {
  const queueStats = await getAIAnalysisQueueStats();
  const apiUptime = process.uptime();
  const incidents = getRecentIncidents(10);
  const hasDowntime = incidents.some(
    (i) => i.type === "downtime" || i.type === "health_check_failure"
  );
  const statusText = hasDowntime
    ? "Issues Detected"
    : "All Systems Operational";
  const statusColor = hasDowntime ? "#f39c12" : "#27ae60";
  const uptimeHistory = incidents.map((i) =>
    i.type === "downtime" || i.type === "health_check_failure" ? 0 : 1
  );
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html lang='en'>
    <head>
      <title>AffluentEdge Status</title>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <style>
        body { font-family: system-ui, sans-serif; background: #181818; color: #fff; margin: 0; padding: 2em; }
        .status-badge { display: inline-block; padding: 0.5em 1em; border-radius: 999px; background: ${statusColor}; color: #fff; font-weight: bold; margin-bottom: 1em; }
        .uptime-graph { display: flex; gap: 2px; margin-bottom: 1em; }
        .uptime-bar { width: 20px; height: 20px; border-radius: 4px; }
        .incident-list { list-style: none; padding: 0; margin: 0; }
        .incident-list li { border-bottom: 1px solid #333; padding: 0.5em 0; }
        .incident-type { font-weight: bold; text-transform: capitalize; }
        .incident-type.alert { color: #f1c40f; }
        .incident-type.downtime, .incident-type.health_check_failure { color: #e74c3c; }
        .incident-type.info { color: #3498db; }
        @media (max-width: 600px) {
          body { padding: 0.5em; }
          .uptime-bar { width: 12px; height: 12px; }
        }
        button.refresh { background: #222; color: #fff; border: 1px solid #444; border-radius: 6px; padding: 0.5em 1em; cursor: pointer; margin-bottom: 1em; }
        button.refresh:active { background: #333; }
      </style>
    </head>
    <body>
      <h1>AffluentEdge Status</h1>
      <div class="status-badge" aria-live="polite" aria-label="Current system status">${statusText}</div>
      <button class="refresh" onclick="window.location.reload()" aria-label="Refresh status">Refresh</button>
      <p>Uptime: <b>${Math.floor(apiUptime)} seconds</b></p>
      <pre style='background:#222;padding:1em;border-radius:8px;overflow-x:auto;'>${JSON.stringify(queueStats, null, 2)}</pre>
      <h2>Uptime (last 10 checks)</h2>
      <div class='uptime-graph' aria-label='Uptime history'>${uptimeHistory
        .map(
          (v) =>
            `<div class='uptime-bar' style='background:${v ? "#27ae60" : "#e74c3c"};' title='${v ? "Up" : "Down"}'></div>`
        )
        .join("")}</div>
      <h2>Recent Incidents</h2>
      <ul class='incident-list'>${incidents
        .map(
          (i) =>
            `<li><span class='incident-type ${i.type}'>${i.type.replace(
              /_/g,
              " "
            )}</span> <span style='color:#aaa'>[${
              i.timestamp
            }](${i.timestamp}): ${i.message}</li>`
        )
        .join("")}</ul>
      <p><small>Last updated: ${new Date().toISOString()}</small></p>
    </body></html>
  `);
});

export default router;
