import logoPath from "@assets/Affluent Edge (2)_1751360237178.png";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
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
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-gold transition-colors">Dashboard</a>
            <a href="#" className="text-white hover:text-gold transition-colors">Strategies</a>
            <a href="#" className="text-white hover:text-gold transition-colors">Community</a>
            <a href="#" className="text-white hover:text-gold transition-colors">Analytics</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 glass-morphism px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Account</span>
            </div>
            <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center">
              <i className="fas fa-user text-black text-sm"></i>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
