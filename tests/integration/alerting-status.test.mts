import request from "supertest";
import { app } from "../../server/index.js";

describe("Alerting & Status API", () => {
  it("should set and get alert config", async () => {
    const resSet = await request(app)
      .post("/api/v1/monitoring/alerting/config")
      .send({ email: "test@example.com", webhookUrl: "https://webhook.site/test" });
    expect(resSet.status).toBe(200);

    const resGet = await request(app)
      .get("/api/v1/monitoring/alerting/config");
    expect(resGet.body.email).toBe("test@example.com");
    expect(resGet.body.webhookUrl).toBe("https://webhook.site/test");
  });

  it("should trigger a test alert", async () => {
    const res = await request(app)
      .post("/api/v1/monitoring/alerting/test");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should fetch recent incidents", async () => {
    const res = await request(app)
      .get("/api/v1/monitoring/incidents");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fetch public status JSON", async () => {
    const res = await request(app)
      .get("/status");
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });

  it("should fetch public status HTML", async () => {
    const res = await request(app)
      .get("/status/html");
    expect(res.status).toBe(200);
    expect(res.text).toContain("AffluentEdge Status");
  });
});
