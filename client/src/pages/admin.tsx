import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, User, MapPin, Mail } from "lucide-react";

interface BetaApplicant {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  residency?: string;
  betaStatus: 'pending' | 'approved' | 'active' | 'inactive';
  signupDate: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: applicants, isLoading, error } = useQuery<BetaApplicant[]>({
    queryKey: ['/api/admin/beta-applicants'],
    queryFn: async () => {
      // Simple admin access - use configured admin email
      const adminEmail = "theaffluentedge@gmail.com";
      
      const response = await fetch(`/api/admin/beta-applicants?admin=${encodeURIComponent(adminEmail)}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Admin access required. Please contact support.");
        }
        throw new Error("Failed to load applicants");
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
        body: JSON.stringify({ contactId, email, firstName, lastName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve user');
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
        body: JSON.stringify({ contactId, email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject user');
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
        <div className="text-red-400">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Elite Member Administration</h1>
          <p className="text-white/60">Manage elite membership applications and exclusive access</p>
        </div>

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

                    {applicant.betaStatus === 'pending' && (
                      <div className="flex space-x-3">
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
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}