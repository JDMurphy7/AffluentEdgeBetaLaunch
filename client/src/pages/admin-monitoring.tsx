import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.js";
import { Button } from "../components/ui/button.js";

export default function AdminMonitoring() {
  const [data, setData] = useState<any>(null);
  const [system, setSystem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const [alertEmail, setAlertEmail] = useState("");
  const [alertWebhook, setAlertWebhook] = useState("");
  const [alertSaveMsg, setAlertSaveMsg] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [testingAlert, setTestingAlert] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/monitoring/health");
      if (!res.ok) throw new Error("Failed to fetch monitoring data");
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystem = async () => {
    try {
      const res = await fetch("/api/v1/monitoring/system");
      if (!res.ok) throw new Error("Failed to fetch system metrics");
      setSystem(await res.json());
    } catch (err) {
      setSystem(null);
    }
  };

  const fetchErrorInfo = async () => {
    try {
      const res = await fetch("/api/v1/monitoring/errors");
      if (!res.ok) throw new Error("Failed to fetch error info");
      setErrorInfo(await res.json());
    } catch (err) {
      setErrorInfo({ sentryEnabled: false });
    }
  };

  const fetchAlertConfig = async () => {
    const res = await fetch("/api/v1/monitoring/alerting/config");
    const data = await res.json();
    setAlertConfig(data);
    setAlertEmail(data.email || "");
    setAlertWebhook(data.webhookUrl || "");
  };

  const saveAlertConfig = async (e: any) => {
    e.preventDefault();
    setAlertSaveMsg(null);
    setAlertError(null);
    try {
      const res = await fetch("/api/v1/monitoring/alerting/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: alertEmail, webhookUrl: alertWebhook })
      });
      if (res.ok) {
        setAlertSaveMsg("Saved!");
        fetchAlertConfig();
      } else {
        setAlertError("Failed to save alert config");
      }
    } catch (err: any) {
      setAlertError(err.message || "Failed to save alert config");
    }
  };

  const testAlert = async () => {
    setTestingAlert(true);
    setAlertError(null);
    setAlertSaveMsg(null);
    try {
      const res = await fetch("/api/v1/monitoring/alerting/test", { method: "POST" });
      if (res.ok) {
        setAlertSaveMsg("Test alert sent!");
      } else {
        setAlertError("Test alert failed");
      }
    } catch (err: any) {
      setAlertError(err.message || "Test alert failed");
    }
    setTestingAlert(false);
  };

  const fetchIncidents = async () => {
    const res = await fetch("/api/v1/monitoring/incidents?limit=10");
    setIncidents(await res.json());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSystem();
  }, []);

  useEffect(() => {
    fetchErrorInfo();
  }, []);

  useEffect(() => {
    fetchAlertConfig();
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-charcoal p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">System Monitoring</h1>
        <Button onClick={fetchData} disabled={loading} className="mb-4">
          Refresh
        </Button>
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {data ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white">Status: <span className={data.status === 'ok' ? 'text-green-400' : 'text-red-400'}>{data.status}</span></div>
                <div className="text-white/70 text-sm">Timestamp: {data.timestamp}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Queue Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-white/80 text-sm bg-black/30 rounded p-2 overflow-x-auto">{JSON.stringify(data.queue, null, 2)}</pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>API Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-white/80 text-sm bg-black/30 rounded p-2 overflow-x-auto">{JSON.stringify(data.apiLatency, null, 2)}</pre>
              </CardContent>
            </Card>
            {errorInfo && errorInfo.sentryEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Error Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white">Sentry is <span className="text-green-400">enabled</span>.</div>
                  <a href={errorInfo.sentryDashboard} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">View Sentry Dashboard</a>
                </CardContent>
              </Card>
            )}
            {system && (
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white/80 text-sm">
                    <div>Memory: RSS {(system.memory.rss / 1024 / 1024).toFixed(1)} MB</div>
                    <div>Heap Used: {(system.memory.heapUsed / 1024 / 1024).toFixed(1)} MB</div>
                    <div>CPU User: {(system.cpu.user / 1000).toFixed(1)} ms</div>
                    <div>Uptime: {Math.floor(system.uptime)}s</div>
                    <div>DB Connections: {system.dbConnections}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Alerting</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveAlertConfig} className="space-y-2">
                  <div>
                    <label className="text-white/80 text-sm">Alert Email</label>
                    <input type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} className="block w-full bg-black/30 text-white rounded p-2 mt-1" placeholder="alerts@example.com" />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm">Webhook URL</label>
                    <input type="url" value={alertWebhook} onChange={e => setAlertWebhook(e.target.value)} className="block w-full bg-black/30 text-white rounded p-2 mt-1" placeholder="https://hooks.example.com/alert" />
                  </div>
                  <Button type="submit" disabled={testingAlert}>{testingAlert ? "Saving..." : "Save Alert Config"}</Button>
                  <Button type="button" onClick={testAlert} disabled={testingAlert} className="ml-2">{testingAlert ? "Testing..." : "Test Alert"}</Button>
                  {alertSaveMsg && <span className="ml-4 text-green-400">{alertSaveMsg}</span>}
                  {alertError && <span className="ml-4 text-red-400">{alertError}</span>}
                </form>
                {alertConfig && (
                  <div className="mt-2 text-white/70 text-xs">
                    <div>Current Email: {alertConfig.email || <span className="text-red-400">Not set</span>}</div>
                    <div>Current Webhook: {alertConfig.webhookUrl || <span className="text-red-400">Not set</span>}</div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts & Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-white/80 text-xs space-y-1 max-h-40 overflow-y-auto">
                  {incidents.length === 0 && <li>No recent incidents.</li>}
                  {incidents.map((i, idx) => (
                    <li key={idx} className={`border-b border-white/10 pb-1 flex items-center gap-2`}>
                      <span className={`inline-block w-2 h-2 rounded-full ${i.type === 'alert' ? 'bg-yellow-400' : i.type === 'health_check_failure' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                      <span className="text-white/60">[{i.timestamp}]</span> <span className="font-bold capitalize">{i.type.replace(/_/g, ' ')}</span>: {i.message}
                    </li>
                  ))}
                </ul>
                <Button onClick={fetchIncidents} className="mt-2">Refresh Incidents</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Alerting (Coming Soon)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/80 text-sm">Configure email/webhook alerts for downtime, queue overload, or errors.</div>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          <div className="text-white/70">Loading...</div>
        ) : null}
      </div>
    </div>
  );
}
