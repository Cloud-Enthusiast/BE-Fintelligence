
import { useState, useEffect } from 'react'; // Keep useState for mock data parts
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'; // Added Loader2
import { useFetchSingleBasicAssessment } from '@/hooks/useFetchSingleBasicAssessment'; // Import the new hook
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

// Mock data for UI demonstration (for fields not yet fetched from backend)
const mockApplicationData = {
  // id: 'APP-2023-005', // Will come from fetched data
  // applicantName: 'John Smith', // Will come from fetched data
  panId: 'ABCTY1234Z', // Stays mock
  email: 'john.smith@example.com', // Stays mock for now, or could be added to basic fetch
  annualIncome: 750000, // Stays mock
  monthlyIncome: 62500, // Stays mock
  creditScore: 720, // Stays mock
  // loanAmount: 2500000, // Will come from fetched data
  loanTenure: 60, // months // Will come from fetched data, but mock provides fallback
  loanPurpose: 'Business Expansion', // Stays mock
  // submittedAt: '2023-06-10T10:30:00Z', // Will come from fetched data
  // email: 'john.smith@example.com', // This was duplicated
  // annualIncome: 750000, // This was duplicated
  // monthlyIncome: 62500, // This was duplicated
  // creditScore: 720, // This was duplicated
  // loanAmount: 2500000, // This was duplicated (and is overridden by displayData anyway)
  // loanTenure: 60, // months // This was duplicated (and is overridden by displayData anyway)
  // loanPurpose: 'Business Expansion', // This was duplicated
  // submittedAt: '2023-06-10T10:30:00Z', // This was duplicated (and is overridden by displayData anyway)

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
  const { data: currentApplication, isLoading, error } = useFetchSingleBasicAssessment(applicationId);

  // We still need mockApplicationData for fields not covered by currentApplication yet
  // and to ensure the component structure doesn't break before full data integration.
  // The `application` variable will be a merge or primarily use currentApplication where available.

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-finance-600" />
        <span className="ml-3 text-gray-600">Loading application data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700">Error Loading Application</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!currentApplication) {
    // This case might be hit if !isLoading and !error but currentApplication is still null/undefined
    // (e.g. if enabled:false in useQuery and no initialData, though our hook enables it)
    // Or if the fetch completed but returned no data and didn't throw an error handled above.
    return (
      <div className="w-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Application Data Unavailable</h3>
        <p className="text-gray-500">The requested application data could not be loaded.</p>
      </div>
    );
  }

  // Combine real basic data with mock data for other fields
  const displayData = {
    ...mockApplicationData, // Start with mock as a base for un-fetched fields
    id: currentApplication.id,
    applicantName: currentApplication.full_name, // Mapped from customer_information
    loanAmount: currentApplication.loan_amount,
    loanTenure: currentApplication.loan_term !== null ? currentApplication.loan_term : mockApplicationData.loanTenure, // Handle null loanTerm
    submittedAt: currentApplication.created_at,
    // Fields from mockApplicationData that are not in MappedAssessment will persist here:
    // panId, email, annualIncome, monthlyIncome, creditScore, loanPurpose,

    // Use actual eligibility score if available, otherwise mock
    financialRiskScore: currentApplication.eligibility_score !== undefined ? currentApplication.eligibility_score : mockApplicationData.financialRiskScore,

    // behavioralCreditScore, fraudAlerts,
    // incomeShockResilience, interestRateSensitivity, emergencyFundBuffer, debtServiceRatio
  };

  // Helper to format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
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
          <p className="text-gray-500">Application ID: {displayData.id}</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          Submitted on {new Date(displayData.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                <AvatarImage src="/avatar-placeholder.png" alt={displayData.applicantName} />
                <AvatarFallback>{displayData.applicantName ? displayData.applicantName.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{displayData.applicantName}</h3>
                <p className="text-sm text-gray-500">{displayData.email}</p>
                <div className="flex items-center mt-1 text-sm">
                  <span className="font-medium">PAN/ID:</span>
                  <span className="ml-2">{displayData.panId}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Annual Income</span>
                <span className="font-medium">{formatCurrency(displayData.annualIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Monthly Income</span>
                <span className="font-medium">{formatCurrency(displayData.monthlyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Credit Score</span>
                <span className={cn(
                  "font-medium",
                  displayData.creditScore >= 700 ? "text-green-600" :
                    displayData.creditScore >= 600 ? "text-yellow-600" : "text-red-600"
                )}>
                  {displayData.creditScore}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Loan Amount</span>
                <span className="font-medium">{formatCurrency(displayData.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Loan Tenure</span>
                <span className="font-medium">{displayData.loanTenure} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Purpose</span>
                <span className="font-medium">{displayData.loanPurpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Debt Service Ratio</span>
                <span className={cn(
                  "font-medium",
                  displayData.debtServiceRatio <= 30 ? "text-green-600" :
                    displayData.debtServiceRatio <= 45 ? "text-yellow-600" : "text-red-600"
                )}>
                  {displayData.debtServiceRatio}%
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
                  <span className="text-sm font-medium">{displayData.financialRiskScore}/100</span>
                </div>
                <div className="relative">
                  <Progress value={displayData.financialRiskScore} className="h-2" />
                  <span className={cn(
                    "absolute px-2 py-0.5 text-xs font-medium text-white rounded-md -top-1 transform -translate-y-full",
                    getRiskColor(displayData.financialRiskScore)
                  )}
                    style={{ left: `${Math.min(Math.max(displayData.financialRiskScore - 10, 0), 90)}%` }}>
                    {getScoreLabel(displayData.financialRiskScore)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  The applicant's financial risk score indicates
                  {displayData.financialRiskScore >= 80 ? " strong financial stability." :
                    displayData.financialRiskScore >= 60 ? " moderate financial stability." :
                      " potential financial vulnerability."}
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Behavioral Credit Score</span>
                  <span className="text-sm font-medium">{displayData.behavioralCreditScore}/100</span>
                </div>
                <div className="relative">
                  <Progress value={displayData.behavioralCreditScore} className="h-2" />
                  <span className={cn(
                    "absolute px-2 py-0.5 text-xs font-medium text-white rounded-md -top-1 transform -translate-y-full",
                    getRiskColor(displayData.behavioralCreditScore)
                  )}
                    style={{ left: `${Math.min(Math.max(displayData.behavioralCreditScore - 10, 0), 90)}%` }}>
                    {getScoreLabel(displayData.behavioralCreditScore)}
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

              {displayData.fraudAlerts.length > 0 ? (
                <ul className="space-y-2">
                  {displayData.fraudAlerts.map((alert, index) => (
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
                  (displayData.financialRiskScore + displayData.behavioralCreditScore) / 2 >= 75 ?
                    " low overall risk profile. Approval recommended." :
                    (displayData.financialRiskScore + displayData.behavioralCreditScore) / 2 >= 60 ?
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
                <span className="text-sm font-medium">{displayData.incomeShockResilience}%</span>
              </div>
              <Progress
                value={displayData.incomeShockResilience}
                className={cn(
                  "h-2",
                  displayData.incomeShockResilience >= 70 ? "bg-green-500" :
                    displayData.incomeShockResilience >= 40 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
              <p className="mt-2 text-xs text-gray-500">
                Ability to withstand a 20% reduction in income for 6 months
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Interest Rate Sensitivity</span>
                <span className="text-sm font-medium">{displayData.interestRateSensitivity}%</span>
              </div>
              <Progress
                value={displayData.interestRateSensitivity}
                className={cn(
                  "h-2",
                  displayData.interestRateSensitivity >= 70 ? "bg-green-500" :
                    displayData.interestRateSensitivity >= 40 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
              <p className="mt-2 text-xs text-gray-500">
                Resilience to a 2% interest rate hike
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Emergency Fund Buffer</span>
                <span className="text-sm font-medium">{displayData.emergencyFundBuffer}%</span>
              </div>
              <Progress
                value={displayData.emergencyFundBuffer}
                className={cn(
                  "h-2",
                  displayData.emergencyFundBuffer >= 70 ? "bg-green-500" :
                    displayData.emergencyFundBuffer >= 40 ? "bg-yellow-500" : "bg-red-500"
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
                  <div className={displayData.incomeShockResilience >= 60 ? "text-green-500" : "text-red-500"}>
                    {displayData.incomeShockResilience >= 60 ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Income Stability: </span>
                    {displayData.incomeShockResilience >= 60
                      ? "The applicant can maintain payments even with temporary income reduction."
                      : "The applicant may struggle with payments if income decreases temporarily."}
                  </div>
                </li>

                <li className="flex items-start">
                  <div className={displayData.interestRateSensitivity >= 60 ? "text-green-500" : "text-red-500"}>
                    {displayData.interestRateSensitivity >= 60 ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Rate Sensitivity: </span>
                    {displayData.interestRateSensitivity >= 60
                      ? "The loan remains affordable even if interest rates increase."
                      : "Rising interest rates could significantly impact affordability."}
                  </div>
                </li>

                <li className="flex items-start">
                  <div className={displayData.emergencyFundBuffer >= 60 ? "text-green-500" : "text-red-500"}>
                    {displayData.emergencyFundBuffer >= 60 ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Emergency Preparedness: </span>
                    {displayData.emergencyFundBuffer >= 60
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
