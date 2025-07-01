import { useQuery } from "@tanstack/react-query";

interface RecentTradesProps {
  userId: number;
}

export default function RecentTrades({ userId }: RecentTradesProps) {
  const { data: trades, isLoading } = useQuery({
    queryKey: [`/api/trades/${userId}`],
  });

  const getAssetIcon = (assetClass: string, symbol: string) => {
    switch (assetClass) {
      case 'forex':
        return { icon: 'FX', color: 'bg-gold/20 text-gold' };
      case 'crypto':
        return { icon: 'BTC', color: 'bg-bronze/20 text-bronze' };
      case 'commodities':
        return { icon: 'GOLD', color: 'bg-gold/15 text-gold' };
      case 'stocks':
        return { icon: symbol.slice(0, 3), color: 'bg-bronze/15 text-bronze' };
      case 'indices':
        return { icon: 'IDX', color: 'bg-gold/10 text-gold' };
      default:
        return { icon: 'TRD', color: 'bg-muted text-muted-foreground' };
    }
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500/20 text-green-400';
      case 'B':
        return 'bg-blue-500/20 text-blue-400';
      case 'C':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'D':
        return 'bg-orange-500/20 text-orange-400';
      case 'F':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const tradeTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - tradeTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
          <button className="text-gold hover:text-bronze transition-colors text-sm">View All</button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
                <div className="h-3 w-32 bg-gray-600 rounded"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                <div className="h-3 w-8 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentTrades = trades?.slice(0, 5) || [];

  return (
    <div className="glass-morphism p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
        <button className="text-gold hover:text-bronze transition-colors text-sm">View All</button>
      </div>
      <div className="space-y-4">
        {recentTrades.length > 0 ? (
          recentTrades.map((trade) => {
            const assetInfo = getAssetIcon(trade.assetClass, trade.symbol);
            const pnl = parseFloat(trade.pnl || '0');
            const isProfitable = pnl > 0;
            
            return (
              <div key={trade.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                <div className={`w-10 h-10 ${assetInfo.color} rounded-lg flex items-center justify-center`}>
                  <span className="font-bold text-sm">{assetInfo.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{trade.symbol} {trade.direction === 'long' ? 'Long' : 'Short'}</h3>
                  <p className="text-sm text-gray-400">
                    {trade.status === 'closed' ? 'Closed' : 'Open'} • {formatTimeAgo(trade.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfitable ? '+' : ''}${Math.abs(pnl).toLocaleString()}
                  </p>
                  {trade.aiGrade && (
                    <span className={`text-xs px-2 py-1 rounded ${getGradeStyle(trade.aiGrade)}`}>
                      {trade.aiGrade}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <i className="fas fa-chart-line text-4xl mb-4 text-gold"></i>
            <p>No trades yet. Start by adding your first trade!</p>
          </div>
        )}
      </div>
    </div>
  );
}
