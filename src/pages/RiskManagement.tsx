
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { 
  AlertTriangleIcon, 
  TrendingDownIcon, 
  ShieldAlertIcon,
  DollarSignIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';

const RiskManagement = () => {
  const { user, logout } = useAuth();
  const { applications } = useApplications();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate risk metrics
  const highRiskApps = applications.filter(app => app.eligibilityScore < 60);
  const mediumRiskApps = applications.filter(app => app.eligibilityScore >= 60 && app.eligibilityScore < 80);
  const lowRiskApps = applications.filter(app => app.eligibilityScore >= 80);
  
  const totalPortfolioValue = applications
    .filter(app => app.status === 'approved')
    .reduce((sum, app) => sum + app.loanAmount, 0);

  const riskAlerts = [
    {
      id: '1',
      type: 'high',
      title: 'Portfolio Concentration Risk',
      description: 'Over 40% of approved loans are in the retail sector',
      timestamp: '2 hours ago',
      action: 'Review sector diversification'
    },
    {
      id: '2',
      type: 'medium', 
      title: 'Credit Score Trend',
      description: 'Average applicant credit score decreased by 15 points this month',
      timestamp: '1 day ago',
      action: 'Tighten credit requirements'
    },
    {
      id: '3',
      type: 'low',
      title: 'Default Rate Update',
      description: 'Monthly default rate within acceptable range at 2.1%',
      timestamp: '2 days ago',
      action: 'Continue monitoring'
    }
  ];

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'high': return <AlertTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'medium': return <AlertCircleIcon className="h-5 w-5 text-yellow-600" />;
      case 'low': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      default: return <AlertCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          onSidebarToggle={handleSidebarToggle}
        />
        
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Risk Management</h1>
              <p className="text-gray-600">Monitor and manage loan portfolio risks</p>
            </div>

            {/* Risk Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">High Risk Applications</h3>
                    <AlertTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">{highRiskApps.length}</div>
                  <p className="text-sm text-gray-600">{'Score < 60'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Medium Risk Applications</h3>
                    <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{mediumRiskApps.length}</div>
                  <p className="text-sm text-gray-600">Score 60-79</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Low Risk Applications</h3>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{lowRiskApps.length}</div>
                  <p className="text-sm text-gray-600">Score ≥ 80</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
                    <DollarSignIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total approved loans</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="alerts" className="space-y-6">
              <TabsList>
                <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
                <TabsTrigger value="applications">Risk Applications</TabsTrigger>
                <TabsTrigger value="metrics">Risk Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="alerts">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Risk Alerts</CardTitle>
                    <CardDescription>Recent risk notifications requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50">
                          <div className="mr-3 mt-1">
                            {getRiskIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge className={getRiskColor(alert.type)}>{alert.type} risk</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{alert.timestamp}</span>
                              <Button size="sm" variant="outline">{alert.action}</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>High Risk Applications</CardTitle>
                    <CardDescription>Applications requiring additional review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-2 text-sm font-medium text-gray-500">Business Name</th>
                            <th className="pb-2 text-sm font-medium text-gray-500">Loan Amount</th>
                            <th className="pb-2 text-sm font-medium text-gray-500">Risk Score</th>
                            <th className="pb-2 text-sm font-medium text-gray-500">Status</th>
                            <th className="pb-2 text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {highRiskApps.slice(0, 5).map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50">
                              <td className="py-3 text-sm font-medium">{app.businessName}</td>
                              <td className="py-3 text-sm">${app.loanAmount.toLocaleString()}</td>
                              <td className="py-3 text-sm">
                                <Badge className="bg-red-100 text-red-800">{app.eligibilityScore}/100</Badge>
                              </td>
                              <td className="py-3 text-sm">
                                <Badge variant={app.status === 'approved' ? 'default' : 'secondary'}>
                                  {app.status}
                                </Badge>
                              </td>
                              <td className="py-3 text-sm">
                                <Button size="sm" variant="outline">Review</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Distribution</CardTitle>
                      <CardDescription>Current portfolio risk breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">High Risk</span>
                          <span className="text-sm font-medium">{((highRiskApps.length / applications.length) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(highRiskApps.length / applications.length) * 100}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Medium Risk</span>
                          <span className="text-sm font-medium">{((mediumRiskApps.length / applications.length) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(mediumRiskApps.length / applications.length) * 100}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Low Risk</span>
                          <span className="text-sm font-medium">{((lowRiskApps.length / applications.length) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(lowRiskApps.length / applications.length) * 100}%` }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Thresholds</CardTitle>
                      <CardDescription>Current risk assessment parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium">High Risk Threshold</span>
                          <span className="text-sm text-red-600">{'Score < 60'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium">Medium Risk Threshold</span>
                          <span className="text-sm text-yellow-600">Score 60-79</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium">Low Risk Threshold</span>
                          <span className="text-sm text-green-600">Score ≥ 80</span>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Update Thresholds
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default RiskManagement;
