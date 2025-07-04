import { Link } from "wouter";
import { Button } from "../ui/button.js";
import { useAuth } from "../../hooks/use-auth.js";
import logoPath from "@assets/Affluent Edge (2)_1751360237178.png";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-gold text-2xl p-2 rounded focus:outline-none"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <i className="fas fa-bars"></i>
          </button>
          {/* Desktop nav */}
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
              <Link href="/analytics-dashboard">
                <a className="text-white hover:text-gold transition-colors">Analytics</a>
              </Link>
            </div>
          )}
          {/* User controls */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Live Account Status */}
                <div className="flex items-center space-x-2 glass-morphism px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/70">
                    {user.betaStatus === 'active' ? 'Premium Member' : 'Premium Account'}
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
                  Access Platform
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex md:hidden" onClick={() => setMobileNavOpen(false)}>
          <nav className="bg-charcoal w-64 h-full p-6" onClick={e => e.stopPropagation()}>
            <button className="mb-4 text-gold" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
              <i className="fas fa-times"></i>
            </button>
            {user && (
              <div className="flex flex-col space-y-4">
                <Link href="/dashboard"><a className="text-white hover:text-gold">Command Center</a></Link>
                <Link href="/strategies"><a className="text-white hover:text-gold">Elite Strategies</a></Link>
                <Link href="/community"><a className="text-white hover:text-gold">Trader Community</a></Link>
                <Link href="/ai-analysis"><a className="text-white hover:text-gold">Intelligence Hub</a></Link>
                <Link href="/analytics-dashboard"><a className="text-white hover:text-gold">Analytics</a></Link>
                <Link href="/profile"><a className="text-white hover:text-gold">Profile</a></Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-white hover:text-red-400 hover:bg-white/5 w-full text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </Button>
              </div>
            )}
            {!user && (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90 w-full mt-4">
                  Access Platform
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
}
