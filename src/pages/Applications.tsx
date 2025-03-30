
import { useState } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, EyeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Applications = () => {
  const { user, logout } = useAuth();
  const { applications, updateApplicationStatus } = useApplications();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Filter applications based on status
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          onSidebarToggle={handleSidebarToggle} 
          user={user} 
          onLogout={logout}
        />
        
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
              <p className="text-gray-600">Review and manage loan applications</p>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Application Overview</CardTitle>
                  <CardDescription>Quick summary of loan applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">{pendingApplications.length}</p>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <AlertCircleIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
                      <div>
                        <p className="text-green-800 text-sm font-medium">Approved</p>
                        <p className="text-2xl font-bold text-green-900">{approvedApplications.length}</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-between">
                      <div>
                        <p className="text-red-800 text-sm font-medium">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">{rejectedApplications.length}</p>
                      </div>
                      <div className="bg-red-100 p-2 rounded-full">
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 w-full max-w-md">
                <TabsTrigger value="all" className="flex-1">All Applications</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ApplicationTable 
                  applications={applications} 
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateApplicationStatus}
                />
              </TabsContent>
              
              <TabsContent value="pending">
                <ApplicationTable 
                  applications={pendingApplications} 
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateApplicationStatus}
                />
              </TabsContent>
              
              <TabsContent value="approved">
                <ApplicationTable 
                  applications={approvedApplications} 
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateApplicationStatus}
                />
              </TabsContent>
              
              <TabsContent value="rejected">
                <ApplicationTable 
                  applications={rejectedApplications} 
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateApplicationStatus}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

interface ApplicationTableProps {
  applications: any[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  updateStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
}

const ApplicationTable = ({ 
  applications, 
  formatCurrency, 
  formatDate,
  getStatusBadge,
  updateStatus
}: ApplicationTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>List of loan applications</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No applications found in this category
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.businessName}</TableCell>
                    <TableCell>{application.fullName}</TableCell>
                    <TableCell>{formatCurrency(application.loanAmount)}</TableCell>
                    <TableCell>{application.loanTerm} months</TableCell>
                    <TableCell>{formatDate(application.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            application.eligibilityScore >= 80 ? 'bg-green-100 text-green-800' :
                            application.eligibilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {application.eligibilityScore}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateStatus(application.id, 'approved')}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => updateStatus(application.id, 'rejected')}
                            >
                              <XCircleIcon className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Applications;
