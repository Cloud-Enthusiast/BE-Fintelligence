
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ShieldCheck, 
  UserIcon, 
  CalendarIcon, 
  DollarSignIcon, 
  Gauge, 
  AlertTriangle, 
  Activity, 
  HeartPulse, 
  ThermometerIcon, 
  CloudRainIcon, 
  BadgePercent, 
  BriefcaseIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface LoanApplicationReviewProps {
  applicationId?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestInfo?: () => void;
}

const LoanApplicationReview = ({ 
  applicationId = 'APP-2023-005',
  onApprove,
  onReject,
  onRequestInfo
}: LoanApplicationReviewProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Demo data - would come from API in real implementation
  const applicantData = {
    name: 'John Smith',
    panId: 'ABCDE1234F',
    businessName: 'Smith Enterprises LLC',
    businessType: 'LLC',
    monthlyIncome: 40000,
    annualRevenue: 500000,
    creditScore: 700,
    loanAmount: 250000,
    loanTerm: 36,
    applicationDate: 'June 10, 2023',
    status: 'Under Review'
  };
  
  const riskData = {
    financialRiskScore: 78,
    behavioralCreditScore: 82,
    fraudDetectionLevel: 'Low',
    overallRiskRating: 'Moderate',
    flaggedItems: [
      { id: 1, type: 'info', message: 'Recent change in business address' },
      { id: 2, type: 'warning', message: 'Seasonal fluctuation in revenue stream' }
    ]
  };
  
  const stressTestData = {
    incomeShockResilience: 68,
    interestRateSensitivity: 42,
    emergencyFundBuffer: 86,
    cashFlowStability: 74,
    marketDownturnImpact: 62
  };
  
  // Helper function to determine risk color
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Helper function for alert variant
  const getAlertVariant = (type: string) => {
    return type === 'warning' ? 'destructive' : 'default';
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom Score Indicator component
  const ScoreIndicator = ({ score, label }: { score: number, label: string }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-sm font-semibold ${
          score >= 80 ? 'text-green-600' : 
          score >= 60 ? 'text-yellow-600' : 
          'text-red-600'
        }`}>{score}/100</span>
      </div>
      <div className="relative h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`absolute h-full ${getRiskColor(score)} rounded-full`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Application Header */}
      <div className="bg-gradient-to-r from-finance-600 to-finance-800 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Loan Application Review</h2>
            <p className="text-finance-100">Application ID: {applicationId}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-finance-700 rounded-full text-sm">
              {applicantData.status}
            </span>
            <span className="text-sm">{applicantData.applicationDate}</span>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="px-6 pt-4 border-b">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Main Content - Three Panel Layout */}
      <div className="p-6">
        <Tabs defaultValue="overview" value={activeTab}>
          <TabsContent value="overview" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Panel - Applicant Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-finance-600" />
                    Applicant Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{applicantData.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <BriefcaseIcon className="h-3.5 w-3.5" />
                      {applicantData.businessName} ({applicantData.businessType})
                    </p>
                  </div>
                  
                  <div className="pt-2 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">PAN/ID</span>
                      <span className="font-medium">{applicantData.panId}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Monthly Income</span>
                      <span className="font-medium">{formatCurrency(applicantData.monthlyIncome)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Annual Revenue</span>
                      <span className="font-medium">{formatCurrency(applicantData.annualRevenue)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Credit Score</span>
                      <span className={`font-medium ${
                        applicantData.creditScore >= 700 ? 'text-green-600' : 
                        applicantData.creditScore >= 650 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {applicantData.creditScore}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Loan Request</h4>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium">{formatCurrency(applicantData.loanAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Term</span>
                        <span className="font-medium">{applicantData.loanTerm} months</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Monthly Payment</span>
                        <span className="font-medium">
                          {formatCurrency(applicantData.loanAmount / applicantData.loanTerm)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Center Panel - AI Risk Assessment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-finance-600" />
                    AI Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Overall Risk Rating</span>
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                        riskData.overallRiskRating === 'Low' ? 'bg-green-100 text-green-800' : 
                        riskData.overallRiskRating === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {riskData.overallRiskRating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <ScoreIndicator 
                      score={riskData.financialRiskScore} 
                      label="Financial Risk Score" 
                    />
                    
                    <ScoreIndicator 
                      score={riskData.behavioralCreditScore} 
                      label="Behavioral Credit Score" 
                    />
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">Fraud Detection</span>
                        <span className={`text-sm font-semibold ${
                          riskData.fraudDetectionLevel === 'Low' ? 'text-green-600' : 
                          riskData.fraudDetectionLevel === 'Medium' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {riskData.fraudDetectionLevel} Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {riskData.fraudDetectionLevel === 'Low' ? (
                          <ShieldCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <ShieldAlert className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {riskData.fraudDetectionLevel === 'Low' ? 
                            'No suspicious patterns detected' : 
                            'Some patterns require attention'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      AI-Generated Alerts
                    </h4>
                    <div className="space-y-2">
                      {riskData.flaggedItems.map(item => (
                        <Alert 
                          key={item.id} 
                          variant={getAlertVariant(item.type)}
                          className="py-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-xs ml-2">
                            {item.type === 'warning' ? 'Warning' : 'Notice'}
                          </AlertTitle>
                          <AlertDescription className="text-xs ml-2">
                            {item.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Right Panel - Stress Test Results */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ThermometerIcon className="h-5 w-5 text-finance-600" />
                    Stress Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-500 mb-2">
                    AI-powered analysis of how the applicant would handle various financial stressors.
                  </div>
                  
                  <div className="space-y-5 pt-1">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1.5">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          Income Shock Resilience
                        </span>
                        <span className="text-sm font-medium">
                          {stressTestData.incomeShockResilience}%
                        </span>
                      </div>
                      <Progress value={stressTestData.incomeShockResilience} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Can withstand a {stressTestData.incomeShockResilience}% drop in monthly income.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1.5">
                          <BadgePercent className="h-4 w-4 text-yellow-500" />
                          Interest Rate Sensitivity
                        </span>
                        <span className="text-sm font-medium">
                          {stressTestData.interestRateSensitivity}%
                        </span>
                      </div>
                      <Progress value={stressTestData.interestRateSensitivity} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Impact if interest rates rise by 2%.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-green-500" />
                          Cash Flow Stability
                        </span>
                        <span className="text-sm font-medium">
                          {stressTestData.cashFlowStability}%
                        </span>
                      </div>
                      <Progress value={stressTestData.cashFlowStability} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Consistency of revenue streams.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1.5">
                          <CloudRainIcon className="h-4 w-4 text-blue-500" />
                          Emergency Fund Buffer
                        </span>
                        <span className="text-sm font-medium">
                          {stressTestData.emergencyFundBuffer}%
                        </span>
                      </div>
                      <Progress value={stressTestData.emergencyFundBuffer} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Months of expenses covered by liquid assets.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1.5">
                          <TrendingDown className="h-4 w-4 text-purple-500" />
                          Market Downturn Impact
                        </span>
                        <span className="text-sm font-medium">
                          {stressTestData.marketDownturnImpact}%
                        </span>
                      </div>
                      <Progress value={stressTestData.marketDownturnImpact} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Business resilience in economic recession.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={onRequestInfo}
                className="border-finance-200 text-finance-700 hover:bg-finance-50"
              >
                Request More Info
              </Button>
              <Button 
                variant="destructive" 
                onClick={onReject}
              >
                Reject Application
              </Button>
              <Button 
                onClick={onApprove}
                className="bg-finance-600 hover:bg-finance-700 text-white"
              >
                Approve Loan
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-500">
                Document review section will be implemented in the next phase
              </h3>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-500">
                Application history will be implemented in the next phase
              </h3>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoanApplicationReview;
