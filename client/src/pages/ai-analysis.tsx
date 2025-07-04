import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Badge } from "../components/ui/badge.js";
import { Progress } from "../components/ui/progress.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { Link } from "wouter";
import { Trade, StrategyPerformance } from "../lib/types.js";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

export default function AIAnalysis() {
  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: [`/api/trades/1`],
  });

  const { data: strategies, isLoading: strategiesLoading } = useQuery<StrategyPerformance[]>({
    queryKey: [`/api/strategies/1/performance`],
  });

  const analyzedTrades = trades?.filter(trade => trade.aiGrade && trade.aiAnalysis) || [];
  
  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-gold";
    if (grade.startsWith("B")) return "text-bronze";
    if (grade.startsWith("C")) return "text-blue-400";
    if (grade.startsWith("D")) return "text-orange-400";
    return "text-red-400";
  };

  const getGradeBackground = (grade: string) => {
    if (grade.startsWith("A")) return "bg-gold/20 border-gold/30";
    if (grade.startsWith("B")) return "bg-bronze/20 border-bronze/30";
    if (grade.startsWith("C")) return "bg-blue-500/20 border-blue-500/30";
    if (grade.startsWith("D")) return "bg-orange-500/20 border-orange-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const gradeDistribution = analyzedTrades.reduce((acc, trade) => {
    const grade = trade.aiGrade?.charAt(0) || 'F';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageStrategyAdherence = analyzedTrades.length > 0 
    ? analyzedTrades.reduce((sum, trade) => sum + (trade.strategyAdherence || 0), 0) / analyzedTrades.length 
    : 0;

  const commonWeaknesses = analyzedTrades
    .flatMap(trade => trade.aiAnalysis?.weaknesses || [])
    .reduce((acc, weakness) => {
      acc[weakness] = (acc[weakness] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topWeaknesses = Object.entries(commonWeaknesses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const commonStrengths = analyzedTrades
    .flatMap(trade => trade.aiAnalysis?.strengths || [])
    .reduce((acc, strength) => {
      acc[strength] = (acc[strength] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topStrengths = Object.entries(commonStrengths)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

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
            AI Analysis • {analyzedTrades.length} Analyzed Trades
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Trading Analysis</h1>
          <p className="text-white/70 text-lg">Comprehensive insights powered by advanced AI models</p>
        </div>

        {tradesLoading || strategiesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : analyzedTrades.length === 0 ? (
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-brain text-gold text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No AI Analysis Available</h3>
              <p className="text-white/60 mb-6">Add trades to get AI-powered insights and performance analysis</p>
              <Link href="/dashboard">
                <Button className="bg-gold text-charcoal hover:bg-gold/90">
                  <i className="fas fa-plus mr-2"></i>
                  Add Trades for Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-morphism border border-white/10 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                Performance Overview
              </TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                Trading Patterns
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
                AI Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Grade Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-graduation-cap text-gold mr-2"></i>
                      Grade Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['A', 'B', 'C', 'D', 'F'].map(grade => {
                        const count = gradeDistribution[grade] || 0;
                        const percentage = analyzedTrades.length > 0 ? (count / analyzedTrades.length) * 100 : 0;
                        return (
                          <div key={grade} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${getGradeBackground(grade)}`}>
                                <span className={getGradeColor(grade)}>{grade}</span>
                              </div>
                              <span className="text-white">{count} trades</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress value={percentage} className="w-20 h-2" />
                              <span className="text-white/60 text-sm w-12">{percentage.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-target text-bronze mr-2"></i>
                      Strategy Adherence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-bronze mb-2">
                        {averageStrategyAdherence.toFixed(0)}%
                      </div>
                      <p className="text-white/60 mb-4">Average Strategy Adherence</p>
                      <Progress value={averageStrategyAdherence} className="mb-4" />
                      <div className="text-sm text-white/70">
                        {averageStrategyAdherence >= 80 ? "Excellent discipline" :
                         averageStrategyAdherence >= 60 ? "Good consistency" :
                         "Needs improvement"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent AI Insights */}
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-lightbulb text-gold mr-2"></i>
                    Recent AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyzedTrades.slice(-3).reverse().map((trade) => (
                      <div key={trade.id} className="glass-morphism p-4 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-medium">{trade.symbol}</span>
                            <Badge className={getGradeBackground(trade.aiGrade!)}>
                              <span className={getGradeColor(trade.aiGrade!)}>{trade.aiGrade}</span>
                            </Badge>
                          </div>
                          <span className="text-white/60 text-sm">
                            {new Date(trade.entryTime).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mb-2">{trade.aiAnalysis?.strategyNotes}</p>
                        <div className="text-xs text-bronze">
                          Strategy Adherence: {trade.strategyAdherence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-thumbs-up text-green-400 mr-2"></i>
                      Your Trading Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topStrengths.map(([strength, count], index) => (
                        <div key={strength} className="flex items-center justify-between p-3 glass-morphism rounded-lg border border-white/5">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-white text-sm">{strength}</span>
                          </div>
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            {count} times
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="glass-morphism border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="fas fa-exclamation-triangle text-orange-400 mr-2"></i>
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topWeaknesses.map(([weakness, count], index) => (
                        <div key={weakness} className="flex items-center justify-between p-3 glass-morphism rounded-lg border border-white/5">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-white text-sm">{weakness}</span>
                          </div>
                          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                            {count} times
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-robot text-gold mr-2"></i>
                    AI-Powered Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Performance Improvement */}
                    <div className="glass-morphism p-6 rounded-lg border border-white/5">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <i className="fas fa-chart-line text-bronze mr-2"></i>
                        Performance Enhancement
                      </h3>
                      <p className="text-white/80 mb-4">
                        Based on your trading patterns, focus on improving position sizing and risk management. 
                        Your entry timing is excellent, but exits could be optimized for better risk-reward ratios.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-bronze/20 text-bronze border-bronze/30">Position Sizing</Badge>
                        <Badge className="bg-bronze/20 text-bronze border-bronze/30">Exit Strategy</Badge>
                        <Badge className="bg-bronze/20 text-bronze border-bronze/30">Risk Management</Badge>
                      </div>
                    </div>

                    {/* Strategy Optimization */}
                    <div className="glass-morphism p-6 rounded-lg border border-white/5">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <i className="fas fa-cog text-gold mr-2"></i>
                        Strategy Optimization
                      </h3>
                      <p className="text-white/80 mb-4">
                        Your trend following strategy shows strong results. Consider adding confluence factors 
                        and multiple timeframe analysis to increase win rate and reduce false signals.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gold/20 text-gold border-gold/30">Confluence Factors</Badge>
                        <Badge className="bg-gold/20 text-gold border-gold/30">Multi-Timeframe</Badge>
                        <Badge className="bg-gold/20 text-gold border-gold/30">Signal Quality</Badge>
                      </div>
                    </div>

                    {/* Psychological Insights */}
                    <div className="glass-morphism p-6 rounded-lg border border-white/5">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <i className="fas fa-brain text-blue-400 mr-2"></i>
                        Psychological Profile
                      </h3>
                      <p className="text-white/80 mb-4">
                        You show excellent discipline in following your trading plan. Minor tendency to hold 
                        losing positions slightly longer than optimal. Consider implementing stricter stop-loss rules.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Discipline</Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Stop Loss</Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Psychology</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}