import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchAssessments, MappedAssessment } from '@/hooks/useFetchAssessments';
import { useUpdateAssessmentStatus } from '@/hooks/useUpdateAssessmentStatus';
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
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, EyeIcon, Loader2, PlusIcon, FileTextIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface UpdateStatusPayload {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
}
type UpdateStatusFunc = (payload: UpdateStatusPayload) => void;

const Applications = () => {
  const { user } = useAuth();
  const { data: assessments, isLoading, error } = useFetchAssessments();
  const { mutate: updateStatusMutation } = useUpdateAssessmentStatus();

  const formatCurrency = useMemo(() => (amount: number | null): string => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useMemo(() => (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
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
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Review Ready</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }, []);

  const filteredApplications = useMemo(() => {
    const all = assessments || [];
    const pending = all.filter(app => app.status === 'pending');
    const approved = all.filter(app => app.status === 'approved');
    const rejected = all.filter(app => app.status === 'rejected');
    return { all, pending, approved, rejected };
  }, [assessments]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium animate-pulse">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="max-w-md p-8 text-center bg-destructive/5 border border-destructive/20 rounded-xl space-y-4">
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <XCircleIcon className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Failed to Load Data</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Loan Applications</h1>
            <p className="text-muted-foreground mt-1">Review and manage loan eligibility assessments</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button onClick={() => window.location.href = '/create-application'} className="hover-lift gap-2" data-tour="new-app-button">
              <PlusIcon className="h-4 w-4" /> New Application
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
              <CardTitle className="text-lg">Application Overview</CardTitle>
              <CardDescription>Metrics based on current assessment statuses</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <p className="text-amber-800 dark:text-amber-400 text-sm font-medium mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-50">{filteredApplications.pending.length}</p>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full">
                    <AlertCircleIcon className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <p className="text-emerald-800 dark:text-emerald-400 text-sm font-medium mb-1">Approved</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-50">{filteredApplications.approved.length}</p>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-full">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                  </div>
                </div>

                <div className="bg-destructive/5 p-5 rounded-xl border border-destructive/10 flex items-center justify-between transition-all hover:shadow-md">
                  <div>
                    <p className="text-destructive text-sm font-medium mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-foreground">{filteredApplications.rejected.length}</p>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-full">
                    <XCircleIcon className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Table */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 w-full max-w-md h-auto p-1 bg-muted/50">
            <TabsTrigger value="all" className="flex-1 py-2 text-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 py-2 text-sm">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 py-2 text-sm">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 py-2 text-sm">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ApplicationTable
              applications={filteredApplications.all}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              updateStatus={updateStatusMutation}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <ApplicationTable
              applications={filteredApplications.pending}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              updateStatus={updateStatusMutation}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            <ApplicationTable
              applications={filteredApplications.approved}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              updateStatus={updateStatusMutation}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-0">
            <ApplicationTable
              applications={filteredApplications.rejected}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              updateStatus={updateStatusMutation}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

interface ApplicationTableProps {
  applications: MappedAssessment[];
  formatCurrency: (amount: number | null) => string;
  formatDate: (dateString: string | null) => string;
  getStatusBadge: (status: string | null) => JSX.Element;
  updateStatus: UpdateStatusFunc;
}

const ApplicationTable = ({
  applications,
  formatCurrency,
  formatDate,
  getStatusBadge,
  updateStatus
}: ApplicationTableProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold px-6 py-4">Business Name</TableHead>
                <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
                <TableHead className="font-semibold px-6 py-4">Amount Req.</TableHead>
                <TableHead className="font-semibold px-6 py-4">Term</TableHead>
                <TableHead className="font-semibold px-6 py-4">Submitted</TableHead>
                <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                <TableHead className="font-semibold px-6 py-4">Score</TableHead>
                <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileTextIcon className="h-8 w-8 text-muted-foreground/30" />
                      <p>No assessments found in this category</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="font-medium text-foreground px-6 py-4">{app.business_name || 'N/A'}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">{app.full_name}</TableCell>
                    <TableCell className="px-6 py-4 font-mono font-medium">{formatCurrency(app.loan_amount)}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">{app.loan_term ? `${app.loan_term} mo` : 'N/A'}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatDate(app.created_at)}</TableCell>
                    <TableCell className="px-6 py-4">{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="px-6 py-4">
                      {app.eligibility_score !== null && app.eligibility_score !== undefined ? (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border shadow-sm ${app.eligibility_score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              app.eligibility_score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-destructive/10 text-destructive border-destructive/20'
                            }`}
                        >
                          {app.eligibility_score}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground border-border/50">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 hover:bg-muted/50"
                          onClick={() => navigate(`/application-review/${app.id}`)}
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 border border-transparent hover:border-emerald-200 hover:bg-emerald-50"
                              onClick={() => updateStatus({ id: app.id, status: 'approved' })}
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive border border-transparent hover:border-destructive/30 hover:bg-destructive/10"
                              onClick={() => updateStatus({ id: app.id, status: 'rejected' })}
                              title="Reject"
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
