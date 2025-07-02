import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, User, MapPin, Mail, Trash2, Shield, Eye, EyeOff, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BetaApplicant {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  residency?: string;
  betaStatus: 'pending' | 'approved' | 'active' | 'inactive' | 'blocked' | 'deleted';
  signupDate: string;
}

interface UserCredential {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  betaStatus: string;
  password: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { user, isLoading: authLoading, isAuthenticated, isAdmin } = useAuth();

  const [loginData, setLoginData] = useState({ email: "", adminKey: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/user'] });
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Connection failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const { data: applicants, isLoading, error } = useQuery<BetaApplicant[]>({
    queryKey: ['/api/admin/beta-applicants'],
    enabled: isAuthenticated && isAdmin, // Only run query if user is authenticated and admin
    queryFn: async () => {
      const response = await fetch('/api/admin/beta-applicants', {
        credentials: 'include' // Include cookies for session
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        if (response.status === 403) {
          throw new Error("Admin access required");
        }
        throw new Error("Failed to load applicants");
      }
      return response.json();
    },
  });

  const { data: userCredentials } = useQuery<UserCredential[]>({
    queryKey: ['/api/admin/user-credentials'],
    enabled: isAuthenticated && isAdmin && showCredentials,
    queryFn: async () => {
      const response = await fetch('/api/admin/user-credentials', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Failed to load user credentials");
      }
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ contactId, email, firstName, lastName }: { 
      contactId: string; 
      email: string; 
      firstName?: string; 
      lastName?: string; 
    }) => {
      const response = await fetch('/api/admin/approve-user', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ contactId, email, firstName, lastName }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve user: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (_, { email }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beta-applicants'] });
      toast({
        title: "User Approved",
        description: `${email} has been approved for beta access.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Approval Failed",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ contactId, email }: { contactId: string; email: string }) => {
      const response = await fetch('/api/admin/reject-user', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ contactId, email }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reject user: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (_, { email }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beta-applicants'] });
      toast({
        title: "User Rejected",
        description: `${email} has been rejected for beta access.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Rejection Failed",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (contactId: string, email: string, firstName?: string, lastName?: string) => {
    approveMutation.mutate({ contactId, email, firstName, lastName });
  };

  const handleReject = (contactId: string, email: string) => {
    rejectMutation.mutate({ contactId, email });
  };

  const blockMutation = useMutation({
    mutationFn: async ({ contactId, email }: { contactId: string; email: string }) => {
      const response = await fetch('/api/admin/block-user', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ contactId, email }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to block user: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (_, { email }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beta-applicants'] });
      toast({
        title: "User Blocked",
        description: `${email} has been blocked from accessing the platform.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Block Failed",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ contactId, email }: { contactId: string; email: string }) => {
      const response = await fetch('/api/admin/delete-user', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ contactId, email }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (_, { email }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beta-applicants'] });
      toast({
        title: "User Deleted",
        description: `${email} has been deleted from the platform.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Delete Failed",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBlock = (contactId: string, email: string) => {
    blockMutation.mutate({ contactId, email });
  };

  const handleDelete = (contactId: string, email: string) => {
    deleteMutation.mutate({ contactId, email });
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredApplicants = (applicants || []).filter(applicant => 
    selectedStatus === "all" || applicant.betaStatus === selectedStatus
  );

  const statusCounts = (applicants || []).reduce((acc, applicant) => {
    acc[applicant.betaStatus] = (acc[applicant.betaStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-300 border-green-500/30",
      active: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      inactive: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      active: <User className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-white">Checking admin access...</div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Card className="glass-morphism border-gold/20 w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Admin Access</CardTitle>
            <p className="text-white/70">Enter admin credentials to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm block mb-1">Email</label>
                <Input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-1">Admin Key</label>
                <Input
                  type="password"
                  value={loginData.adminKey}
                  onChange={(e) => setLoginData(prev => ({ ...prev, adminKey: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                  placeholder="Enter admin key"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-gold to-bronze text-charcoal font-semibold hover:from-gold/90 hover:to-bronze/90"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-red-400">Failed to load applicants. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Premium Member Administration</h1>
          <p className="text-white/60">Manage premium membership applications and professional access</p>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-6">
            <Button
              onClick={() => setShowCredentials(false)}
              className={`${!showCredentials ? 'bg-gold text-charcoal' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <User className="w-4 h-4 mr-2" />
              Beta Applications
            </Button>
            <Button
              onClick={() => setShowCredentials(true)}
              className={`${showCredentials ? 'bg-gold text-charcoal' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Key className="w-4 h-4 mr-2" />
              User Credentials
            </Button>
          </div>
        </div>

        {/* Conditional Content */}
        {!showCredentials ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Applications</p>
                  <p className="text-2xl font-bold text-white">{applicants?.length || 0}</p>
                </div>
                <User className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-300">{statusCounts.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Approved Users</p>
                  <p className="text-2xl font-bold text-green-300">{statusCounts.approved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-blue-300">{statusCounts.active || 0}</p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {["all", "pending", "approved", "active", "inactive"].map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "ghost"}
              onClick={() => setSelectedStatus(status)}
              className={selectedStatus === status 
                ? "bg-gradient-to-r from-gold to-bronze text-charcoal" 
                : "text-white hover:text-gold"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && statusCounts[status] && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                  {statusCounts[status]}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplicants.length === 0 ? (
            <Card className="glass-morphism border-white/10">
              <CardContent className="p-8 text-center">
                <p className="text-white/60">No applications found for the selected filter.</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplicants.map((applicant) => (
              <Card key={applicant.id} className="glass-morphism border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div>
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <User className="w-4 h-4 text-gold" />
                            {applicant.firstName} {applicant.lastName}
                          </h3>
                          <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3" />
                            {applicant.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(applicant.betaStatus)}
                          {applicant.residency && (
                            <Badge className="bg-white/10 text-white/80 border-white/20 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {applicant.residency}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-white/40 text-sm">
                        Applied: {format(new Date(applicant.signupDate), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    <div className="flex space-x-2 flex-wrap">
                      {applicant.betaStatus === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleApprove(applicant.id, applicant.email, applicant.firstName, applicant.lastName)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(applicant.id, applicant.email)}
                            disabled={rejectMutation.isPending}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {(applicant.betaStatus === 'approved' || applicant.betaStatus === 'active') && (
                        <>
                          <Button
                            onClick={() => handleBlock(applicant.id, applicant.email)}
                            disabled={blockMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Block
                          </Button>
                          <Button
                            onClick={() => handleDelete(applicant.id, applicant.email)}
                            disabled={deleteMutation.isPending}
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
          </>
        ) : (
          /* User Credentials View */
          <div className="space-y-6">
            <Card className="glass-morphism border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-gold" />
                  User Account Credentials
                </CardTitle>
                <p className="text-white/60">View login credentials for all approved users</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {userCredentials && userCredentials.length > 0 ? (
                  userCredentials.map((user) => (
                    <Card key={user.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">
                              {user.firstName || 'Unknown'} {user.lastName || 'User'}
                            </h4>
                            <p className="text-white/60 text-sm flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                className={`${
                                  user.betaStatus === 'active' ? 'bg-green-600' : 
                                  user.betaStatus === 'approved' ? 'bg-blue-600' : 
                                  'bg-orange-600'
                                } text-white`}
                              >
                                {user.betaStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-white/40 text-xs">Password:</p>
                              <div className="flex items-center gap-2">
                                <code className="text-gold bg-black/30 px-2 py-1 rounded text-sm">
                                  {visiblePasswords.has(user.id) ? user.password : '••••••••'}
                                </code>
                                <Button
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-white/60 hover:text-white"
                                >
                                  {visiblePasswords.has(user.id) ? 
                                    <EyeOff className="w-4 h-4" /> : 
                                    <Eye className="w-4 h-4" />
                                  }
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Key className="w-12 h-12 mx-auto mb-4 text-white/40" />
                    <p>No user credentials available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}