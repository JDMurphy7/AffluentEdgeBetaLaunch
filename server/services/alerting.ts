import nodemailer from "nodemailer";
import fetch from "node-fetch";
import { logIncident } from "../monitoring/incident-log.js";

export type AlertConfig = {
  email?: string;
  webhookUrl?: string;
};

let alertConfig: AlertConfig = {};

export function setAlertConfig(config: AlertConfig) {
  alertConfig = config;
}

export function getAlertConfig() {
  return alertConfig;
}

export async function sendAlert(subject: string, message: string) {
  if (alertConfig.email) {
    // Example: send email (configure transport in production)
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail',
    });
    await transporter.sendMail({
      from: 'alerts@affluentedge.com',
      to: alertConfig.email,
      subject,
      text: message,
    });
  }
  if (alertConfig.webhookUrl) {
    await fetch(alertConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    });
  }
  // Log alert to incident log
  logIncident({ type: "alert", message: `${subject}: ${message}` });
}
