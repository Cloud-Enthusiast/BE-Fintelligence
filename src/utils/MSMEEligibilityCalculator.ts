
import { ExtractedMSMEData } from '@/types/msmeDocuments';

export interface EligibilityInput {
    // From Application Form
    annualRevenue: number;
    monthlyIncome: number;
    existingLoanAmount: number;
    loanAmount: number;
    loanTerm: number;
    creditScore: number;
    businessType: string;
    loanType: 'business_loan' | 'working_capital' | 'home_loan';

    // From Extracted Documents (optional)

    // From Extracted Documents (optional)
    extractedDocuments?: ExtractedMSMEData[];
}

export interface EligibilityResult {
    overallScore: number;
    isEligible: boolean;
    rejectionReason?: string;
    eligibilityNote?: string;
    breakdown: {
        dscrScore: number;
        currentRatioScore: number;
        revenueGrowthScore: number;
        gstComplianceScore: number;
        bankingRelationshipScore: number;
        industryRiskScore: number;
        creditScore: number;
    };
    metrics: {
        dscr?: number;
        currentRatio?: number;
        revenueGrowth?: number;
        gstCompliance?: string;
        bankingRelationship?: string;
    };
}

/**
 * Calculate Debt Service Coverage Ratio (DSCR)
 * DSCR = Net Operating Income / Total Debt Service
 * Good: > 1.25, Acceptable: 1.0-1.25, Poor: < 1.0
 */
export const calculateDSCR = (
    annualRevenue: number,
    existingLoanAmount: number,
    newLoanAmount: number,
    loanTerm: number
): number => {
    // Estimate Net Operating Income as 20% of revenue (conservative)
    const netOperatingIncome = annualRevenue * 0.2;

    // Estimate annual debt service (existing + new loan)
    // Assuming 12% interest rate
    const interestRate = 0.12;
    const totalLoanAmount = existingLoanAmount + newLoanAmount;
    const monthlyPayment = (totalLoanAmount * (interestRate / 12)) / (1 - Math.pow(1 + interestRate / 12, -loanTerm));
    const annualDebtService = monthlyPayment * 12;

    if (annualDebtService === 0) return 999; // No debt

    return netOperatingIncome / annualDebtService;
};

/**
 * Score DSCR on a 0-100 scale
 */
export const scoreDSCR = (dscr: number): number => {
    if (dscr >= 1.5) return 100;
    if (dscr >= 1.25) return 85;
    if (dscr >= 1.0) return 65;
    if (dscr >= 0.8) return 40;
    return 20;
};

/**
 * Calculate Current Ratio from Balance Sheet
 * Current Ratio = Current Assets / Current Liabilities
 * Good: > 1.5, Acceptable: 1.0-1.5, Poor: < 1.0
 */
export const calculateCurrentRatio = (documents: ExtractedMSMEData[]): number | null => {
    const balanceSheet = documents.find(d => d.documentType === 'balance_sheet');
    if (!balanceSheet) return null;

    const data = balanceSheet.data as any;
    const assets = parseFloat(String(data.currentAssets || data.totalAssets || '0').replace(/[^0-9.]/g, ''));
    const liabilities = parseFloat(String(data.currentLiabilities || data.totalLiabilities || '0').replace(/[^0-9.]/g, ''));

    if (liabilities === 0) return 999; // No liabilities
    return assets / liabilities;
};

/**
 * Score Current Ratio on a 0-100 scale
 */
export const scoreCurrentRatio = (ratio: number | null): number => {
    if (ratio === null) return 50; // Neutral if no data
    if (ratio >= 2.0) return 100;
    if (ratio >= 1.5) return 85;
    if (ratio >= 1.0) return 65;
    if (ratio >= 0.75) return 40;
    return 20;
};

/**
 * Calculate Revenue Growth from P&L or GST
 */
export const calculateRevenueGrowth = (documents: ExtractedMSMEData[], currentRevenue: number): number | null => {
    // Try to find historical revenue from documents
    const pl = documents.find(d => d.documentType === 'profit_loss');
    const gst = documents.find(d => d.documentType === 'gst_returns');

    let historicalRevenue = 0;

    if (pl) {
        const data = pl.data as any;
        historicalRevenue = parseFloat(String(data.revenue || '0').replace(/[^0-9.]/g, ''));
    } else if (gst) {
        const data = gst.data as any;
        const monthly = parseFloat(String(data.monthlyTurnover || '0').replace(/[^0-9.]/g, ''));
        historicalRevenue = monthly * 12;
    }

    if (historicalRevenue === 0) return null;

    // Calculate YoY growth percentage
    return ((currentRevenue - historicalRevenue) / historicalRevenue) * 100;
};

/**
 * Score Revenue Growth on a 0-100 scale
 */
export const scoreRevenueGrowth = (growth: number | null): number => {
    if (growth === null) return 50; // Neutral if no data
    if (growth >= 20) return 100;
    if (growth >= 10) return 85;
    if (growth >= 5) return 70;
    if (growth >= 0) return 55;
    if (growth >= -5) return 40;
    return 20;
};

