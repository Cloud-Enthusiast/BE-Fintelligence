import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  SearchIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Application = {
  id: string;
  business_name: string;
  full_name: string;
  email: string;
  loan_amount: number;
  created_at: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  is_eligible: boolean;
  eligibility_score: number;
};

const Applications = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  useEffect(() => {
    if (isAuthenticated && profile && profile.role !== 'Loan Officer') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);
  
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      
      try {
        let query = supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching applications:', error);
          toast({
            variant: "destructive",
            title: "Failed to load applications",
            description: error.message,
          });
        } else {
          setApplications(data as Application[]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && profile?.role === 'Loan Officer') {
      fetchApplications();
    }
  }, [isAuthenticated, profile, statusFilter]);
  
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      app.business_name.toLowerCase().includes(searchLower) ||
      app.full_name.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower)
    );
  });
  
  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating application status:', error);
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: error.message,
        });
      } else {
        setApplications(prev => 
          prev.map(app => 
            app.id === id ? { ...app, status: newStatus as Application['status'] } : app
          )
        );
        
        toast({
          title: "Status updated",
          description: `Application status has been updated to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircleIcon className="w-3.5 h-3.5 mr-1" />
            Rejected
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <AlertCircleIcon className="w-3.5 h-3.5 mr-1" />
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Pending
          </Badge>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        user={{
          name: profile?.full_name || 'User',
          role: profile?.role || 'Unknown',
          avatar: profile?.avatar
        }}
        onLogout={logout}
      />
      <DashboardSidebar isOpen={isSidebarOpen} />
      
      <div className={`p-4 sm:p-6 lg:p-8 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
            <p className="text-gray-500">View and manage all loan applications</p>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                All loan applications submitted by potential borrowers
              </CardDescription>
              
              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, business, or email"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-finance-600"></div>
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.business_name}</TableCell>
                          <TableCell>
                            <div>
                              <div>{application.full_name}</div>
                              <div className="text-sm text-muted-foreground">{application.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(application.loan_amount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-200 w-16 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    application.eligibility_score >= 70 
                                      ? 'bg-green-500' 
                                      : application.eligibility_score >= 50 
                                        ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${application.eligibility_score}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{application.eligibility_score}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(application.created_at)}</TableCell>
                          <TableCell>{renderStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/application-review/${application.id}`)}
                              >
                                View
                              </Button>
                              
                              {application.status !== 'approved' && (
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => updateApplicationStatus(application.id, 'approved')}
                                >
                                  Approve
                                </Button>
                              )}
                              
                              {application.status !== 'rejected' && application.status !== 'approved' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No applications found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Applications;
