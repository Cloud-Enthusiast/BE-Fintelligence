// Risk Assessment Engine
// Computes risk scores and generates alerts based on application data

import { LoanApplication } from '@/contexts/ApplicationContext';
import { ExtractedMSMEData, CIBILReportData, BankStatementData } from '@/types/msmeDocuments';
import { EligibilityResult } from '@/utils/MSMEEligibilityCalculator';

export interface RiskScore {
  overall: number;           // 0-100 (higher = riskier)
  severity: 'low' | 'medium' | 'high' | 'critical';
  flags: RiskFlag[];
  category: RiskCategory;
}

export interface RiskFlag {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  impact: number;            // How much this affects risk score
}

export interface RiskCategory {
  credit: number;
  financial: number;
  operational: number;
  industry: number;
}

export interface RiskAlert {
  id: string;
  applicationId: string;
  businessName: string;
  severity: RiskScore['severity'];
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface PortfolioRiskSummary {
  totalApplications: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topRisks: RiskAlert[];
  sectorConcentration: {
    sector: string;
    count: number;
    percentage: number;
  }[];
  trends: {
    period: string;
    avgScore: number;
    approvalRate: number;
  }[];
}

// Calculate risk score for a single application
export const calculateRiskScore = (
  application: LoanApplication,
  documents?: ExtractedMSMEData[],
  eligibility?: EligibilityResult
): RiskScore => {
  const flags: RiskFlag[] = [];
  const category: RiskCategory = {
    credit: 0,
    financial: 0,
    operational: 0,
    industry: 0,
  };

  // Base risk from eligibility score (inverse relationship)
  let baseRisk = eligibility ? Math.max(0, 100 - eligibility.overallScore) : 50;

  // Credit-related risks
  if (documents) {
    const cibil = documents.find(d => d.documentType === 'cibil_report')?.data as CIBILReportData | undefined;

    if (cibil) {
      const score = parseInt(cibil.creditScore);

      if (!isNaN(score)) {
        if (score < 600) {
          flags.push({
            id: 'credit_score_critical',
            type: 'critical',
            title: 'Very Low Credit Score',
            description: `Credit score of ${score} indicates high default risk`,
            impact: 25
          });
          category.credit += 30;
        } else if (score < 650) {
          flags.push({
            id: 'credit_score_warning',
            type: 'warning',
            title: 'Below Average Credit Score',
            description: `Credit score of ${score} is below preferred threshold`,
            impact: 15
          });
          category.credit += 20;
        }
      }

      if (cibil.defaults > 0) {
        flags.push({
          id: 'defaults_present',
          type: 'critical',
          title: 'Previous Defaults',
          description: `${cibil.defaults} default(s) on credit report`,
          impact: 20
        });
        category.credit += 25;
      }

      if (cibil.amountOverdue && cibil.amountOverdue !== '₹0' && cibil.amountOverdue !== 'N/A') {
        flags.push({
          id: 'amount_overdue',
          type: 'warning',
          title: 'Outstanding Overdue Amount',
          description: `${cibil.amountOverdue} currently overdue`,
          impact: 15
        });
        category.credit += 15;
      }
    }

    // Banking risks
    const bankStatement = documents.find(d => d.documentType === 'bank_statement')?.data as BankStatementData | undefined;

    if (bankStatement) {
      if (bankStatement.chequeBounces > 0) {
        const severity = bankStatement.chequeBounces > 3 ? 'critical' : 'warning';
        flags.push({
          id: 'cheque_bounces',
          type: severity,
          title: 'Cheque Bounces Detected',
          description: `${bankStatement.chequeBounces} bounced cheques in statement period`,
          impact: bankStatement.chequeBounces * 5
        });
        category.operational += bankStatement.chequeBounces * 8;
      }

      if (bankStatement.cashFlowPattern === 'negative') {
        flags.push({
          id: 'negative_cashflow',
          type: 'warning',
          title: 'Negative Cash Flow Pattern',
          description: 'Debits exceed credits in the statement period',
          impact: 15
        });
        category.financial += 20;
      }
    }
  }

  // Loan amount vs eligibility score risk
  if (application.eligibilityScore < 60) {
    flags.push({
      id: 'low_eligibility',
      type: 'warning',
      title: 'Low Eligibility Score',
      description: `Eligibility score of ${application.eligibilityScore} is below threshold`,
      impact: 10
    });
    category.financial += 15;
  }

  // Large loan amount risk
  if (application.loanAmount > 5000000) { // 50 lakhs
    flags.push({
      id: 'large_loan',
      type: 'info',
      title: 'Large Loan Amount',
      description: `Loan amount of ₹${(application.loanAmount / 100000).toFixed(1)}L requires additional scrutiny`,
      impact: 10
    });
    category.financial += 10;
  }

  // Calculate overall score
  const flagImpact = flags.reduce((sum, flag) => sum + flag.impact, 0);
  const categoryAvg = (category.credit + category.financial + category.operational + category.industry) / 4;
  const overall = Math.min(100, Math.max(0, (baseRisk + flagImpact + categoryAvg) / 2));

  // Determine severity
  let severity: RiskScore['severity'];
  if (overall >= 75) severity = 'critical';
  else if (overall >= 50) severity = 'high';
  else if (overall >= 25) severity = 'medium';
  else severity = 'low';

  return {
    overall: Math.round(overall),
    severity,
    flags,
    category: {
      credit: Math.min(100, category.credit),
      financial: Math.min(100, category.financial),
      operational: Math.min(100, category.operational),
      industry: Math.min(100, category.industry),
    }
  };
};

// Generate risk alerts from applications
export const generateRiskAlerts = (applications: LoanApplication[]): RiskAlert[] => {
  const alerts: RiskAlert[] = [];

  applications.forEach(app => {
    const riskScore = calculateRiskScore(app);

    if (riskScore.severity === 'critical' || riskScore.severity === 'high') {
      alerts.push({
        id: `alert_${app.id}_${Date.now()}`,
        applicationId: app.id,
        businessName: app.businessName,
        severity: riskScore.severity,
        title: riskScore.flags[0]?.title || 'High Risk Application',
        description: riskScore.flags[0]?.description || `Risk score: ${riskScore.overall}`,
        timestamp: new Date().toISOString(),
        actionRequired: riskScore.severity === 'critical'
      });
    }
  });

  // Sort by severity and timestamp
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
};

// Calculate portfolio-level risk summary
export const calculatePortfolioRisk = (applications: LoanApplication[]): PortfolioRiskSummary => {
  const riskScores = applications.map(app => ({
    app,
    risk: calculateRiskScore(app)
  }));

  const distribution = {
    low: riskScores.filter(r => r.risk.severity === 'low').length,
    medium: riskScores.filter(r => r.risk.severity === 'medium').length,
    high: riskScores.filter(r => r.risk.severity === 'high').length,
    critical: riskScores.filter(r => r.risk.severity === 'critical').length,
  };

  const avgRiskScore = riskScores.length > 0
    ? riskScores.reduce((sum, r) => sum + r.risk.overall, 0) / riskScores.length
    : 0;

  // Sector concentration (using business type as proxy)
  const sectorMap = new Map<string, number>();
  applications.forEach(app => {
    const sector = app.businessType || 'Other';
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
  });

  const sectorConcentration = Array.from(sectorMap.entries())
    .map(([sector, count]) => ({
      sector,
      count,
      percentage: applications.length > 0 ? (count / applications.length) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Mock trends (would be calculated from historical data in real implementation)
  const trends = [
    { period: 'This Week', avgScore: avgRiskScore, approvalRate: 75 },
    { period: 'Last Week', avgScore: avgRiskScore + 5, approvalRate: 72 },
    { period: '2 Weeks Ago', avgScore: avgRiskScore + 3, approvalRate: 78 },
  ];

  return {
    totalApplications: applications.length,
    averageRiskScore: Math.round(avgRiskScore),
    riskDistribution: distribution,
    topRisks: generateRiskAlerts(applications).slice(0, 5),
    sectorConcentration,
    trends,
  };
};
