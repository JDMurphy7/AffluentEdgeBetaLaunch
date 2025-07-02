import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import TradeHistory from "@/pages/trade-history";
import AIAnalysis from "@/pages/ai-analysis";
import Strategies from "@/pages/strategies";
import Profile from "@/pages/profile";
import AddTrade from "@/pages/add-trade";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import PremiumShowcase from "@/pages/premium-showcase";

function ProtectedRoute({ component: Component, allowDemo = false }: { component: () => JSX.Element, allowDemo?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gold">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user && !allowDemo) {
    return <AuthPage />;
  }

  return <Component />;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={user ? Dashboard : Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} allowDemo={true} />
      </Route>
      <Route path="/community">
        <ProtectedRoute component={Community} allowDemo={true} />
      </Route>
      <Route path="/add-trade">
        <ProtectedRoute component={AddTrade} />
      </Route>
      <Route path="/trade-history">
        <ProtectedRoute component={TradeHistory} />
      </Route>
      <Route path="/ai-analysis">
        <ProtectedRoute component={AIAnalysis} />
      </Route>
      <Route path="/strategies">
        <ProtectedRoute component={Strategies} allowDemo={true} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/premium-showcase">
        <PremiumShowcase />
      </Route>
      <Route path="/admin" component={AdminDashboard} />
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
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-charcoal text-white">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