/**
 * Score GST Compliance
 */
export const scoreGSTCompliance = (documents: ExtractedMSMEData[]): number => {
    const gst = documents.find(d => d.documentType === 'gst_returns');
    if (!gst) return 50; // Neutral if no GST data

    const data = gst.data as any;
    const filingRegularity = data.filingRegularity || 'unknown';

    if (filingRegularity === 'regular') return 100;
    if (filingRegularity === 'mostly_regular') return 75;
    if (filingRegularity === 'irregular') return 30;
    return 50;
};

/**
 * Score Banking Relationship
 */
export const scoreBankingRelationship = (documents: ExtractedMSMEData[]): number => {
    const bankStatement = documents.find(d => d.documentType === 'bank_statement');
    if (!bankStatement) return 50; // Neutral if no data

    const data = bankStatement.data as any;
    const chequeBounces = data.chequeBounces || 0;
    const cashFlow = data.cashFlowPattern || 'unknown';

    let score = 70; // Base score

    // Penalize for cheque bounces
    score -= chequeBounces * 10;

    // Adjust for cash flow
    if (cashFlow === 'positive') score += 20;
    if (cashFlow === 'negative') score -= 20;

    return Math.max(0, Math.min(100, score));
};

/**
 * Score Industry Risk
 */
export const scoreIndustryRisk = (businessType: string): number => {
    const industryRiskMap: Record<string, number> = {
        'Technology': 85,
        'Services': 80,
        'Manufacturing': 75,
        'Trading': 70,
        'Retail': 65,
        'Agriculture': 60,
        'Construction': 55,
        'Food & Beverage': 70,
        'Health & Beauty': 75,
        'Logistics': 70,
        'Real Estate': 60,
        'Marketing': 75,
    };

    return industryRiskMap[businessType] || 65; // Default to moderate
};

/**
 * Calculate Working Capital Eligibility (Turnover Method)
 */
const calculateWorkingCapitalEligibility = (revenue: number): { maxLoan: number; reason: string } => {
    // Turnover Method: 20% of Projected Annual Turnover
    // We use current annual revenue as a proxy for projected if not explicitly provided
    const maxLoan = revenue * 0.20;
    return {
        maxLoan,
        reason: `Eligible for ₹${(maxLoan / 100000).toFixed(2)} Lakhs (20% of Annual Turnover)`
    };
};

/**
 * Calculate Home Loan Eligibility (FOIR Method)
 */
const calculateHomeLoanEligibility = (
    monthlyIncome: number,
    existingEMI: number,
    loanTermYears: number
): { maxLoan: number; reason: string } => {
    // FOIR (Fixed Obligation to Income Ratio) - Standard 50%
    const maxMonthlyObligation = monthlyIncome * 0.50;
    const availableEMI = Math.max(0, maxMonthlyObligation - existingEMI);

    if (availableEMI <= 0) {
        return { maxLoan: 0, reason: 'Existing obligations exceed 50% of monthly income' };
    }

    // Reverse PMT to find Principal
    // Assuming 8.5% interest rate standard for Home Loans
    const annualRate = 0.085;
    const monthlyRate = annualRate / 12;
    const nPer = loanTermYears * 12;

    // PMT = P * r * (1+r)^n / ((1+r)^n - 1)
    // P = PMT * ((1+r)^n - 1) / (r * (1+r)^n)

    const factor = Math.pow(1 + monthlyRate, nPer);
    const maxLoan = availableEMI * ((factor - 1) / (monthlyRate * factor));

    return {
        maxLoan,
        reason: `Eligible for ₹${(maxLoan / 100000).toFixed(2)} Lakhs based on ₹${Math.round(availableEMI).toLocaleString('en-IN')} max affordable EMI`
    };
};

/**
 * Calculate overall eligibility score
 */
