// MSME-Specific Eligibility Calculator
// Computes loan eligibility based on financial documents and MSME factors

import { ExtractedMSMEData, BalanceSheetData, ProfitLossData, BankStatementData, CIBILReportData } from '@/types/msmeDocuments';

export interface MSMEEligibilityFactors {
  dscr: number | null;              // Debt Service Coverage Ratio
  currentRatio: number | null;      // Current Assets / Current Liabilities
  debtEquityRatio: number | null;   // Total Debt / Net Worth
  creditScore: number | null;       // CIBIL Score
  revenueGrowth: number | null;     // Year-over-year growth (if available)
  gstCompliance: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  bankingScore: number;             // Based on cheque bounces, avg balance
  industryRiskFactor: 'low' | 'medium' | 'high';
}

export interface EligibilityResult {
  score: number;                    // 0-100
  eligible: boolean;
  maxLoanAmount: number;
  factors: MSMEEligibilityFactors;
  breakdown: {
    category: string;
    score: number;
    maxScore: number;
    notes: string;
  }[];
  recommendations: string[];
  riskFlags: string[];
}

// Parse currency string to number
const parseCurrency = (value: string | undefined | null): number | null => {
  if (!value || value === 'N/A') return null;
  const cleaned = value.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

// Calculate DSCR: (Net Operating Income) / (Total Debt Service)
const calculateDSCR = (profitLoss: ProfitLossData | null, bankStatement: BankStatementData | null): number | null => {
  if (!profitLoss) return null;
  
  const ebitda = parseCurrency(profitLoss.ebitda);
  const emi = bankStatement ? parseCurrency(bankStatement.loanEMIs) : null;
  
  if (ebitda === null || emi === null || emi === 0) return null;
  
  // Annualize EMI (monthly * 12)
  const annualDebtService = emi * 12;
  return ebitda / annualDebtService;
};

// Calculate Current Ratio: Current Assets / Current Liabilities
const calculateCurrentRatio = (balanceSheet: BalanceSheetData | null): number | null => {
  if (!balanceSheet) return null;
  
  const currentAssets = parseCurrency(balanceSheet.currentAssets);
  const currentLiabilities = parseCurrency(balanceSheet.currentLiabilities);
  
  if (currentAssets === null || currentLiabilities === null || currentLiabilities === 0) return null;
  
  return currentAssets / currentLiabilities;
};

// Calculate Debt-to-Equity Ratio
const calculateDebtEquityRatio = (balanceSheet: BalanceSheetData | null): number | null => {
  if (!balanceSheet) return null;
  
  const totalLiabilities = parseCurrency(balanceSheet.totalLiabilities);
  const netWorth = parseCurrency(balanceSheet.netWorth);
  
  if (totalLiabilities === null || netWorth === null || netWorth === 0) return null;
  
  return totalLiabilities / netWorth;
};

// Calculate Banking Score (0-100)
const calculateBankingScore = (bankStatement: BankStatementData | null): number => {
  if (!bankStatement) return 50; // Default neutral score
  
  let score = 70; // Base score
  
  // Penalize cheque bounces heavily
  if (bankStatement.chequeBounces > 0) {
    score -= bankStatement.chequeBounces * 15;
  }
  
  // Positive cash flow bonus
  if (bankStatement.cashFlowPattern === 'positive') {
    score += 15;
  } else if (bankStatement.cashFlowPattern === 'negative') {
    score -= 20;
  }
  
  // Average balance consideration
  const avgBalance = parseCurrency(bankStatement.averageMonthlyBalance);
  if (avgBalance !== null) {
    if (avgBalance > 500000) score += 10;
    else if (avgBalance > 100000) score += 5;
    else if (avgBalance < 10000) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

// Main eligibility calculation
export const calculateMSMEEligibility = (
  documents: ExtractedMSMEData[],
  requestedLoanAmount: number,
  industry: 'manufacturing' | 'services' | 'trading' | 'other' = 'other'
): EligibilityResult => {
  // Extract relevant documents
  const balanceSheet = documents.find(d => d.documentType === 'balance_sheet')?.data as BalanceSheetData | undefined;
  const profitLoss = documents.find(d => d.documentType === 'profit_loss')?.data as ProfitLossData | undefined;
  const bankStatement = documents.find(d => d.documentType === 'bank_statement')?.data as BankStatementData | undefined;
  const cibil = documents.find(d => d.documentType === 'cibil_report')?.data as CIBILReportData | undefined;
  const gst = documents.find(d => d.documentType === 'gst_returns');

  // Calculate factors
  const factors: MSMEEligibilityFactors = {
    dscr: calculateDSCR(profitLoss || null, bankStatement || null),
    currentRatio: calculateCurrentRatio(balanceSheet || null),
    debtEquityRatio: calculateDebtEquityRatio(balanceSheet || null),
    creditScore: cibil?.creditScore ? parseInt(cibil.creditScore) : null,
    revenueGrowth: null, // Would need multiple periods
    gstCompliance: gst?.data ? (gst.data as any).filingRegularity || 'unknown' : 'unknown',
    bankingScore: calculateBankingScore(bankStatement || null),
    industryRiskFactor: industry === 'manufacturing' ? 'medium' : industry === 'services' ? 'low' : 'medium',
  };

  const breakdown: EligibilityResult['breakdown'] = [];
  const recommendations: string[] = [];
  const riskFlags: string[] = [];

  // Score calculation
  let totalScore = 0;
  let maxPossibleScore = 0;

  // 1. Credit Score (25 points max)
  const creditMax = 25;
  maxPossibleScore += creditMax;
  if (factors.creditScore !== null) {
    let creditPoints = 0;
    if (factors.creditScore >= 750) creditPoints = 25;
    else if (factors.creditScore >= 700) creditPoints = 20;
    else if (factors.creditScore >= 650) creditPoints = 15;
    else if (factors.creditScore >= 600) creditPoints = 10;
    else creditPoints = 5;
    
    totalScore += creditPoints;
    breakdown.push({
      category: 'Credit Score',
      score: creditPoints,
      maxScore: creditMax,
      notes: `CIBIL Score: ${factors.creditScore}`
    });
    
    if (factors.creditScore < 650) {
      riskFlags.push('Low credit score may indicate repayment risk');
      recommendations.push('Work on improving credit score before reapplying');
    }
  } else {
    breakdown.push({
      category: 'Credit Score',
      score: 0,
      maxScore: creditMax,
      notes: 'CIBIL report not provided'
    });
    recommendations.push('Provide CIBIL report for better eligibility assessment');
  }

  // 2. DSCR (20 points max)
  const dscrMax = 20;
  maxPossibleScore += dscrMax;
  if (factors.dscr !== null) {
    let dscrPoints = 0;
    if (factors.dscr >= 2.0) dscrPoints = 20;
    else if (factors.dscr >= 1.5) dscrPoints = 16;
    else if (factors.dscr >= 1.25) dscrPoints = 12;
    else if (factors.dscr >= 1.0) dscrPoints = 8;
    else dscrPoints = 0;
    
    totalScore += dscrPoints;
    breakdown.push({
      category: 'Debt Service Coverage Ratio',
      score: dscrPoints,
      maxScore: dscrMax,
      notes: `DSCR: ${factors.dscr.toFixed(2)}x`
    });
    
    if (factors.dscr < 1.25) {
      riskFlags.push('Low DSCR indicates potential difficulty in servicing debt');
    }
  } else {
    breakdown.push({
      category: 'Debt Service Coverage Ratio',
      score: 0,
      maxScore: dscrMax,
      notes: 'Unable to calculate - missing P&L or bank statement'
    });
  }

  // 3. Current Ratio (15 points max)
  const currentRatioMax = 15;
  maxPossibleScore += currentRatioMax;
  if (factors.currentRatio !== null) {
    let currentRatioPoints = 0;
    if (factors.currentRatio >= 2.0) currentRatioPoints = 15;
    else if (factors.currentRatio >= 1.5) currentRatioPoints = 12;
    else if (factors.currentRatio >= 1.25) currentRatioPoints = 9;
    else if (factors.currentRatio >= 1.0) currentRatioPoints = 6;
    else currentRatioPoints = 0;
    
    totalScore += currentRatioPoints;
    breakdown.push({
      category: 'Current Ratio',
      score: currentRatioPoints,
      maxScore: currentRatioMax,
      notes: `Ratio: ${factors.currentRatio.toFixed(2)}:1`
    });
    
    if (factors.currentRatio < 1.0) {
      riskFlags.push('Current ratio below 1 indicates liquidity issues');
    }
  } else {
    breakdown.push({
      category: 'Current Ratio',
      score: 0,
      maxScore: currentRatioMax,
      notes: 'Balance sheet not provided'
    });
  }

  // 4. Banking Relationship (20 points max)
  const bankingMax = 20;
  maxPossibleScore += bankingMax;
  const bankingPoints = Math.round((factors.bankingScore / 100) * bankingMax);
  totalScore += bankingPoints;
  breakdown.push({
    category: 'Banking Relationship',
    score: bankingPoints,
    maxScore: bankingMax,
    notes: bankStatement 
      ? `${bankStatement.chequeBounces} cheque bounces, ${bankStatement.cashFlowPattern} cash flow`
      : 'Bank statement not provided'
  });

  if (bankStatement?.chequeBounces && bankStatement.chequeBounces > 2) {
    riskFlags.push(`${bankStatement.chequeBounces} cheque bounces in statement period`);
  }

  // 5. GST Compliance (10 points max)
  const gstMax = 10;
  maxPossibleScore += gstMax;
  let gstPoints = 5; // Default
  if (factors.gstCompliance === 'excellent') gstPoints = 10;
  else if (factors.gstCompliance === 'good') gstPoints = 8;
  else if (factors.gstCompliance === 'fair') gstPoints = 6;
  else if (factors.gstCompliance === 'poor') gstPoints = 3;
  
  totalScore += gstPoints;
  breakdown.push({
    category: 'GST Compliance',
    score: gstPoints,
    maxScore: gstMax,
    notes: `Filing status: ${factors.gstCompliance}`
  });

  // 6. Industry Risk (10 points max)
  const industryMax = 10;
  maxPossibleScore += industryMax;
  let industryPoints = 5;
  if (factors.industryRiskFactor === 'low') industryPoints = 10;
  else if (factors.industryRiskFactor === 'medium') industryPoints = 7;
  else industryPoints = 4;
  
  totalScore += industryPoints;
  breakdown.push({
    category: 'Industry Risk',
    score: industryPoints,
    maxScore: industryMax,
    notes: `${industry} sector - ${factors.industryRiskFactor} risk`
  });

  // Final score calculation
  const finalScore = Math.round((totalScore / maxPossibleScore) * 100);
  const eligible = finalScore >= 60 && riskFlags.length < 3;

  // Calculate max loan amount
  let maxLoanAmount = 0;
  if (profitLoss) {
    const revenue = parseCurrency(profitLoss.revenue);
    const netProfit = parseCurrency(profitLoss.netProfit);
    
    if (revenue) {
      // Max loan = 20-40% of annual revenue based on score
      const multiplier = finalScore >= 80 ? 0.4 : finalScore >= 70 ? 0.3 : 0.2;
      maxLoanAmount = revenue * multiplier;
    } else if (netProfit) {
      // Alternatively, 3-5x net profit
      const multiplier = finalScore >= 80 ? 5 : finalScore >= 70 ? 4 : 3;
      maxLoanAmount = netProfit * multiplier;
    }
  }

  // Cap at requested amount if lower
  if (maxLoanAmount > 0 && requestedLoanAmount > 0) {
    maxLoanAmount = Math.min(maxLoanAmount, requestedLoanAmount * 1.2);
  }

  // Add general recommendations
  if (documents.length < 4) {
    recommendations.push('Upload more documents for a comprehensive assessment');
  }
  if (eligible && riskFlags.length > 0) {
    recommendations.push('Consider addressing flagged issues before final approval');
  }

  return {
    score: finalScore,
    eligible,
    maxLoanAmount: Math.round(maxLoanAmount),
    factors,
    breakdown,
    recommendations,
    riskFlags,
  };
};
