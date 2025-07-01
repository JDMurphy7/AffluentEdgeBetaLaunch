import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { User, StrategyPerformance } from "@/lib/types";

interface SidebarProps {
  userId: number;
}

export default function Sidebar({ userId }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
  });

  const { data: strategies } = useQuery<StrategyPerformance[]>({
    queryKey: [`/api/strategies/${userId}/performance`],
  });

  // Demo fallback data to match equity chart
  const demoUser = {
    accountBalance: "127450.00",
    email: "demo@affluentedge.com",
    firstName: "Demo",
    lastName: "Trader"
  };

  const displayUser = user || demoUser;

  return (
    <aside className="fixed left-0 top-16 h-full w-64 glass-morphism border-r border-white/20 p-6 sidebar-scrollbar overflow-y-auto">
      <div className="space-y-6">
        {/* Account Balance */}
        <div className="glass-gold p-4 rounded-xl">
          <div className="text-sm text-gray-300 mb-1">Account Balance</div>
          <div className="text-2xl font-bold text-white">
            ${displayUser?.accountBalance ? parseFloat(displayUser.accountBalance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : '0.00'}
          </div>
          <div className="text-sm text-green-400 flex items-center mt-1">
            <i className="fas fa-arrow-up mr-1"></i>
            <span>Live Account</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <Link href="/dashboard" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/dashboard' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link href="/add-trade" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/add-trade' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-plus-circle"></i>
            <span>Add Trade</span>
          </Link>
          <Link href="/trade-history" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/trade-history' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-history"></i>
            <span>Trade History</span>
          </Link>
          <Link href="/ai-analysis" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/ai-analysis' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-brain"></i>
            <span>AI Analysis</span>
          </Link>
          <Link href="/strategies" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/strategies' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-cog"></i>
            <span>Strategies</span>
          </Link>
          <Link href="/community" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/community' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-users"></i>
            <span>Community</span>
          </Link>
          <Link href="/premium-showcase" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gold/20 transition-colors ${location === '/premium-showcase' ? 'text-gold bg-gold/10' : 'text-gold'} border border-gold/30`}>
            <i className="fas fa-crown"></i>
            <span>Premium Experience</span>
            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full ml-auto">NEW</span>
          </Link>
          <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-white w-full text-left">
            <i className="fas fa-trophy"></i>
            <span>Leaderboard</span>
          </button>
          <Link href="/profile" className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors ${location === '/profile' ? 'text-gold bg-white/5' : 'text-white'}`}>
            <i className="fas fa-user-circle"></i>
            <span>Profile</span>
          </Link>
        </nav>

        {/* Strategy Quick Stats */}
        <div className="glass-morphism p-4 rounded-xl">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Active Strategies</h3>
          <div className="space-y-2">
            {strategies?.slice(0, 3).map((strategy) => (
              <div key={strategy.strategy.id} className="flex justify-between items-center">
                <span className="text-sm">{strategy.strategy.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  strategy.averageGrade === 'A' ? 'bg-green-500/20 text-green-400' :
                  strategy.averageGrade === 'B' ? 'bg-yellow-500/20 text-yellow-400' :
                  strategy.averageGrade === 'C' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {strategy.averageGrade}
                </span>
              </div>
            )) || (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trend Following</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ICT Concepts</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Support/Resistance</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">A</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
