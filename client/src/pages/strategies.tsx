import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Badge } from "../components/ui/badge.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Progress } from "../components/ui/progress.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Link } from "wouter";
import { Strategy, StrategyPerformance } from "../lib/types.js";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

export default function Strategies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: strategies, isLoading: strategiesLoading } = useQuery<Strategy[]>({
    queryKey: [`/api/strategies`],
  });

  const { data: performance, isLoading: performanceLoading } = useQuery<StrategyPerformance[]>({
    queryKey: [`/api/strategies/1/performance`],
  });

  const filteredStrategies = (strategies || []).filter((strategy) => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || strategy.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const builtInStrategies = filteredStrategies.filter(s => s.isBuiltIn);
  const customStrategies = filteredStrategies.filter(s => !s.isBuiltIn);

  const getPerformanceForStrategy = (strategyId: number) => {
    return performance?.find(p => p.strategy.id === strategyId);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "trend following": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "scalping": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "swing trading": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "day trading": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "mean reversion": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-gold";
    if (grade.startsWith("B")) return "text-bronze";
    if (grade.startsWith("C")) return "text-blue-400";
    return "text-gray-400";
  };

  const categories = Array.from(new Set(strategies?.map(s => s.category) || []));

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Navigation */}
      <nav className="glass-morphism border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-gold transition-colors">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <img src={affluentEdgeLogo} alt="AffluentEdge" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">AffluentEdge</span>
            </div>
          </div>
          <div className="text-white/60 text-sm">
            Trading Strategies • {filteredStrategies.length} Available
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trading Strategies</h1>
          <p className="text-white/70 text-lg">Manage and analyze your trading strategies with AI-powered insights</p>
        </div>

        {/* Filters */}
        <Card className="glass-morphism border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                />
              </div>
              <div>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg focus:border-gold"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <Button className="w-full bg-gold text-charcoal hover:bg-gold/90">
                  <i className="fas fa-plus mr-2"></i>
                  Create Strategy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {strategiesLoading || performanceLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="built-in" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-morphism border border-white/10 mb-6">
              <TabsTrigger value="built-in" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                Built-in Strategies ({builtInStrategies.length})
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                Custom Strategies ({customStrategies.length})
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                Performance Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="built-in" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {builtInStrategies.map((strategy) => {
                  const strategyPerf = getPerformanceForStrategy(strategy.id);
                  return (
                    <Card key={strategy.id} className="glass-morphism border-white/10 hover:border-gold/30 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white flex items-center">
                            <i className="fas fa-star text-gold mr-2"></i>
                            {strategy.name}
                          </CardTitle>
                          <Badge className={getCategoryColor(strategy.category)}>
                            {strategy.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70 mb-4 text-sm">
                          {strategy.description}
                        </p>

                        {strategyPerf && (
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">
                                {strategyPerf.winRate.toFixed(1)}%
                              </div>
                              <div className="text-white/60 text-xs">Win Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">
                                {strategyPerf.profitFactor.toFixed(2)}
                              </div>
                              <div className="text-white/60 text-xs">Profit Factor</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getGradeColor(strategyPerf.averageGrade)}`}>
                                {strategyPerf.averageGrade}
                              </div>
                              <div className="text-white/60 text-xs">Avg Grade</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">
                            {strategyPerf ? `${strategyPerf.totalTrades} trades` : 'No trades yet'}
                          </span>
                          <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              {customStrategies.length === 0 ? (
                <Card className="glass-morphism border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-plus text-gold text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Custom Strategies</h3>
                    <p className="text-white/60 mb-6">Create your own trading strategies with custom rules and parameters</p>
                    <Button className="bg-gold text-charcoal hover:bg-gold/90">
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Strategy
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {customStrategies.map((strategy) => {
                    const strategyPerf = getPerformanceForStrategy(strategy.id);
                    return (
                      <Card key={strategy.id} className="glass-morphism border-white/10 hover:border-gold/30 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center">
                              <i className="fas fa-user text-bronze mr-2"></i>
                              {strategy.name}
                            </CardTitle>
                            <Badge className={getCategoryColor(strategy.category)}>
                              {strategy.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/70 mb-4 text-sm">
                            {strategy.description}
                          </p>

                          {strategyPerf && (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">
                                  {strategyPerf.winRate.toFixed(1)}%
                                </div>
                                <div className="text-white/60 text-xs">Win Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">
                                  {strategyPerf.profitFactor.toFixed(2)}
                                </div>
                                <div className="text-white/60 text-xs">Profit Factor</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getGradeColor(strategyPerf.averageGrade)}`}>
                                  {strategyPerf.averageGrade}
                                </div>
                                <div className="text-white/60 text-xs">Avg Grade</div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">
                              {strategyPerf ? `${strategyPerf.totalTrades} trades` : 'No trades yet'}
                            </span>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="border-bronze/30 text-bronze hover:bg-bronze/10">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {!performance || performance.length === 0 ? (
                <Card className="glass-morphism border-white/10">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-chart-bar text-gold text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Performance Data</h3>
                    <p className="text-white/60 mb-6">Add trades using your strategies to see performance analysis</p>
                    <Link href="/dashboard">
                      <Button className="bg-gold text-charcoal hover:bg-gold/90">
                        <i className="fas fa-plus mr-2"></i>
                        Add Trades
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Strategy Leaderboard */}
                  <Card className="glass-morphism border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <i className="fas fa-trophy text-gold mr-2"></i>
                        Strategy Performance Ranking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {performance
                          .sort((a, b) => b.profitFactor - a.profitFactor)
                          .map((perf, index) => (
                            <div key={perf.strategy.id} className="flex items-center space-x-4 p-4 glass-morphism rounded-lg border border-white/5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                index === 0 ? 'bg-gold text-charcoal' :
                                index === 1 ? 'bg-gray-400 text-charcoal' :
                                index === 2 ? 'bg-bronze text-charcoal' :
                                'bg-white/10 text-white'
                              }`}>
                                #{index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-semibold">{perf.strategy.name}</div>
                                <div className="text-white/60 text-sm">{perf.strategy.category}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-white font-medium">{perf.winRate.toFixed(1)}%</div>
                                  <div className="text-white/60 text-xs">Win Rate</div>
                                </div>
                                <div>
                                  <div className="text-white font-medium">{perf.profitFactor.toFixed(2)}</div>
                                  <div className="text-white/60 text-xs">Profit Factor</div>
                                </div>
                                <div>
                                  <div className={`font-medium ${getGradeColor(perf.averageGrade)}`}>
                                    {perf.averageGrade}
                                  </div>
                                  <div className="text-white/60 text-xs">Avg Grade</div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}