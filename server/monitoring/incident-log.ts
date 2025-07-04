import fs from "fs";
import path from "path";

const INCIDENT_LOG_PATH = path.join(process.cwd(), "logs", "incidents.log");

export function logIncident(event: { type: string; message: string; timestamp?: string }) {
  const entry = {
    timestamp: event.timestamp || new Date().toISOString(),
    type: event.type,
    message: event.message,
  };
  fs.mkdirSync(path.dirname(INCIDENT_LOG_PATH), { recursive: true });
  fs.appendFileSync(INCIDENT_LOG_PATH, JSON.stringify(entry) + "\n");
}

export function getRecentIncidents(limit = 10): any[] {
  if (!fs.existsSync(INCIDENT_LOG_PATH)) return [];
  const lines = fs.readFileSync(INCIDENT_LOG_PATH, "utf-8").trim().split("\n");
  return lines.slice(-limit).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}
