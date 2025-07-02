import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logoPath from "@assets/Affluent Edge (2)_1751360237178.png";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href={user ? "/dashboard" : "/"}>
              <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                {/* AffluentEdge Official Logo */}
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img 
                    src={logoPath} 
                    alt="AffluentEdge" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-gradient-gold">AffluentEdge</span>
              </div>
            </Link>
          </div>
          
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard">
                <a className="text-white hover:text-gold transition-colors">Command Center</a>
              </Link>
              <Link href="/strategies">
                <a className="text-white hover:text-gold transition-colors">Elite Strategies</a>
              </Link>
              <Link href="/community">
                <a className="text-white hover:text-gold transition-colors">Trader Community</a>
              </Link>
              <Link href="/ai-analysis">
                <a className="text-white hover:text-gold transition-colors">Intelligence Hub</a>
              </Link>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Live Account Status */}
                <div className="flex items-center space-x-2 glass-morphism px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/70">
                    {user.betaStatus === 'active' ? 'Elite Member' : 'Premium Account'}
                  </span>
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-white hover:text-gold hover:bg-white/5">
                      <User className="h-4 w-4 mr-2" />
                      {user.firstName || user.email.split('@')[0]}
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-white hover:text-red-400 hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              /* Login Button for Non-Authenticated Users */
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90">
                  Access Elite
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
