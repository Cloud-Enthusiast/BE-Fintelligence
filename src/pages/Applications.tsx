
import { useState, useMemo } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchAssessments, MappedAssessment } from '@/hooks/useFetchAssessments'; // Import the new hook and type
import { useUpdateAssessmentStatus } from '@/hooks/useUpdateAssessmentStatus'; // Import the update hook
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
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, EyeIcon, Loader2 } from 'lucide-react'; // Added Loader2
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton


// Define the type for the status update function expected by ApplicationTable
// It should match the signature of the mutation function's input
interface UpdateStatusPayload {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
}
type UpdateStatusFunc = (payload: UpdateStatusPayload) => void;


const Applications = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch assessments using the new hook
  const { data: assessments, isLoading, error } = useFetchAssessments();
  // Get the mutation function for updating status
  const { mutate: updateStatusMutation } = useUpdateAssessmentStatus();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Memoize formatting functions for performance
  const formatCurrency = useMemo(() => (amount: number | null): string => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', { // Use INR formatting
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useMemo(() => (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { // Use GB format (DD/MM/YYYY)
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }, []);

  const getStatusBadge = useMemo(() => (status: string | null): JSX.Element => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'completed': // Assuming 'completed' from assessment maps to 'pending' review
         return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Completed (Review)</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }, []);

  // Filter applications based on status using fetched data
  const filteredApplications = useMemo(() => {
    const all = assessments || [];
    // Treat 'completed' assessments as 'pending' for review purposes in this dashboard
    const pending = all.filter(app => app.status === 'pending' || app.status === 'completed');
    const approved = all.filter(app => app.status === 'approved');
    const rejected = all.filter(app => app.status === 'rejected');
    return { all, pending, approved, rejected };
  }, [assessments]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-finance-600" />
        <span className="ml-4 text-lg text-gray-700">Loading Applications...</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
           <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Applications</h2>
           <p className="text-red-600">{error.message}</p>
           <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  // Render the main content if data is loaded successfully
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
              <p className="text-gray-600">Review and manage loan eligibility assessments</p>
            </div>

            {/* Summary Cards */}
            <div className="mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Application Overview</CardTitle>
                  <CardDescription>Quick summary of assessments by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pending/Completed Card */}
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-900">{filteredApplications.pending.length}</p>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <AlertCircleIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    {/* Approved Card */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center justify-between">
                      <div>
                        <p className="text-green-800 text-sm font-medium">Approved</p>
                        <p className="text-2xl font-bold text-green-900">{filteredApplications.approved.length}</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    {/* Rejected Card */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-between">
                      <div>
                        <p className="text-red-800 text-sm font-medium">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">{filteredApplications.rejected.length}</p>
                      </div>
                      <div className="bg-red-100 p-2 rounded-full">
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs and Table */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 w-full max-w-md">
                <TabsTrigger value="all" className="flex-1">All Applications</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pending Review</TabsTrigger>
                <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ApplicationTable
                  applications={filteredApplications.all}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateStatusMutation} // Pass the mutation function
                />
              </TabsContent>

              <TabsContent value="pending">
                <ApplicationTable
                  applications={filteredApplications.pending}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateStatusMutation} // Pass the mutation function
                />
              </TabsContent>

              <TabsContent value="approved">
                <ApplicationTable
                  applications={filteredApplications.approved}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateStatusMutation} // Pass the mutation function
                />
              </TabsContent>

              <TabsContent value="rejected">
                <ApplicationTable
                  applications={filteredApplications.rejected}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  updateStatus={updateStatusMutation} // Pass the mutation function
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Update ApplicationTableProps to use the mapped type and correct update function signature
interface ApplicationTableProps {
  applications: MappedAssessment[];
  formatCurrency: (amount: number | null) => string;
  formatDate: (dateString: string | null) => string;
  getStatusBadge: (status: string | null) => JSX.Element;
  updateStatus: UpdateStatusFunc; // Use the defined type
}

const ApplicationTable = ({
  applications,
  formatCurrency,
  formatDate,
  getStatusBadge,
  updateStatus // This now expects the mutation function
}: ApplicationTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>List of loan eligibility assessments</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Amount Req.</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No assessments found in this category
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.businessName || 'N/A'}</TableCell>
                    <TableCell>{app.fullName}</TableCell>
                    <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
                    <TableCell>{app.loanTerm ? `${app.loanTerm} months` : 'N/A'}</TableCell>
                    <TableCell>{formatDate(app.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {app.eligibilityScore !== null && app.eligibilityScore !== undefined ? (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              app.eligibilityScore >= 80 ? 'bg-green-100 text-green-800' :
                              app.eligibilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {app.eligibilityScore}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          // TODO: Add navigation to a detail view
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                        {/* Show Approve/Reject only if status is pending or completed */}
                        {(app.status === 'pending' || app.status === 'completed') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateStatus({ id: app.id, status: 'approved' })} // Pass object
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => updateStatus({ id: app.id, status: 'rejected' })} // Pass object
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
