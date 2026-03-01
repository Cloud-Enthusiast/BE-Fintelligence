import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplications } from '@/contexts/ApplicationContext';
import { useTour } from '@/components/Tour/TourContext';
import { ONBOARDING_TOUR } from '@/components/Tour/tours';
import {
  BarChart3Icon,
  AlertTriangleIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  UsersIcon,
  ScanTextIcon,
  ChevronRightIcon
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user } = useAuth();
  const { applications } = useApplications();
  const { startTour, isTourSeen } = useTour();

  useEffect(() => {
    if (!isTourSeen('onboarding')) {
      const timer = setTimeout(() => {
        startTour(ONBOARDING_TOUR);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTourSeen, startTour]);

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  // Derive chart data from real applications by month
  const loanPerformanceData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: months[d.getMonth()], year: d.getFullYear(), key: `${d.getFullYear()}-${d.getMonth()}` };
    });
    return last6Months.map(({ month, year, key }) => {
      const [y, m] = key.split('-').map(Number);
      const monthApps = applications.filter(app => {
        if (!app.createdAt) return false;
        const d = new Date(app.createdAt);
        return d.getFullYear() === y && d.getMonth() === m;
      });
      return {
        name: month,
        approved: monthApps.filter(a => a.status === 'approved').length,
        rejected: monthApps.filter(a => a.status === 'rejected').length,
      };
    });
  })();

  const chartConfig = {
    approved: {
      label: 'Approved',
      color: 'hsl(var(--primary))',
    },
    rejected: {
      label: 'Rejected',
      color: 'hsl(var(--destructive))',
    },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, <span className="font-medium text-foreground">{user?.displayName || 'User'}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button asChild className="hover-lift">
              <Link to="/create-application">New Application</Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-tour="dashboard-stats">
          <StatsCard
            title="Pending Applications"
            value={pendingApplications.length.toString()}
            description="Awaiting review"
            icon={<ClockIcon className="h-5 w-5 text-amber-500" />}
            linkTo="/applications?tab=pending"
          />
          <StatsCard
            title="Approved Loans"
            value={approvedApplications.length.toString()}
            description="Total approved"
            icon={<CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
            linkTo="/applications?tab=approved"
          />
          <StatsCard
            title="Rejected Applications"
            value={rejectedApplications.length.toString()}
            description="Total rejected"
            icon={<XCircleIcon className="h-5 w-5 text-destructive" />}
            linkTo="/applications?tab=rejected"
          />
        </div>

        {/* Quick Access Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAccessCard
              title="Manage Applications"
              description="Review and process loan applications"
              icon={<FileTextIcon className="h-6 w-6 text-primary" />}
              linkTo="/applications"
            />
            <QuickAccessCard
              title="View Analytics"
              description="Monitor lending performance metrics"
              icon={<BarChart3Icon className="h-6 w-6 text-secondary" />}
              linkTo="/analytics"
            />
            <QuickAccessCard
              title="Customer Directory"
              description="Manage customer profiles and history"
              icon={<UsersIcon className="h-6 w-6 text-emerald-600" />}
              linkTo="/customers"
            />
            <QuickAccessCard
              title="Doc Processor"
              description="Extract text and data from documents"
              icon={<ScanTextIcon className="h-6 w-6 text-amber-600" />}
              linkTo="/document-processor"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pending Applications */}
          <Card className="lg:col-span-2 border-border/50 shadow-sm" data-tour="dashboard-applications-list">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Pending Applications</CardTitle>
                  <CardDescription>Applications awaiting review</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="h-8 group">
                  <Link to="/applications?tab=pending" className="flex items-center gap-1">
                    View All
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">Business</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Risk Score</th>
                      <th className="px-4 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pendingApplications.slice(0, 4).map((app) => (
                      <tr key={app.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          APP-{app.id.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {app.businessName}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          ₹{app.loanAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={app.eligibilityScore >= 80 ? 'outline' : app.eligibilityScore >= 60 ? 'secondary' : 'destructive'}
                            className={app.eligibilityScore >= 80 ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''}>
                            {app.eligibilityScore >= 80 ? 'Low Risk' : app.eligibilityScore >= 60 ? 'Medium Risk' : 'High Risk'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/application-review/${app.id}`}>
                              Review
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {pendingApplications.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          <CheckCircleIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                          <p>No pending applications to review.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card className="border-border/50 shadow-sm" data-tour="dashboard-risk-alerts">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {rejectedApplications.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>}
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                    Risk Alerts
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {rejectedApplications.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-muted/30 transition-colors flex gap-3">
                    <div className="mt-0.5">
                      <div className="rounded-full p-1.5 bg-destructive/10 text-destructive border border-destructive/20 mt-1">
                        <AlertTriangleIcon className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{alert.businessName}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.rejectionReason || "High risk factors detected requiring manual review."}
                      </p>
                    </div>
                  </div>
                ))}

                {rejectedApplications.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground px-4">
                    <CheckCircleIcon className="h-8 w-8 mx-auto text-emerald-500/50 mb-3" />
                    <p className="text-sm">System is clear. No active risk alerts detected.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Performance Chart */}
        <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg font-semibold">Loan Performance Overview</CardTitle>
            <CardDescription>Approved vs rejected applications over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loanPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} content={<ChartTooltipContent />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Bar dataKey="approved" fill="var(--color-approved)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="rejected" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  linkTo?: string;
}

const StatsCard = ({ title, value, description, icon, trend, trendUp, linkTo }: StatsCardProps) => {
  const content = (
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-full bg-muted/50 p-2 shadow-sm border border-border/50">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
      <div className="flex items-center text-xs">
        {trend ? (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md font-medium mr-2 ${trendUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
            {trendUp ? <TrendingUpIcon className="h-3 w-3 mr-1" /> : <TrendingUpIcon className="h-3 w-3 mr-1 transform rotate-180" />}
            {trend}
          </span>
        ) : null}
        <span className="text-muted-foreground">{description}</span>
      </div>
    </CardContent>
  );

  const wrapperClass = "border-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-1 bg-card group relative overflow-hidden";

  // Add subtle gradient accent at top of card
  const accentGradient = (
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  );

  if (linkTo) {
    return (
      <Card className={wrapperClass}>
        <Link to={linkTo} className="block h-full">
          {accentGradient}
          {content}
        </Link>
      </Card>
    );
  }

  return <Card className={wrapperClass}>{accentGradient}{content}</Card>;
};

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}

const QuickAccessCard = ({ title, description, icon, linkTo }: QuickAccessCardProps) => (
  <Card className="border-border/40 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 group bg-card/50 backdrop-blur-sm">
    <Link to={linkTo} className="block h-full">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="rounded-xl bg-primary/5 w-10 h-10 flex items-center justify-center border border-primary/10 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center">
            {title}
            <ChevronRightIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Link>
  </Card>
);

export default Dashboard;
