import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import PerformanceCards from "@/components/dashboard/performance-cards";
import EquityChart from "@/components/dashboard/equity-chart";
import RecentTrades from "@/components/dashboard/recent-trades";
import StrategyPerformance from "@/components/dashboard/strategy-performance";
import TradeInput from "@/components/dashboard/trade-input";
import AIAnalysis from "@/components/dashboard/ai-analysis";

export default function Dashboard() {
  const [selectedUserId] = useState(1); // TODO: Get from auth context

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userId={selectedUserId} />
        <main className="flex-1 ml-64 p-6 space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-gold mb-2">
                Professional Trading Analytics
              </h1>
              <p className="text-muted-foreground">
                Elite discipline tracking for forex, crypto, commodities, stocks & indices • Strategy adherence over profit
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="glass-morphism px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <i className="fas fa-download mr-2"></i>Export
              </button>
              <button className="gradient-gold text-black px-4 py-2 rounded-lg hover:shadow-lg transition-all font-medium">
                <i className="fas fa-plus mr-2"></i>Add Trade
              </button>
            </div>
          </div>

          {/* Performance Overview Cards */}
          <PerformanceCards userId={selectedUserId} />

          {/* Equity Curve Chart */}
          <EquityChart userId={selectedUserId} />

          {/* Recent Trades & Strategy Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTrades userId={selectedUserId} />
            <StrategyPerformance userId={selectedUserId} />
          </div>

          {/* Trade Input Section */}
          <TradeInput userId={selectedUserId} />

          {/* AI Analysis Preview */}
          <AIAnalysis />
        </main>
      </div>
    </div>
  );
}
