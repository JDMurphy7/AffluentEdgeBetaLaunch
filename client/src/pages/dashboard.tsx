import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import PerformanceCards from "@/components/dashboard/performance-cards";
import EquityChart from "@/components/dashboard/equity-chart";
import RecentTrades from "@/components/dashboard/recent-trades";
import StrategyPerformance from "@/components/dashboard/strategy-performance";
import TradeInput from "@/components/dashboard/trade-input";
import AIAnalysis from "@/components/dashboard/ai-analysis";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedUserId] = useState(user?.id || 1); // Use actual user ID or demo ID
  const isDemoMode = !user;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar userId={selectedUserId} />
        <main className="flex-1 ml-64 p-6 space-y-6">
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <div className="bg-gradient-to-r from-gold/20 to-bronze/20 border border-gold/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-gold" />
                  <div>
                    <h3 className="text-white font-semibold">Experience Elite Trading</h3>
                    <p className="text-white/70 text-sm">
                      Discover the full power of AffluentEdge's intelligent trading platform
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link href="/auth">
                    <Button 
                      className="bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90"
                    >
                      Join the Elite
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="text-white hover:text-gold">
                      Explore Landing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient-gold mb-2">
                Elite Command Center
              </h1>
              <p className="text-muted-foreground">
                Master your trading discipline across all markets • Intelligence-driven performance optimization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="glass-morphism px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                <i className="fas fa-download mr-2"></i>Export
              </button>
              <button className="gradient-gold text-black px-4 py-2 rounded-lg hover:shadow-lg transition-all font-medium">
                <i className="fas fa-plus mr-2"></i>Log Position
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
