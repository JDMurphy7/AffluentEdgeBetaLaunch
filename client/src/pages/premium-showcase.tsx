import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, TrendingUp, Target, Shield, Star, ArrowRight, ChevronUp } from "lucide-react";

export default function PremiumShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-charcoal to-black">
      {/* Premium Navigation */}
      <nav className="backdrop-blur-md bg-black/40 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-gold" />
              <span className="text-2xl font-bold text-white">AffluentEdge</span>
              <Badge className="bg-gold/20 text-gold border-gold/30">PREMIUM</Badge>
            </div>
            <Button className="bg-gradient-to-r from-gold to-bronze text-black font-semibold hover:from-gold/90 hover:to-bronze/90 shadow-lg">
              Upgrade Now
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section with User Profile */}
        <div className="relative backdrop-blur-xl bg-gradient-to-r from-white/5 to-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-bronze/5 rounded-3xl"></div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Profile Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gold to-bronze rounded-full p-1">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
                    alt="Professional Trader"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-gold rounded-full p-1">
                  <Crown className="h-5 w-5 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Professional Trader Alex</h1>
                <div className="flex items-center space-x-4 text-white/80">
                  <Badge className="bg-gold/20 text-gold border-gold/30 font-semibold">
                    <Trophy className="h-3 w-3 mr-1" />
                    MASTER TIER
                  </Badge>
                  <span className="text-sm">Prop Firm Funded</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">$500K Account</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">247</div>
                <div className="text-white/60 text-sm">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">+$127K</div>
                <div className="text-white/60 text-sm">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-bronze">A+</div>
                <div className="text-white/60 text-sm">Avg Grade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Consistency Score */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-gold" />
              <ChevronUp className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">94.7%</div>
            <div className="text-white/70 text-sm mb-3">Consistency Score</div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-gold to-bronze h-2 rounded-full" style={{width: '94.7%'}}></div>
            </div>
          </Card>

          {/* Win Rate */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-gold" />
              <ChevronUp className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">89.2%</div>
            <div className="text-white/70 text-sm mb-3">Win Rate</div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-gold h-2 rounded-full" style={{width: '89.2%'}}></div>
            </div>
          </Card>

          {/* Trade Count */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-bronze" />
              <Badge className="bg-gold/20 text-gold text-xs">+12</Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-2">847</div>
            <div className="text-white/70 text-sm mb-3">Total Trades</div>
            <div className="text-green-400 text-sm font-medium">+12 this week</div>
          </Card>

          {/* Total Profit */}
          <Card className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-8 w-8 text-gold" />
              <ChevronUp className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">$427K</div>
            <div className="text-white/70 text-sm mb-3">Total Profit</div>
            <div className="text-green-400 text-sm font-medium">+15.4% this month</div>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievement Cards */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="h-6 w-6 text-gold" />
              <h2 className="text-xl font-bold text-white">Recent Achievements</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-bronze rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Master Trader</div>
                  <div className="text-white/60 text-sm">Achieved 90%+ win rate for 30 days</div>
                </div>
                <Badge className="bg-gold/20 text-gold border-gold/30">NEW</Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-bronze to-gold rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Risk Guardian</div>
                  <div className="text-white/60 text-sm">Perfect risk management for 60 trades</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-bronze rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">Profit Maximizer</div>
                  <div className="text-white/60 text-sm">Exceeded monthly profit target by 200%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-gold/10 to-bronze/10 rounded-2xl p-8 border border-gold/30 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-bronze/5"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Crown className="h-8 w-8 text-gold" />
                <h2 className="text-2xl font-bold text-white">Unlock Premium Features</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span className="text-white/90">Advanced AI Analysis & Insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-bronze rounded-full"></div>
                  <span className="text-white/90">Unlimited Strategy Backtesting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span className="text-white/90">Priority Support & Coaching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-bronze rounded-full"></div>
                  <span className="text-white/90">Exclusive Community Access</span>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-gold to-bronze text-black font-bold py-4 text-lg hover:from-gold/90 hover:to-bronze/90 transition-all duration-300 shadow-lg group">
                Upgrade to Premium
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="text-center mt-4 text-white/60 text-sm">
                Join 10,000+ funded traders
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-gold" />
              <h2 className="text-xl font-bold text-white">Monthly Progress</h2>
            </div>
            <Badge className="bg-green-400/20 text-green-400 border-green-400/30">On Track</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold mb-2">$127K</div>
              <div className="text-white/70 text-sm mb-3">Profit This Month</div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-gold to-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <div className="text-white/60 text-xs mt-2">85% of target</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-bronze mb-2">23</div>
              <div className="text-white/70 text-sm mb-3">Trading Days</div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-bronze to-gold h-2 rounded-full" style={{width: '74%'}}></div>
              </div>
              <div className="text-white/60 text-xs mt-2">23 of 31 days</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">156%</div>
              <div className="text-white/70 text-sm mb-3">Target Achievement</div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-gold h-2 rounded-full w-full"></div>
              </div>
              <div className="text-green-400 text-xs mt-2">Exceeded target!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}