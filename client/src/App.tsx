import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import TradeHistory from "@/pages/trade-history";
import AIAnalysis from "@/pages/ai-analysis";
import Strategies from "@/pages/strategies";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/community" component={Community} />
      <Route path="/trade-history" component={TradeHistory} />
      <Route path="/ai-analysis" component={AIAnalysis} />
      <Route path="/strategies" component={Strategies} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode on the document
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.background = '#0F0F0F';
    document.documentElement.style.background = '#0F0F0F';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-charcoal text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
