import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  BarChart3Icon, 
  AlertTriangleIcon, 
  CircleDollarSignIcon, 
  TrendingUpIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

const loanPerformanceData = [
  { name: 'Jan', approved: 65, rejected: 12 },
  { name: 'Feb', approved: 59, rejected: 15 },
  { name: 'Mar', approved: 80, rejected: 8 },
  { name: 'Apr', approved: 81, rejected: 9 },
  { name: 'May', approved: 56, rejected: 17 },
  { name: 'Jun', approved: 55, rejected: 15 },
];

const pendingApplications = [
  { id: 'APP-2023-001', business: 'Green Valley Farms', amount: 125000, risk: 'low', date: '2023-06-01' },
  { id: 'APP-2023-002', business: 'Tech Innovations Inc.', amount: 350000, risk: 'medium', date: '2023-06-02' },
  { id: 'APP-2023-003', business: 'City Builders LLC', amount: 780000, risk: 'high', date: '2023-06-03' },
  { id: 'APP-2023-004', business: 'Global Shipping Co.', amount: 450000, risk: 'medium', date: '2023-06-03' },
];

const riskAlerts = [
  { id: 'RISK-001', business: 'Oceanview Resorts', issue: 'Declining revenue trend in last 3 quarters', severity: 'high' },
  { id: 'RISK-002', business: 'FastTrack Logistics', issue: 'Recent leadership changes', severity: 'medium' },
  { id: 'RISK-003', business: 'MediTech Solutions', issue: 'Regulatory compliance concerns', severity: 'high' },
];

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const chartConfig = {
    approved: {
      label: 'Approved',
      theme: {
        light: '#4f79b3',
        dark: '#4f79b3',
      },
    },
    rejected: {
      label: 'Rejected',
      theme: {
        light: '#e57373',
        dark: '#e57373',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          onSidebarToggle={handleSidebarToggle} 
          user={{
            name: profile?.full_name || 'User',
            role: profile?.role || 'Unknown',
            avatar: profile?.avatar
          }}
          onLogout={logout}
        />
        
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard 
                title="Pending Applications" 
                value="4" 
                description="Applications awaiting review"
                icon={<ClockIcon className="h-5 w-5 text-blue-600" />}
                trend="+2 since yesterday"
                trendUp={true}
              />
              <StatsCard 
                title="Approved Loans" 
                value="28" 
                description="Applications approved this month"
                icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
                trend="+8% from last month"
                trendUp={true}
              />
              <StatsCard 
                title="Rejected Applications" 
                value="12" 
                description="Applications rejected this month"
                icon={<XCircleIcon className="h-5 w-5 text-red-600" />}
                trend="-3% from last month"
                trendUp={false}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pending Applications */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Pending Applications</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <CardDescription>Applications awaiting review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 text-sm font-medium text-gray-500">ID</th>
                          <th className="pb-2 text-sm font-medium text-gray-500">Business</th>
                          <th className="pb-2 text-sm font-medium text-gray-500">Amount</th>
                          <th className="pb-2 text-sm font-medium text-gray-500">Risk</th>
                          <th className="pb-2 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pendingApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="py-3 text-sm">{app.id}</td>
                            <td className="py-3 text-sm font-medium">{app.business}</td>
                            <td className="py-3 text-sm">${app.amount.toLocaleString()}</td>
                            <td className="py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(app.risk)}`}>
                                {app.risk}
                              </span>
                            </td>
                            <td className="py-3 text-sm">
                              <Button size="sm" variant="outline" className="mr-2">Review</Button>
                              <Link 
                                to="/application-review/APP-2023-005"
                                className="text-finance-600 hover:text-finance-800 font-medium"
                              >
                                Review Application
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Risk Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Risk Alerts</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <CardDescription>AI-generated risk assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                        <div className={`rounded-full p-2 mr-3 ${
                          alert.severity === 'high' ? 'bg-red-100' : 
                          alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <AlertTriangleIcon className={`h-5 w-5 ${
                            alert.severity === 'high' ? 'text-red-600' : 
                            alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.business}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.issue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Loan Performance Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Loan Performance</CardTitle>
                <CardDescription>Approved vs rejected loans over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={loanPerformanceData}>
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
          </motion.div>
        </main>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const StatsCard = ({ title, value, description, icon, trend, trendUp }: StatsCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-500">{title}</h3>
        <div className="rounded-full bg-blue-50 p-2">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center`}>
          {trend}
          {trendUp ? <TrendingUpIcon className="h-3 w-3 ml-1" /> : <TrendingUpIcon className="h-3 w-3 ml-1 transform rotate-180" />}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
