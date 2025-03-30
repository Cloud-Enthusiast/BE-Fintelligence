
import { useState } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
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
  const { user, logout } = useAuth();
  const { applications } = useApplications();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  const COLORS = ['#4caf50', '#ffb74d', '#ef5350'];

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
    acc[app.businessType] = (acc[app.businessType] || 0) + 1;
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
        light: '#4caf50',
        dark: '#4caf50',
      },
    },
    rejected: {
      label: 'Rejected',
      theme: {
        light: '#ef5350',
        dark: '#ef5350',
      },
    },
    applications: {
      label: 'Applications',
      theme: {
        light: '#2196f3',
        dark: '#2196f3',
      },
    },
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Monitor application performance and trends</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalApplications}</div>
                  <p className="text-xs text-gray-500 mt-1">All time submissions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Approved Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {approvedApplications} out of {totalApplications} applications
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Loan Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(totalLoanAmount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total requested amount</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Approved Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(approvedLoanAmount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((approvedLoanAmount / totalLoanAmount) * 100)}% of total requests
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4 w-full max-w-md">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
                <TabsTrigger value="business" className="flex-1">Business Types</TabsTrigger>
                <TabsTrigger value="amounts" className="flex-1">Loan Amounts</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Application Status</CardTitle>
                      <CardDescription>Distribution of application statuses</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Monthly Applications</CardTitle>
                      <CardDescription>Application trends over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-80">
                        <ChartContainer config={chartConfig}>
                          <AreaChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="applications" 
                              stackId="1"
                              stroke="var(--color-applications)" 
                              fill="var(--color-applications)"
                              fillOpacity={0.3} 
                            />
                          </AreaChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Trends Tab */}
              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Application Trends</CardTitle>
                    <CardDescription>Monthly application approvals and rejections</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <ChartContainer config={chartConfig}>
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="approved" fill="var(--color-approved)" name="Approved" />
                          <Bar dataKey="rejected" fill="var(--color-rejected)" name="Rejected" />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Business Types Tab */}
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Business Type Distribution</CardTitle>
                    <CardDescription>Applications by business category</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={businessTypeData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" name="Applications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Loan Amounts Tab */}
              <TabsContent value="amounts">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Loan Amount Distribution</CardTitle>
                    <CardDescription>Applications by requested loan amount</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={loanRangeData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
