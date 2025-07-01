import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleBetaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to request beta access.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/beta-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit beta request");
      }

      toast({
        title: "Beta Request Submitted!",
        description: "You'll receive access instructions within 24 hours.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute top-1/2 -left-40 w-64 h-64 bg-bronze/5 rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-48 h-48 bg-gold/3 rounded-full blur-3xl animate-floating delay-2000"></div>
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-bronze/3 rounded-full blur-2xl animate-glow"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 glass-morphism border-b border-white/10">
        <div className="flex items-center space-x-3">
          <img src={affluentEdgeLogo} alt="AffluentEdge" className="h-8 w-auto" />
          <span className="text-xl font-bold text-white">AffluentEdge</span>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
            Demo Dashboard
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full border border-gold/30 mb-8">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
            <span className="text-gold text-sm font-medium">EXCLUSIVE BETA ACCESS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Elite Trading
            <span className="block bg-gradient-to-r from-gold to-bronze bg-clip-text text-transparent">
              Journal & Analytics
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional-grade trading journal with AI-powered analysis, FTMO-style tracking, 
            and strategy validation for serious traders.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="glass-morphism p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-brain text-gold text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-white/70 text-sm">Get A-F grades based on discipline, not just profit</p>
            </div>

            <div className="glass-morphism p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-bronze/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-bronze text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">FTMO-Style Tracking</h3>
              <p className="text-white/70 text-sm">Professional equity curves and drawdown monitoring</p>
            </div>

            <div className="glass-morphism p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-gold/15 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cogs text-gold text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">Strategy Validation</h3>
              <p className="text-white/70 text-sm">Built-in strategies with adherence scoring</p>
            </div>
          </div>

          {/* Beta Access Form */}
          <div className="glass-morphism-hero p-8 rounded-2xl border border-gold/20 max-w-md mx-auto animate-floating">
            <h3 className="text-2xl font-bold text-white mb-2">Request Beta Access</h3>
            <p className="text-white/70 mb-6">Join elite traders using AffluentEdge</p>
            
            <form onSubmit={handleBetaRequest} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                disabled={isSubmitting}
              />
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90 transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Get Beta Access"
                )}
              </Button>
            </form>

            <p className="text-xs text-white/60 mt-4">
              Limited spots available. No spam, ever.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Professional Traders
            </h2>
            <p className="text-white/70 text-lg">
              Join traders who've elevated their performance with AffluentEdge
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center glass-morphism p-6 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-gold mb-2">500+</div>
              <div className="text-white/70">Beta Testers</div>
            </div>
            <div className="text-center glass-morphism p-6 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-bronze mb-2">95%</div>
              <div className="text-white/70">Improved Discipline</div>
            </div>
            <div className="text-center glass-morphism p-6 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-gold mb-2">50K+</div>
              <div className="text-white/70">Trades Analyzed</div>
            </div>
            <div className="text-center glass-morphism p-6 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-bronze mb-2">4.9/5</div>
              <div className="text-white/70">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src={affluentEdgeLogo} alt="AffluentEdge" className="h-6 w-auto" />
            <span className="text-white font-medium">AffluentEdge</span>
          </div>
          <div className="text-white/60 text-sm">
            © 2025 AffluentEdge. Elite trading tools for serious traders.
          </div>
        </div>
      </footer>
    </div>
  );
}