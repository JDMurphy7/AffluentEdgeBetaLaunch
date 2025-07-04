import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { useToast } from "../hooks/use-toast.js";
import affluentEdgeLogo from "@assets/image_1751456311338.png";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resetData, setResetData] = useState({ 
    email: "", 
    token: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Get email and token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || '';
    const token = urlParams.get('token') || '';
    
    setResetData(prev => ({ ...prev, email, token }));
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (resetData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: resetData.email,
          token: resetData.token,
          newPassword: resetData.newPassword
        })
      });
      
      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in with your new password.",
        });
        setTimeout(() => {
          setLocation('/auth');
        }, 2000);
      } else {
        const error = await response.json();
        toast({
          title: "Reset Failed",
          description: error.error || "Invalid or expired reset token.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Reset Error",
        description: "Connection failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <Card className="glass-morphism border-gold/20 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={affluentEdgeLogo} alt="AffluentEdge" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-white">Reset Your Password</CardTitle>
          <p className="text-white/70">Enter your new password below</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-1">Email</label>
              <Input
                type="email"
                value={resetData.email}
                readOnly
                className="bg-white/5 border-white/20 text-white/50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">New Password</label>
              <Input
                type="password"
                value={resetData.newPassword}
                onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">Confirm Password</label>
              <Input
                type="password"
                value={resetData.confirmPassword}
                onChange={(e) => setResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90"
              disabled={isResetting}
            >
              {isResetting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setLocation('/auth')}
              className="text-gold hover:text-bronze transition-colors text-sm"
            >
              ← Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}