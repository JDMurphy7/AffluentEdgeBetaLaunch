import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";

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
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(loginData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
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
        title: "Welcome Back!",
        description: `Hello ${data.user.firstName || 'User'}!`,
      });

      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials.",
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
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(betaApplicationData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
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
        title: "Application Submitted!",
        description: "Your beta application has been submitted. We'll review it and contact you soon.",
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
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Please try again.",
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
          <h1 className="text-2xl font-bold text-white">Beta Access Portal</h1>
          <p className="text-white/70 mt-2">Access your trading journal</p>
        </div>

        {/* Auth Forms */}
        <Card className="glass-morphism border-gold/20">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-gold data-[state=active]:text-charcoal text-white/70"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-gold data-[state=active]:text-charcoal text-white/70"
              >
                Apply for Beta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Welcome Back</CardTitle>
                <CardDescription className="text-white/70">
                  Sign in to your beta account
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
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Apply for Beta</CardTitle>
                <CardDescription className="text-white/70">
                  Request access to AffluentEdge beta program
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