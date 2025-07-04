import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/analytics", userId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!userId,
  });

  if (!userId) return <div className="p-8 text-center text-gray-400">Please log in to view analytics.</div>;
  if (isLoading) return <div className="p-8 text-center">Loading analytics…</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading analytics.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gradient-gold text-center sm:text-left">Advanced Trading Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-morphism p-4 sm:p-6 rounded-xl flex flex-col items-center sm:items-start">
          <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Sharpe Ratio</h2>
          <div className="text-2xl sm:text-3xl font-bold text-gold">{data.sharpe?.toFixed(2)}</div>
        </div>
        <div className="glass-morphism p-4 sm:p-6 rounded-xl flex flex-col items-center sm:items-start">
          <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Win Rate</h2>
          <div className="text-2xl sm:text-3xl font-bold text-green-400">{(data.winRate * 100).toFixed(1)}%</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <div className="glass-morphism p-4 sm:p-6 rounded-xl">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Rolling Returns (10-trade window)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.rollingReturns?.map((v: number, i: number) => ({ x: i + 1, y: v }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#FFD700" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-morphism p-4 sm:p-6 rounded-xl">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Volatility</h2>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">{data.volatility?.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}
