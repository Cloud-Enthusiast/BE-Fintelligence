
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useApplications } from '@/contexts/ApplicationContext';
import { 
  BarChart3Icon, 
  AlertTriangleIcon, 
  CircleDollarSignIcon, 
  TrendingUpIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  UsersIcon,
  ScanTextIcon
} from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Sample data
const loanPerformanceData = [
  { name: 'Jan', approved: 65, rejected: 12 },
  { name: 'Feb', approved: 59, rejected: 15 },
  { name: 'Mar', approved: 80, rejected: 8 },
  { name: 'Apr', approved: 81, rejected: 9 },
  { name: 'May', approved: 56, rejected: 17 },
  { name: 'Jun', approved: 55, rejected: 15 },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { applications } = useApplications();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter applications by status
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatsCard 
                title="Pending Applications" 
                value={pendingApplications.length.toString()} 
                description="Applications awaiting review"
                icon={<ClockIcon className="h-5 w-5 text-blue-600" />}
                trend="+2 since yesterday"
                trendUp={true}
                linkTo="/applications?tab=pending"
              />
              <StatsCard 
                title="Approved Loans" 
                value={approvedApplications.length.toString()} 
                description="Applications approved this month"
                icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
                trend="+8% from last month"
                trendUp={true}
                linkTo="/applications?tab=approved"
              />
              <StatsCard 
                title="Rejected Applications" 
                value={rejectedApplications.length.toString()}
                description="Applications rejected this month"
                icon={<XCircleIcon className="h-5 w-5 text-red-600" />}
                trend="-3% from last month"
                trendUp={false}
                linkTo="/applications?tab=rejected"
              />
            </div>
            
            {/* Quick Access Cards */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <QuickAccessCard 
                title="Manage Applications" 
                description="Review and process loan applications"
                icon={<FileTextIcon className="h-8 w-8 text-blue-600" />}
                linkTo="/applications"
              />
              <QuickAccessCard 
                title="View Analytics" 
                description="Monitor lending performance metrics"
                icon={<BarChart3Icon className="h-8 w-8 text-purple-600" />}
                linkTo="/analytics"
              />
              <QuickAccessCard 
                title="Customer Directory" 
                description="Manage customer profiles and history"
                icon={<UsersIcon className="h-8 w-8 text-green-600" />}
                linkTo="/customers"
              />
              <QuickAccessCard 
                title="Document Processor" 
                description="Extract text and data from documents"
                icon={<ScanTextIcon className="h-8 w-8 text-orange-600" />}
                linkTo="/document-processor"
              />
            </div>
            

            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pending Applications */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Pending Applications</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/applications?tab=pending">View All</Link>
                    </Button>
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
                        {pendingApplications.slice(0, 4).map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="py-3 text-sm">APP-{app.id.slice(0, 5)}</td>
                            <td className="py-3 text-sm font-medium">{app.businessName}</td>
                            <td className="py-3 text-sm">${app.loanAmount.toLocaleString()}</td>
                            <td className="py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                app.eligibilityScore >= 80 ? 'bg-green-100 text-green-800' :
                                app.eligibilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {app.eligibilityScore >= 80 ? 'low' : 
                                 app.eligibilityScore >= 60 ? 'medium' : 'high'}
                              </span>
                            </td>
                            <td className="py-3 text-sm">
                              <Link 
                                to={`/application-review/${app.id}`}
                                className="text-finance-600 hover:text-finance-800 font-medium"
                              >
                                Review Application
                              </Link>
                            </td>
                          </tr>
                        ))}

                        {pendingApplications.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500">
                              No pending applications
                            </td>
                          </tr>
                        )}
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
                    {rejectedApplications.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                        <div className="rounded-full p-2 mr-3 bg-red-100">
                          <AlertTriangleIcon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.businessName}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              high
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.rejectionReason || "Risk factors detected"}</p>
                        </div>
                      </div>
                    ))}

                    {rejectedApplications.length === 0 && (
                      <div className="py-6 text-center text-gray-500">
                        No risk alerts
                      </div>
                    )}
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
  linkTo?: string;
}

const StatsCard = ({ title, value, description, icon, trend, trendUp, linkTo }: StatsCardProps) => {
  const content = (
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
  );

  if (linkTo) {
    return (
      <Card className="transition hover:shadow-md">
        <Link to={linkTo} className="block h-full">
          {content}
        </Link>
      </Card>
    );
  }

  return <Card>{content}</Card>;
};

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}

const QuickAccessCard = ({ title, description, icon, linkTo }: QuickAccessCardProps) => (
  <Card className="overflow-hidden transition hover:shadow-md">
    <Link to={linkTo} className="block h-full">
      <CardContent className="p-6 flex gap-4 items-center">
        <div className="rounded-full bg-gray-100 p-3">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Link>
  </Card>
);

export default Dashboard;
