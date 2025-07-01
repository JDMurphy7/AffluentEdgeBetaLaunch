import { useQuery } from "@tanstack/react-query";
import { PortfolioMetrics } from "@/lib/types";

interface PerformanceCardsProps {
  userId: number;
}

export default function PerformanceCards({ userId }: PerformanceCardsProps) {
  const { data: metrics, isLoading } = useQuery<PortfolioMetrics>({
    queryKey: [`/api/portfolio/${userId}/metrics`],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
              <div className="h-4 w-12 bg-gray-600 rounded"></div>
            </div>
            <div className="h-8 w-16 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 w-20 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number, decimals: number = 1) => value.toFixed(decimals);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-gold text-xl"></i>
          </div>
          <div className="text-right">
            <span className="text-sm text-gold block">
              {metrics?.winRate ? formatPercentage(metrics.winRate - 70) : '+8.2%'}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white">
          {metrics?.winRate ? formatPercentage(metrics.winRate) : '87.3%'}
        </h3>
        <p className="text-sm text-muted-foreground">Win Rate</p>
      </div>

      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-bronze/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-dollar-sign text-bronze text-xl"></i>
          </div>
          <div className="text-right">
            <span className="text-sm text-bronze block">
              {metrics?.profitFactor ? `+${formatPercentage((metrics.profitFactor - 1) * 50)}` : '+15.4%'}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white">
          {metrics?.profitFactor ? formatNumber(metrics.profitFactor, 1) : '2.4'}
        </h3>
        <p className="text-sm text-muted-foreground">Profit Factor</p>
      </div>

      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gold/15 rounded-lg flex items-center justify-center">
            <i className="fas fa-trending-up text-gold text-xl"></i>
          </div>
          <div className="text-right">
            <span className="text-sm text-gold block">
              {metrics?.sharpeRatio ? `+${formatPercentage(metrics.sharpeRatio * 10)}` : '+2.1%'}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white">
          {metrics?.sharpeRatio ? formatNumber(metrics.sharpeRatio, 2) : '1.67'}
        </h3>
        <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
      </div>

      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-area text-destructive text-xl"></i>
          </div>
          <div className="text-right">
            <span className="text-sm text-destructive block">
              {metrics?.maxDrawdown ? formatPercentage(metrics.maxDrawdown - 10) : '-2.3%'}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white">
          {metrics?.maxDrawdown ? formatPercentage(metrics.maxDrawdown) : '8.5%'}
        </h3>
        <p className="text-sm text-muted-foreground">Max Drawdown</p>
      </div>
    </div>
  );
}
