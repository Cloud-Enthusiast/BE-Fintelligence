
import { useState, useMemo } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { ChartContainer } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const { applications } = useApplications();

  // Calculate analytics data
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  const totalLoanAmount = applications.reduce((sum, app) => sum + app.loanAmount, 0);
  const approvedLoanAmount = applications
    .filter(app => app.status === 'approved')
    .reduce((sum, app) => sum + app.loanAmount, 0);

  // Data for charts
  const statusData = [
    { name: 'Approved', value: approvedApplications },
    { name: 'Pending', value: pendingApplications },
    { name: 'Rejected', value: rejectedApplications },
  ];

  // Colors matching the new brand system
  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Emerald, Amber, Red

  // Monthly application data (sample)
  const monthlyData = [
    { name: 'Jan', applications: 8, approved: 5, rejected: 3 },
    { name: 'Feb', applications: 12, approved: 7, rejected: 5 },
    { name: 'Mar', applications: 15, approved: 10, rejected: 5 },
    { name: 'Apr', applications: 10, approved: 6, rejected: 4 },
    { name: 'May', applications: 18, approved: 12, rejected: 6 },
    { name: 'Jun', applications: 15, approved: 9, rejected: 6 },
  ];

  // Business type distribution
  const businessTypes = applications.reduce((acc: Record<string, number>, app) => {
    // Handling case where businessType might be undefined
    const type = app.businessType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const businessTypeData = Object.entries(businessTypes).map(([name, value]) => ({
    name,
    value,
  }));

  // Loan amount range distribution
  const loanRangeData = [
    { name: '<$100k', applications: 0 },
    { name: '$100k-$250k', applications: 0 },
    { name: '$250k-$500k', applications: 0 },
    { name: '$500k-$1M', applications: 0 },
    { name: '>$1M', applications: 0 },
  ];

  applications.forEach(app => {
    if (app.loanAmount < 100000) {
      loanRangeData[0].applications++;
    } else if (app.loanAmount < 250000) {
      loanRangeData[1].applications++;
    } else if (app.loanAmount < 500000) {
      loanRangeData[2].applications++;
    } else if (app.loanAmount < 1000000) {
      loanRangeData[3].applications++;
    } else {
      loanRangeData[4].applications++;
    }
  });

  const chartConfig = {
    approved: {
      label: 'Approved',
      theme: {
        light: '#10b981',
        dark: '#10b981',
      },
    },
    rejected: {
      label: 'Rejected',
      theme: {
        light: '#ef4444',
        dark: '#ef4444',
      },
    },
    applications: {
      label: 'Applications',
      theme: {
        light: '#0f172a',
        dark: '#94a3b8',
      },
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor application performance, trends, and business insights.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{totalApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-emerald-600">
                {totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {approvedApplications} out of {totalApplications} applications
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requested Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {formatCurrency(totalLoanAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total requested amount</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-emerald-600">
                {formatCurrency(approvedLoanAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalLoanAmount > 0 ? Math.round((approvedLoanAmount / totalLoanAmount) * 100) : 0}% of total requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 w-full max-w-md h-auto p-1 bg-muted/50">
            <TabsTrigger value="overview" className="flex-1 py-2 text-sm">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1 py-2 text-sm">Trends</TabsTrigger>
            <TabsTrigger value="business" className="flex-1 py-2 text-sm">Business Types</TabsTrigger>
            <TabsTrigger value="amounts" className="flex-1 py-2 text-sm">Loan Amounts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Application Status</CardTitle>
                  <CardDescription>Overall distribution of application outcomes</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={5}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Monthly Applications</CardTitle>
                  <CardDescription>Volume of applications submitted over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[350px]">
                    <ChartContainer config={chartConfig}>
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="applications"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorApplications)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Approval Trends</CardTitle>
                <CardDescription>Monthly breakdown of approvals vs rejections</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                      <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Types Tab */}
          <TabsContent value="business" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Business Type Distribution</CardTitle>
                <CardDescription>Volume of applications categorized by industry</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={businessTypeData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="value" fill="#6366f1" name="Applications" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Amounts Tab */}
          <TabsContent value="amounts" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Loan Amount Distribution</CardTitle>
                <CardDescription>Applications segmented by requested funding range</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loanRangeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="applications" fill="#0ea5e9" name="Applications" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Analytics;
