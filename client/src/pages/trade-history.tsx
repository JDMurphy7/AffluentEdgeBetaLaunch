import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Badge } from "../components/ui/badge.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Link } from "wouter";
import { Trade } from "../lib/types.js";
import { format } from "date-fns";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

export default function TradeHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assetFilter, setAssetFilter] = useState<string>("all");

  const { data: trades, isLoading } = useQuery<Trade[]>({
    queryKey: [`/api/trades/1`], // Using demo user ID
  });

  const filteredTrades = (trades || []).filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || trade.status === statusFilter;
    const matchesAsset = assetFilter === "all" || trade.assetClass === assetFilter;
    return matchesSearch && matchesStatus && matchesAsset;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "closed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return "text-gray-400";
    if (grade.startsWith("A")) return "text-gold";
    if (grade.startsWith("B")) return "text-bronze";
    if (grade.startsWith("C")) return "text-blue-400";
    return "text-gray-400";
  };

  const getPnLColor = (pnl?: string) => {
    if (!pnl) return "text-gray-400";
    const value = parseFloat(pnl);
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

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
            Trade History • {filteredTrades.length} Trades
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trade History</h1>
          <p className="text-white/70 text-lg">Review your complete trading performance and analysis</p>
        </div>

        {/* Filters */}
        <Card className="glass-morphism border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search by symbol or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-white/20">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={assetFilter} onValueChange={setAssetFilter}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="All Assets" />
                  </SelectTrigger>
                  <SelectContent className="bg-charcoal border-white/20">
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="commodities">Commodities</SelectItem>
                    <SelectItem value="indices">Indices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button className="w-full bg-gold text-charcoal hover:bg-gold/90">
                  <i className="fas fa-download mr-2"></i>
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trades List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-600 rounded w-16"></div>
                  <div className="h-4 bg-gray-600 rounded w-24"></div>
                  <div className="h-4 bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-600 rounded w-16"></div>
                  <div className="h-4 bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrades.length === 0 ? (
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-gold text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Trades Found</h3>
              <p className="text-white/60 mb-6">Start adding trades to build your trading history</p>
              <Link href="/dashboard">
                <Button className="bg-gold text-charcoal hover:bg-gold/90">
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Trade
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <Card key={trade.id} className="glass-morphism border-white/10 hover:border-gold/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    {/* Symbol & Asset */}
                    <div>
                      <div className="text-lg font-semibold text-white">{trade.symbol}</div>
                      <div className="text-sm text-white/60">{trade.assetClass}</div>
                    </div>

                    {/* Direction & Quantity */}
                    <div>
                      <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                        trade.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.direction.toUpperCase()}
                      </div>
                      <div className="text-sm text-white/60 mt-1">{trade.quantity} units</div>
                    </div>

                    {/* Entry/Exit */}
                    <div>
                      <div className="text-white font-medium">{formatCurrency(trade.entryPrice)}</div>
                      <div className="text-white/60 text-sm">
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : 'Open'}
                      </div>
                    </div>

                    {/* P&L */}
                    <div>
                      <div className={`font-bold ${getPnLColor(trade.pnl)}`}>
                        {trade.pnl ? formatCurrency(trade.pnl) : '--'}
                      </div>
                      <Badge className={getStatusColor(trade.status)}>
                        {trade.status}
                      </Badge>
                    </div>

                    {/* AI Grade */}
                    <div>
                      <div className={`text-2xl font-bold ${getGradeColor(trade.aiGrade)}`}>
                        {trade.aiGrade || '--'}
                      </div>
                      <div className="text-white/60 text-sm">AI Grade</div>
                    </div>

                    {/* Date */}
                    <div>
                      <div className="text-white">
                        {format(new Date(trade.entryTime), 'MMM dd')}
                      </div>
                      <div className="text-white/60 text-sm">
                        {format(new Date(trade.entryTime), 'HH:mm')}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {trade.notes && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/80 text-sm">{trade.notes}</p>
                    </div>
                  )}

                  {/* AI Analysis Summary */}
                  {trade.aiAnalysis && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-green-400 font-medium mb-1">Strengths</div>
                          <div className="text-white/70">{trade.aiAnalysis.strengths[0]}</div>
                        </div>
                        <div>
                          <div className="text-bronze font-medium mb-1">Suggestions</div>
                          <div className="text-white/70">{trade.aiAnalysis.suggestions[0]}</div>
                        </div>
                        <div>
                          <div className="text-blue-400 font-medium mb-1">Risk Assessment</div>
                          <div className="text-white/70">{trade.aiAnalysis.riskAssessment}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}