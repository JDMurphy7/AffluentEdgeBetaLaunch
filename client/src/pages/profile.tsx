import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { User, Trade } from "@/lib/types";
import { format } from "date-fns";
import affluentEdgeLogo from "@assets/Affluent Edge (2)_1751360237178.png";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/user/1`],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: [`/api/trades/1`],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      return apiRequest(`/api/user/1`, {
        method: "PATCH",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/1`] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate(editedUser);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({});
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
    });
  };

  const recentTrades = trades?.slice(-5).reverse() || [];
  const totalTrades = trades?.length || 0;
  const winningTrades = trades?.filter(t => t.pnl && parseFloat(t.pnl) > 0).length || 0;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const gradeDistribution = trades?.reduce((acc, trade) => {
    if (trade.aiGrade) {
      const grade = trade.aiGrade.charAt(0);
      acc[grade] = (acc[grade] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const averageGrade = () => {
    const grades = Object.entries(gradeDistribution);
    if (grades.length === 0) return "N/A";
    
    const gradePoints = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    let totalPoints = 0;
    let totalGrades = 0;
    
    grades.forEach(([grade, count]) => {
      totalPoints += (gradePoints[grade as keyof typeof gradePoints] || 0) * count;
      totalGrades += count;
    });
    
    const average = totalPoints / totalGrades;
    if (average >= 3.5) return "A";
    if (average >= 2.5) return "B";
    if (average >= 1.5) return "C";
    if (average >= 0.5) return "D";
    return "F";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-gold";
    if (grade.startsWith("B")) return "text-bronze";
    if (grade.startsWith("C")) return "text-blue-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Navigation */}
      <nav className="glass-morphism border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-gold transition-colors">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <img src={affluentEdgeLogo} alt="AffluentEdge" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">AffluentEdge</span>
            </div>
          </div>
          <div className="text-white/60 text-sm">
            Profile Management
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/70 text-lg">Manage your account settings and view your trading statistics</p>
        </div>

        {userLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="glass-morphism border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-user text-gold mr-2"></i>
                    Account Information
                  </CardTitle>
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEdit}
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gold text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/60 text-sm">Username</label>
                          {isEditing ? (
                            <Input
                              value={editedUser.username || ""}
                              onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          ) : (
                            <div className="text-white font-medium">{user?.username}</div>
                          )}
                        </div>
                        <div>
                          <label className="text-white/60 text-sm">Email</label>
                          {isEditing ? (
                            <Input
                              type="email"
                              value={editedUser.email || ""}
                              onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          ) : (
                            <div className="text-white font-medium">{user?.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm">Account Balance</label>
                      <div className="text-2xl font-bold text-white">
                        ${user?.accountBalance ? parseFloat(user.accountBalance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) : '0.00'}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm">Member Since</label>
                      <div className="text-white font-medium">
                        {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '--'}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4 pt-4 border-t border-white/10">
                      <Button 
                        onClick={handleSave}
                        disabled={updateUserMutation.isPending}
                        className="bg-gold text-charcoal hover:bg-gold/90"
                      >
                        {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-morphism border-white/10 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-history text-bronze mr-2"></i>
                    Recent Trading Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tradesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                          <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-600 rounded w-1/3 mb-1"></div>
                            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentTrades.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-chart-line text-bronze"></i>
                      </div>
                      <p className="text-white/60">No recent trades</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTrades.map((trade) => (
                        <div key={trade.id} className="flex items-center space-x-4 p-3 glass-morphism rounded-lg border border-white/5">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                            trade.direction === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <i className={`fas fa-arrow-${trade.direction === 'long' ? 'up' : 'down'}`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{trade.symbol}</div>
                            <div className="text-white/60 text-sm">
                              {format(new Date(trade.entryTime), 'MMM dd, HH:mm')}
                            </div>
                          </div>
                          {trade.aiGrade && (
                            <Badge className={`${getGradeColor(trade.aiGrade)} bg-transparent border`}>
                              {trade.aiGrade}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              {/* Trading Stats */}
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-chart-bar text-gold mr-2"></i>
                    Trading Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{totalTrades}</div>
                    <div className="text-white/60 text-sm">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{winRate.toFixed(1)}%</div>
                    <div className="text-white/60 text-sm">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGradeColor(averageGrade())}`}>
                      {averageGrade()}
                    </div>
                    <div className="text-white/60 text-sm">Average Grade</div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-graduation-cap text-bronze mr-2"></i>
                    Grade Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D', 'F'].map(grade => {
                      const count = gradeDistribution[grade] || 0;
                      const percentage = totalTrades > 0 ? (count / totalTrades) * 100 : 0;
                      return (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-sm font-bold ${getGradeColor(grade)}`}>
                              {grade}
                            </div>
                            <span className="text-white/80 text-sm">{count}</span>
                          </div>
                          <span className="text-white/60 text-sm">{percentage.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="glass-morphism border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="fas fa-cog text-bronze mr-2"></i>
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gold text-charcoal hover:bg-gold/90">
                    <i className="fas fa-download mr-2"></i>
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full border-bronze/30 text-bronze hover:bg-bronze/10">
                    <i className="fas fa-sync mr-2"></i>
                    Reset Password
                  </Button>
                  <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <i className="fas fa-trash mr-2"></i>
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}