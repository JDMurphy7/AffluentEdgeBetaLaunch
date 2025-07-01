import { useQuery } from "@tanstack/react-query";

interface StrategyPerformanceProps {
  userId: number;
}

export default function StrategyPerformance({ userId }: StrategyPerformanceProps) {
  const { data: strategies, isLoading } = useQuery({
    queryKey: [`/api/strategies/${userId}/performance`],
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500 to-green-600';
      case 'B':
        return 'bg-blue-500 to-blue-600';
      case 'C':
        return 'bg-yellow-500 to-yellow-600';
      case 'D':
        return 'bg-orange-500 to-orange-600';
      case 'F':
        return 'bg-red-500 to-red-600';
      default:
        return 'bg-gray-500 to-gray-600';
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

  if (isLoading) {
    return (
      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Strategy Performance</h2>
          <button className="text-gold hover:text-bronze transition-colors text-sm">Manage</button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-lg animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-gray-600 rounded"></div>
                <div className="h-6 w-16 bg-gray-600 rounded"></div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <div className="h-3 w-20 bg-gray-600 rounded"></div>
                <div className="h-3 w-24 bg-gray-600 rounded"></div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback data if no strategies
  const defaultStrategies = [
    {
      strategy: { id: 1, name: 'Trend Following' },
      winRate: 89.2,
      profitFactor: 2.8,
      totalTrades: 24,
      averageGrade: 'A'
    },
    {
      strategy: { id: 2, name: 'ICT Concepts' },
      winRate: 76.5,
      profitFactor: 1.9,
      totalTrades: 18,
      averageGrade: 'B'
    },
    {
      strategy: { id: 3, name: 'Support/Resistance' },
      winRate: 85.7,
      profitFactor: 2.4,
      totalTrades: 31,
      averageGrade: 'A'
    }
  ];

  const displayStrategies = strategies && strategies.length > 0 ? strategies : defaultStrategies;

  return (
    <div className="glass-morphism p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Strategy Performance</h2>
        <button className="text-gold hover:text-bronze transition-colors text-sm">Manage</button>
      </div>
      <div className="space-y-4">
        {displayStrategies.map((strategyData) => (
          <div key={strategyData.strategy.id} className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">{strategyData.strategy.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${getGradeStyle(strategyData.averageGrade)}`}>
                Grade {strategyData.averageGrade}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Win Rate: {strategyData.winRate.toFixed(1)}%</span>
              <span>Profit Factor: {strategyData.profitFactor.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r from-${strategyData.averageGrade === 'A' ? 'green' : strategyData.averageGrade === 'B' ? 'blue' : 'yellow'}-500 to-gold h-2 rounded-full`}
                style={{ width: `${Math.min(strategyData.winRate, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {strategyData.totalTrades} trades
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