export const calculateEligibility = (input: EligibilityInput): EligibilityResult => {
    const docs = input.extractedDocuments || [];

    // 1. Universal Checks (Deal Breakers)
    if (input.creditScore < 600) {
        return {
            overallScore: 0,
            isEligible: false,
            rejectionReason: 'Credit score below minimum threshold (600)',
            breakdown: createEmptyBreakdown(),
            metrics: {}
        };
    }

    // 2. Loan Specific Calculations
    let maxLoanAmount = 0;
    let specificReason = '';

    if (input.loanType === 'working_capital') {
        const result = calculateWorkingCapitalEligibility(input.annualRevenue);
        maxLoanAmount = result.maxLoan;
        specificReason = result.reason;
    } else if (input.loanType === 'home_loan') {
        const result = calculateHomeLoanEligibility(input.monthlyIncome, 0, input.loanTerm); // Assuming 0 existing EMI if not strictly passed as sum
        // Note: The form passes 'existingLoanAmount' not 'existingEMI' broadly, 
        // but for accurate FOIR we ideally need existing EMI. 
        // We will approximate existing EMI from existing loan amount if monthlyEMI not available in input
        // Since input doesn't have monthlyEMI, let's use a standard proxy or update input interface later.
        // For now, let's assume `existingLoanAmount` implies the total debt, 
        // but FOIR needs monthly outflow. 
        // Let's use a proxy: 1.5% of existing loan amount is approx monthly EMI.
        const proxyExistingEMI = input.existingLoanAmount * 0.015;
        const resultWithEMI = calculateHomeLoanEligibility(input.monthlyIncome, proxyExistingEMI, input.loanTerm);
        maxLoanAmount = resultWithEMI.maxLoan;
        specificReason = resultWithEMI.reason;
    } else {
        // Business Loan (existing logic + Multiplier)
        // Multiplier Method: 15% of Turnover
        maxLoanAmount = input.annualRevenue * 0.15;
        specificReason = `Eligible for ₹${(maxLoanAmount / 100000).toFixed(2)} Lakhs (15% of Annual Revenue)`;
    }

    // 3. Calculate Scores (Existing Logic for Health Check)
    const dscr = calculateDSCR(input.annualRevenue, input.existingLoanAmount, input.loanAmount, input.loanTerm);
    const currentRatio = calculateCurrentRatio(docs);
    const revenueGrowth = calculateRevenueGrowth(docs, input.annualRevenue);

    // Calculate scores
    const dscrScore = scoreDSCR(dscr);
    const currentRatioScore = scoreCurrentRatio(currentRatio);
    const revenueGrowthScore = scoreRevenueGrowth(revenueGrowth);
    const gstComplianceScore = scoreGSTCompliance(docs);
    const bankingRelationshipScore = scoreBankingRelationship(docs);
    const industryRiskScore = scoreIndustryRisk(input.businessType);

    // Normalize credit score to 0-100
    const creditScoreNormalized = ((input.creditScore - 300) / 600) * 100;

    // Weighted average
    const weights = {
        dscr: 0.25,
        currentRatio: 0.15,
        revenueGrowth: 0.10,
        gstCompliance: 0.15,
        bankingRelationship: 0.15,
        industryRisk: 0.10,
        creditScore: 0.10,
    };

    const overallScore =
        dscrScore * weights.dscr +
        currentRatioScore * weights.currentRatio +
        revenueGrowthScore * weights.revenueGrowth +
        gstComplianceScore * weights.gstCompliance +
        bankingRelationshipScore * weights.bankingRelationship +
        industryRiskScore * weights.industryRisk +
        creditScoreNormalized * weights.creditScore;

    // Determine eligibility based on requested amount vs max eligible
    // If requested amount is <= Max Eligible Amount, they are eligible.
    // AND the risk score determines the "quality" of the borrower.
    const amountEligible = input.loanAmount <= maxLoanAmount;
    const scoreEligible = overallScore >= 60;

    const isEligible = amountEligible && scoreEligible && dscr >= 0.8;

    let rejectionReason: string | undefined;
    if (!isEligible) {
        if (!amountEligible) rejectionReason = `Requested amount exceeds maximum eligibility of ₹${(maxLoanAmount / 100000).toFixed(2)} Lakhs`;
        else if (dscr < 0.8) rejectionReason = 'Insufficient debt service coverage ratio';
        else rejectionReason = 'Make Stronger Case: Overall risk score below threshold (60)';
    }

    return {
        overallScore: Math.round(overallScore),
        isEligible,
        rejectionReason,
        eligibilityNote: specificReason,
        breakdown: {
            dscrScore: Math.round(dscrScore),
            currentRatioScore: Math.round(currentRatioScore),
            revenueGrowthScore: Math.round(revenueGrowthScore),
            gstComplianceScore: Math.round(gstComplianceScore),
            bankingRelationshipScore: Math.round(bankingRelationshipScore),
            industryRiskScore: Math.round(industryRiskScore),
            creditScore: Math.round(creditScoreNormalized),
        },
        metrics: {
            dscr: Math.round(dscr * 100) / 100,
            currentRatio: currentRatio ? Math.round(currentRatio * 100) / 100 : undefined,
            revenueGrowth: revenueGrowth ? Math.round(revenueGrowth * 100) / 100 : undefined,
            gstCompliance: docs.find(d => d.documentType === 'gst_returns')?.data && (docs.find(d => d.documentType === 'gst_returns')?.data as any).filingRegularity || 'N/A',
            bankingRelationship: docs.find(d => d.documentType === 'bank_statement')?.data && (docs.find(d => d.documentType === 'bank_statement')?.data as any).cashFlowPattern || 'N/A',
        },
    };
};

function createEmptyBreakdown() {
    return {
        dscrScore: 0,
        currentRatioScore: 0,
        revenueGrowthScore: 0,
        gstComplianceScore: 0,
        bankingRelationshipScore: 0,
        industryRiskScore: 0,
        creditScore: 0,
    };
}
