import client from "prom-client";
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
});
export async function getHttpRequestDurationSummary() {
  const metric = await httpRequestDuration.get();
  const values = metric.values || [];
  // Aggregate all values for a summary
  let count = 0, sum = 0;
  for (const v of values) {
    if (v.metricName === 'http_request_duration_seconds_count') count += v.value;
    if (v.metricName === 'http_request_duration_seconds_sum') sum += v.value;
  }
  return {
    count,
    sum,
    avg: count ? sum / count : 0
  };
}
export default client;
