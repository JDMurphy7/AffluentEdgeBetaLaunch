import fs from "fs";
import path from "path";

const AUDIT_LOG_PATH = path.join(process.cwd(), "logs", "audit.log");

export function logAuditEvent(event: {
  action: string;
  userId?: number;
  email?: string;
  ip?: string;
  details?: any;
}) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...event
  };
  fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
  fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(entry) + "\n");
}
