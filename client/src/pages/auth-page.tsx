import { useState } from "react";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.js";
import { useToast } from "../hooks/use-toast.js";
import { Link, useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient.js";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

// Forgot Password Component
function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        toast({
          title: "Reset Instructions Sent",
          description: "If this email is registered, you'll receive reset instructions shortly.",
        });
        setIsResetMode(false);
        setEmail("");
      } else {
        const error = await response.json();
        toast({
          title: "Reset Failed",
          description: error.error || "Failed to process reset request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <div className="space-y-3">
        <form onSubmit={handleForgotPassword} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold text-sm"
            disabled={isLoading}
            required
          />
          <div className="flex space-x-2">
            <Button 
              type="submit"
              size="sm"
              className="flex-1 bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset"}
            </Button>
            <Button 
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsResetMode(false)}
              className="text-white/70 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsResetMode(true)}
      className="text-gold hover:text-bronze transition-colors text-sm underline"
    >
      Forgot your password?
    </button>
  );
}

interface LoginFormData {
  email: string;
  password: string;
}

interface BetaApplicationData {
  email: string;
  firstName: string;
  lastName: string;
  residency: string;
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  
  const [betaApplicationData, setBetaApplicationData] = useState<BetaApplicationData>({
    email: "",
    firstName: "",
    lastName: "",
    residency: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Complete Your Credentials",
        description: "Both email and password are required for secure access.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(loginData.email)) {
      toast({
        title: "Verify Your Email",
        description: "A valid email address is required for secure access.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast({
        title: "Welcome to AffluentEdge!",
        description: `Your advanced trading journey continues, ${data.user.firstName || 'Trader'}!`,
      });

      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Access Denied",
        description: error instanceof Error ? error.message : "Please verify your account credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleBetaApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!betaApplicationData.email || !betaApplicationData.firstName || !betaApplicationData.lastName || !betaApplicationData.residency) {
      toast({
        title: "Complete Your Application",
        description: "All fields are required to secure your premium access.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(betaApplicationData.email)) {
      toast({
        title: "Verify Your Email",
        description: "A valid email address is required for premium access.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/beta-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: betaApplicationData.email,
          firstName: betaApplicationData.firstName,
          lastName: betaApplicationData.lastName,
          residency: betaApplicationData.residency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Application submission failed");
      }

      toast({
        title: "Welcome to AffluentEdge Elite!",
        description: "Your exclusive access request is being reviewed. Expect confirmation within 24 hours.",
      });

      // Reset form
      setBetaApplicationData({
        email: "",
        firstName: "",
        lastName: "",
        residency: ""
      });
    } catch (error) {
      toast({
        title: "Connection Issue",
        description: error instanceof Error ? error.message : "Please retry your exclusive access request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <img 
              src={affluentEdgeLogo} 
              alt="AffluentEdge" 
              className="h-12 mx-auto mb-4 hover:scale-105 transition-transform duration-200"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white">Professional Trader Access</h1>
          <p className="text-white/70 mt-2">Enter your advanced trading command center</p>
        </div>

        {/* Auth Forms */}
        <Card className="glass-morphism border-gold/20">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-gold data-[state=active]:text-charcoal text-white/70"
              >
                Access Account
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-gold data-[state=active]:text-charcoal text-white/70"
              >
                Join Premium
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Welcome Back, Trader</CardTitle>
                <CardDescription className="text-white/70">
                  Access your exclusive trading command center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                    disabled={isLoading}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                    disabled={isLoading}
                    required
                  />
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <ForgotPasswordForm />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Join the Elite</CardTitle>
                <CardDescription className="text-white/70">
                  Apply for exclusive access to AffluentEdge premium platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBetaApplication} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={betaApplicationData.firstName}
                      onChange={(e) => setBetaApplicationData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                      disabled={isLoading}
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={betaApplicationData.lastName}
                      onChange={(e) => setBetaApplicationData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={betaApplicationData.email}
                    onChange={(e) => setBetaApplicationData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                    disabled={isLoading}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Country/Region of residency"
                    value={betaApplicationData.residency}
                    onChange={(e) => setBetaApplicationData(prev => ({ ...prev, residency: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                    disabled={isLoading}
                    required
                  />
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting Application..." : "Apply for Beta"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            Need help? <Link href="/" className="text-gold hover:text-gold/80">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}