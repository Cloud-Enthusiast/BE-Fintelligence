
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

    // From Extracted Documents (optional)
    extractedDocuments?: ExtractedMSMEData[];
}

export interface EligibilityResult {
    overallScore: number;
    isEligible: boolean;
    rejectionReason?: string;
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
 * Calculate overall eligibility score
 */
export const calculateEligibility = (input: EligibilityInput): EligibilityResult => {
    const docs = input.extractedDocuments || [];

    // Calculate metrics
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

    // Determine eligibility
    const isEligible = overallScore >= 60 && dscr >= 0.8 && input.creditScore >= 600;

    let rejectionReason: string | undefined;
    if (!isEligible) {
        if (input.creditScore < 600) rejectionReason = 'Credit score below minimum threshold (600)';
        else if (dscr < 0.8) rejectionReason = 'Insufficient debt service coverage ratio';
        else rejectionReason = 'Overall eligibility score below threshold (60)';
    }

    return {
        overallScore: Math.round(overallScore),
        isEligible,
        rejectionReason,
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
            gstCompliance: docs.find(d => d.documentType === 'gst_returns')?.data?.filingRegularity || 'N/A',
            bankingRelationship: docs.find(d => d.documentType === 'bank_statement')?.data?.cashFlowPattern || 'N/A',
        },
    };
};
