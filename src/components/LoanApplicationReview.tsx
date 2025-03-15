
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface LoanApplicationReviewProps {
  applicationId?: string;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
}

// Mock data for UI demonstration (would be fetched from backend)
const mockApplicationData = {
  id: 'APP-2023-005',
  applicantName: 'John Smith',
  panId: 'ABCTY1234Z',
  email: 'john.smith@example.com',
  annualIncome: 750000,
  monthlyIncome: 62500,
  creditScore: 720,
  loanAmount: 2500000,
  loanTenure: 60, // months
  loanPurpose: 'Business Expansion',
  submittedAt: '2023-06-10T10:30:00Z',
  
  // Risk assessment
  financialRiskScore: 78,
  behavioralCreditScore: 82,
  fraudAlerts: [
    { level: 'low', message: 'Minor discrepancy in reported address' }
  ],
  
  // Stress test results
  incomeShockResilience: 65,
  interestRateSensitivity: 72,
  emergencyFundBuffer: 45,
  debtServiceRatio: 38
};

const LoanApplicationReview = ({ 
  applicationId, 
  onApprove, 
  onReject, 
  onRequestInfo 
}: LoanApplicationReviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<typeof mockApplicationData | null>(null);
  
  // Simulating data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplication(mockApplicationData);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [applicationId]);
  
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-pulse">Loading application data...</div>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="w-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Application Not Found</h3>
        <p className="text-gray-500">The requested application could not be found.</p>
      </div>
    );
  }
  
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Loan Application Review
          </h2>
          <p className="text-gray-500">Application ID: {application.id}</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Submitted on {new Date(application.submittedAt).toLocaleDateString()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Applicant Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Applicant Details</CardTitle>
            <CardDescription>Basic information and loan request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src="/avatar-placeholder.png" alt={application.applicantName} />
                <AvatarFallback>{application.applicantName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{application.applicantName}</h3>
                <p className="text-sm text-gray-500">{application.email}</p>
                <div className="flex items-center mt-1 text-sm">
                  <span className="font-medium">PAN/ID:</span>
                  <span className="ml-2">{application.panId}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Annual Income</span>
                <span className="font-medium">{formatCurrency(application.annualIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Monthly Income</span>
                <span className="font-medium">{formatCurrency(application.monthlyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Credit Score</span>
                <span className={cn(
                  "font-medium",
                  application.creditScore >= 700 ? "text-green-600" : 
                  application.creditScore >= 600 ? "text-yellow-600" : "text-red-600"
                )}>
                  {application.creditScore}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Loan Amount</span>
                <span className="font-medium">{formatCurrency(application.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Loan Tenure</span>
                <span className="font-medium">{application.loanTenure} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Purpose</span>
                <span className="font-medium">{application.loanPurpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Debt Service Ratio</span>
                <span className={cn(
                  "font-medium",
                  application.debtServiceRatio <= 30 ? "text-green-600" : 
                  application.debtServiceRatio <= 45 ? "text-yellow-600" : "text-red-600"
                )}>
                  {application.debtServiceRatio}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Center Panel - AI Risk Assessment */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI Risk Assessment</CardTitle>
            <CardDescription>AI-powered risk evaluation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Financial Risk Score</span>
                  <span className="text-sm font-medium">{application.financialRiskScore}/100</span>
                </div>
                <div className="relative">
                  <Progress value={application.financialRiskScore} className="h-2" />
                  <span className={cn(
                    "absolute px-2 py-0.5 text-xs font-medium text-white rounded-md -top-1 transform -translate-y-full",
                    getRiskColor(application.financialRiskScore)
                  )}
                  style={{ left: `${Math.min(Math.max(application.financialRiskScore - 10, 0), 90)}%` }}>
                    {getScoreLabel(application.financialRiskScore)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  The applicant's financial risk score indicates 
                  {application.financialRiskScore >= 80 ? " strong financial stability." : 
                   application.financialRiskScore >= 60 ? " moderate financial stability." : 
                   " potential financial vulnerability."}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Behavioral Credit Score</span>
                  <span className="text-sm font-medium">{application.behavioralCreditScore}/100</span>
                </div>
                <div className="relative">
                  <Progress value={application.behavioralCreditScore} className="h-2" />
                  <span className={cn(
                    "absolute px-2 py-0.5 text-xs font-medium text-white rounded-md -top-1 transform -translate-y-full",
                    getRiskColor(application.behavioralCreditScore)
                  )}
                  style={{ left: `${Math.min(Math.max(application.behavioralCreditScore - 10, 0), 90)}%` }}>
                    {getScoreLabel(application.behavioralCreditScore)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Based on payment history and credit utilization patterns, this score reflects the applicant's repayment behavior.
                </p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="text-base font-medium mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Fraud Detection Alerts
              </h4>
              
              {application.fraudAlerts.length > 0 ? (
                <ul className="space-y-2">
                  {application.fraudAlerts.map((alert, index) => (
                    <li key={index} className="flex items-start">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mr-2",
                        alert.level === 'high' ? "bg-red-100" :
                        alert.level === 'medium' ? "bg-yellow-100" : "bg-blue-100"
                      )}>
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          alert.level === 'high' ? "bg-red-500" :
                          alert.level === 'medium' ? "bg-yellow-500" : "bg-blue-500"
                        )} />
                      </div>
                      <span className="text-sm">
                        <span className={cn(
                          "font-medium mr-1",
                          alert.level === 'high' ? "text-red-600" :
                          alert.level === 'medium' ? "text-yellow-600" : "text-blue-600"
                        )}>
                          {alert.level.charAt(0).toUpperCase() + alert.level.slice(1)}:
                        </span>
                        {alert.message}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">No fraud indicators detected</span>
                </div>
              )}
            </div>
            
            <div className="rounded-lg bg-white border border-gray-200 p-4">
              <h4 className="text-base font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                AI Recommendation
              </h4>
              <p className="text-sm text-gray-600">
                Based on comprehensive analysis, this application presents a 
                {
                  (application.financialRiskScore + application.behavioralCreditScore) / 2 >= 75 ? 
                  " low overall risk profile. Approval recommended." : 
                  (application.financialRiskScore + application.behavioralCreditScore) / 2 >= 60 ? 
                  " moderate risk profile. Further review suggested." :
                  " high risk profile. Rejection or significant risk mitigation recommended."
                }
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Panel - Stress Test Results */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Stress Test Analysis</CardTitle>
            <CardDescription>AI-driven resilience assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Income Shock Resilience</span>
                <span className="text-sm font-medium">{application.incomeShockResilience}%</span>
              </div>
              <Progress 
                value={application.incomeShockResilience} 
                className={cn(
                  "h-2",
                  application.incomeShockResilience >= 70 ? "bg-green-500" : 
                  application.incomeShockResilience >= 40 ? "bg-yellow-500" : "bg-red-500"
                )} 
              />
              <p className="mt-2 text-xs text-gray-500">
                Ability to withstand a 20% reduction in income for 6 months
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Interest Rate Sensitivity</span>
                <span className="text-sm font-medium">{application.interestRateSensitivity}%</span>
              </div>
              <Progress 
                value={application.interestRateSensitivity} 
                className={cn(
                  "h-2",
                  application.interestRateSensitivity >= 70 ? "bg-green-500" : 
                  application.interestRateSensitivity >= 40 ? "bg-yellow-500" : "bg-red-500"
                )} 
              />
              <p className="mt-2 text-xs text-gray-500">
                Resilience to a 2% interest rate hike
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Emergency Fund Buffer</span>
                <span className="text-sm font-medium">{application.emergencyFundBuffer}%</span>
              </div>
              <Progress 
                value={application.emergencyFundBuffer} 
                className={cn(
                  "h-2",
                  application.emergencyFundBuffer >= 70 ? "bg-green-500" : 
                  application.emergencyFundBuffer >= 40 ? "bg-yellow-500" : "bg-red-500"
                )} 
              />
              <p className="mt-2 text-xs text-gray-500">
                Availability of emergency funds relative to 3 months of expenses
              </p>
            </div>
            
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mt-4">
              <h4 className="text-base font-medium mb-3">Stress Test Findings</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className={application.incomeShockResilience >= 60 ? "text-green-500" : "text-red-500"}>
                    {application.incomeShockResilience >= 60 ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Income Stability: </span>
                    {application.incomeShockResilience >= 60 
                      ? "The applicant can maintain payments even with temporary income reduction."
                      : "The applicant may struggle with payments if income decreases temporarily."}
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className={application.interestRateSensitivity >= 60 ? "text-green-500" : "text-red-500"}>
                    {application.interestRateSensitivity >= 60 ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Rate Sensitivity: </span>
                    {application.interestRateSensitivity >= 60 
                      ? "The loan remains affordable even if interest rates increase."
                      : "Rising interest rates could significantly impact affordability."}
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className={application.emergencyFundBuffer >= 60 ? "text-green-500" : "text-red-500"}>
                    {application.emergencyFundBuffer >= 60 ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Emergency Preparedness: </span>
                    {application.emergencyFundBuffer >= 60 
                      ? "Sufficient emergency funds available to cover unexpected expenses."
                      : "Limited emergency funds could lead to payment difficulties."}
                  </div>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Decision Actions */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Loan Decision</h3>
            <p className="text-sm text-gray-500">Review the application and take appropriate action</p>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={onRequestInfo}>
              Request More Information
            </Button>
            <Button variant="destructive" onClick={onReject}>
              Reject Application
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={onApprove}
            >
              Approve Loan
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanApplicationReview;
