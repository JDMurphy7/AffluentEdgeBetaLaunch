import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

interface TraderProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  winRate: number;
  grade: string;
  profitFactor: number;
  totalTrades: number;
  accountGrowth: number;
  strategies: string[];
  joinedDate: string;
  monthlyGrowth: number;
  isVerified: boolean;
}

// Mock data for community traders
const mockTraders: TraderProfile[] = [
  {
    id: "1",
    username: "EliteTrader_Alex",
    displayName: "Alex Rodriguez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    skillLevel: "Expert",
    winRate: 89.2,
    grade: "A+",
    profitFactor: 3.45,
    totalTrades: 847,
    accountGrowth: 156.7,
    strategies: ["ICT", "Momentum Breakout", "Options Flow"],
    joinedDate: "2024-08",
    monthlyGrowth: 15.4,
    isVerified: true,
  },
  {
    id: "2",
    username: "BetaTester_Demo",
    displayName: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    skillLevel: "Intermediate",
    winRate: 73.5,
    grade: "B+",
    profitFactor: 2.12,
    totalTrades: 156,
    accountGrowth: 45.3,
    strategies: ["Momentum Breakout", "Support/Resistance"],
    joinedDate: "2024-11",
    monthlyGrowth: 8.2,
    isVerified: false,
  },
  {
    id: "3",
    username: "CryptoMaven_Sarah",
    displayName: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    skillLevel: "Advanced",
    winRate: 82.6,
    grade: "A-",
    profitFactor: 2.89,
    totalTrades: 423,
    accountGrowth: 134.2,
    strategies: ["DeFi Yield Farming", "Trend Following"],
    joinedDate: "2024-09",
    monthlyGrowth: 12.8,
    isVerified: true,
  },
  {
    id: "4",
    username: "ForexPro_Michael",
    displayName: "Michael Thompson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    skillLevel: "Expert",
    winRate: 78.4,
    grade: "A",
    profitFactor: 2.67,
    totalTrades: 691,
    accountGrowth: 98.3,
    strategies: ["ICT", "Supply/Demand"],
    joinedDate: "2024-07",
    monthlyGrowth: 9.1,
    isVerified: true,
  },
  {
    id: "5",
    username: "StockWizard_Emma",
    displayName: "Emma Davis",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
    skillLevel: "Advanced",
    winRate: 76.8,
    grade: "B+",
    profitFactor: 2.34,
    totalTrades: 298,
    accountGrowth: 67.9,
    strategies: ["Earnings Plays", "Technical Analysis"],
    joinedDate: "2024-10",
    monthlyGrowth: 7.4,
    isVerified: false,
  },
  {
    id: "6",
    username: "ScalpMaster_James",
    displayName: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    skillLevel: "Intermediate",
    winRate: 71.2,
    grade: "B",
    profitFactor: 1.89,
    totalTrades: 1024,
    accountGrowth: 34.6,
    strategies: ["Scalping", "Mean Reversion"],
    joinedDate: "2024-12",
    monthlyGrowth: 5.8,
    isVerified: false,
  },
];

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("All");

  const filteredTraders = mockTraders.filter((trader) => {
    const matchesSearch = trader.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trader.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkillLevel === "All" || trader.skillLevel === selectedSkillLevel;
    return matchesSearch && matchesSkill;
  });

  const topPerformers = [...mockTraders]
    .sort((a, b) => b.monthlyGrowth - a.monthlyGrowth)
    .slice(0, 4);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert": return "bg-gold/20 text-gold border-gold/30";
      case "Advanced": return "bg-bronze/20 text-bronze border-bronze/30";
      case "Intermediate": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-gold";
    if (grade.startsWith("B")) return "text-bronze";
    if (grade.startsWith("C")) return "text-blue-400";
    return "text-gray-400";
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
            Community • {mockTraders.length} Members
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trading Community</h1>
          <p className="text-white/70 text-lg">Connect with elite traders and learn from the best</p>
        </div>

        {/* Search and Filters */}
        <div className="glass-morphism p-6 rounded-xl mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search traders by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Expert", "Advanced", "Intermediate", "Beginner"].map((level) => (
                <Button
                  key={level}
                  variant={selectedSkillLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedSkillLevel(level)}
                  className={selectedSkillLevel === level 
                    ? "bg-gold text-charcoal hover:bg-gold/90" 
                    : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-morphism border border-white/10">
            <TabsTrigger value="profiles" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
              Community Profiles
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal">
              Top Performers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="mt-6">
            {/* Community Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTraders.map((trader) => (
                <div key={trader.id} className="glass-morphism p-6 rounded-xl border border-white/10 hover:border-gold/30 transition-all duration-300">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <img
                        src={trader.avatar}
                        alt={trader.displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {trader.isVerified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                          <i className="fas fa-check text-charcoal text-xs"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{trader.displayName}</h3>
                      <p className="text-white/70 text-sm">@{trader.username}</p>
                      <Badge className={`text-xs mt-1 ${getSkillLevelColor(trader.skillLevel)}`}>
                        {trader.skillLevel}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{trader.winRate.toFixed(1)}%</div>
                      <div className="text-white/60 text-sm">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getGradeColor(trader.grade)}`}>{trader.grade}</div>
                      <div className="text-white/60 text-sm">Grade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{trader.profitFactor}</div>
                      <div className="text-white/60 text-sm">Profit Factor</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{trader.totalTrades}</div>
                      <div className="text-white/60 text-sm">Total Trades</div>
                    </div>
                  </div>

                  {/* Account Growth */}
                  <div className="glass-morphism p-3 rounded-lg mb-4 border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Account Growth</span>
                      <span className={`text-sm font-medium ${trader.monthlyGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trader.monthlyGrowth > 0 ? '+' : ''}{trader.monthlyGrowth}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">+{trader.accountGrowth}%</div>
                  </div>

                  {/* Strategies */}
                  <div className="flex flex-wrap gap-2">
                    {trader.strategies.slice(0, 3).map((strategy, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/80">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            {/* Top Performers Leaderboard */}
            <div className="glass-morphism p-6 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Monthly Top Performers</h2>
              <div className="space-y-4">
                {topPerformers.map((trader, index) => (
                  <div key={trader.id} className="flex items-center space-x-4 p-4 glass-morphism rounded-lg border border-white/5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-gold text-charcoal' :
                      index === 1 ? 'bg-gray-400 text-charcoal' :
                      index === 2 ? 'bg-bronze text-charcoal' :
                      'bg-white/10 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    <img
                      src={trader.avatar}
                      alt={trader.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold">{trader.displayName}</div>
                      <div className="text-white/60 text-sm">{trader.strategies[0]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+{trader.monthlyGrowth}%</div>
                      <div className="text-white/60 text-sm">{trader.winRate.toFixed(1)}% Win</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}