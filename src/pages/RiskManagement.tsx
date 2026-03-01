
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangleIcon,
  DollarSignIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldQuestionIcon
} from 'lucide-react';
import { generateRiskAlerts } from '@/utils/riskScoring';

const RiskManagement = () => {
  const { user } = useAuth();
  const { applications } = useApplications();

  // Calculate risk metrics
  const highRiskApps = applications.filter(app => app.eligibilityScore < 60);
  const mediumRiskApps = applications.filter(app => app.eligibilityScore >= 60 && app.eligibilityScore < 80);
  const lowRiskApps = applications.filter(app => app.eligibilityScore >= 80);

  const totalPortfolioValue = applications
    .filter(app => app.status === 'approved')
    .reduce((sum, app) => sum + app.loanAmount, 0);

  // Get dynamic risk alerts from applications
  const riskAlerts = generateRiskAlerts(applications);

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-destructive/10 text-destructive border-transparent';
      case 'medium': return 'bg-amber-50 text-amber-700 border-transparent';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-transparent';
      default: return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  const getRiskIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case 'medium': return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'high': return <AlertCircleIcon className="h-5 w-5 text-destructive" />;
      case 'critical': return <ShieldAlertIcon className="h-5 w-5 text-destructive" />;
      default: return <ShieldQuestionIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Risk Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage loan portfolio risks</p>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">High Risk Apps</h3>
                <div className="rounded-full bg-destructive/10 p-2 transition-colors group-hover:bg-destructive/20">
                  <AlertTriangleIcon className="h-4 w-4 text-destructive" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-destructive">{highRiskApps.length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Score &lt; 60</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Medium Risk Apps</h3>
                <div className="rounded-full bg-amber-500/10 p-2 transition-colors group-hover:bg-amber-500/20">
                  <AlertCircleIcon className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-amber-600">{mediumRiskApps.length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Score 60-79</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Low Risk Apps</h3>
                <div className="rounded-full bg-emerald-500/10 p-2 transition-colors group-hover:bg-emerald-500/20">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-emerald-600">{lowRiskApps.length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Score &ge; 80</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm md:col-span-1 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Portfolio Value</h3>
                <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                  <DollarSignIcon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-foreground">₹{totalPortfolioValue.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Total approved loans</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full sm:w-auto overflow-x-auto flex whitespace-nowrap hide-scrollbar">
            <TabsTrigger value="alerts" className="rounded-md">Risk Alerts</TabsTrigger>
            <TabsTrigger value="applications" className="rounded-md">Risk Applications</TabsTrigger>
            <TabsTrigger value="metrics" className="rounded-md">Risk Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                <CardTitle className="text-lg">Active Risk Alerts</CardTitle>
                <CardDescription>Recent risk notifications requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {riskAlerts.length > 0 ? (
                    riskAlerts.map((alert) => (
                      <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center p-6 hover:bg-muted/30 transition-colors">
                        <div className="mb-4 sm:mb-0 mr-4 mt-0.5 shrink-0 bg-background rounded-full p-2 border border-border/50 shadow-sm">
                          {getRiskIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-foreground">{alert.title}</h4>
                            <Badge variant="secondary" className={getRiskColor(alert.severity)}>{alert.severity} risk</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 sm:mb-0">{alert.description} for {alert.businessName}</p>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2 mt-4 sm:mt-0 shrink-0">
                          <span className="text-xs font-medium text-muted-foreground">{formatTime(alert.timestamp)}</span>
                          <Button size="sm" variant="outline" className="h-8 shadow-sm">{alert.actionRequired ? 'Immediate Action' : 'Monitor'}</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <ShieldCheckIcon className="h-12 w-12 text-emerald-500/20 mx-auto mb-3" />
                      <p className="text-muted-foreground">No active risk alerts found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-0">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                <CardTitle className="text-lg">High Risk Applications</CardTitle>
                <CardDescription>Applications requiring additional review</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-border/50 bg-muted/30 text-muted-foreground">
                        <th className="font-semibold px-6 py-4">Business Name</th>
                        <th className="font-semibold px-6 py-4">Loan Amount</th>
                        <th className="font-semibold px-6 py-4">Risk Score</th>
                        <th className="font-semibold px-6 py-4">Status</th>
                        <th className="font-semibold px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {highRiskApps.slice(0, 5).map((app) => (
                        <tr key={app.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4 font-medium text-foreground">{app.businessName}</td>
                          <td className="px-6 py-4 font-medium text-muted-foreground">₹{app.loanAmount.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-transparent font-bold">
                              {app.eligibilityScore}/100
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={app.status === 'approved' ? 'default' : 'secondary'} className={app.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">Read</Button>
                          </td>
                        </tr>
                      ))}
                      {highRiskApps.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-muted-foreground">
                            No high risk applications at this time.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="mt-0 tracking-tight">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="text-lg">Risk Distribution</CardTitle>
                  <CardDescription>Current portfolio risk breakdown</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-foreground">High Risk</span>
                        <span className="font-bold text-destructive">{((highRiskApps.length / Math.max(applications.length, 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div className="bg-destructive h-full rounded-full transition-all duration-500" style={{ width: `${(highRiskApps.length / Math.max(applications.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-foreground">Medium Risk</span>
                        <span className="font-bold text-amber-600">{((mediumRiskApps.length / Math.max(applications.length, 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(mediumRiskApps.length / Math.max(applications.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-foreground">Low Risk</span>
                        <span className="font-bold text-emerald-600">{((lowRiskApps.length / Math.max(applications.length, 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(lowRiskApps.length / Math.max(applications.length, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
                  <CardTitle className="text-lg">Risk Thresholds</CardTitle>
                  <CardDescription>Current risk assessment parameters</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                      <span className="text-sm font-semibold text-foreground">High Risk Threshold</span>
                      <span className="text-sm font-bold text-destructive">{'Score < 60'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                      <span className="text-sm font-semibold text-foreground">Medium Risk Threshold</span>
                      <span className="text-sm font-bold text-amber-600">Score 60-79</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <span className="text-sm font-semibold text-foreground">Low Risk Threshold</span>
                      <span className="text-sm font-bold text-emerald-600">Score &ge; 80</span>
                    </div>
                    <div className="pt-4">
                      <Button className="w-full shadow-sm" variant="outline">
                        Configure Thresholds
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default RiskManagement;
