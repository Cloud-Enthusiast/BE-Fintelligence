import { useMemo } from 'react';
import { useDocuments } from '@/contexts/DocumentContext';
import { calculateEligibility, EligibilityInput, EligibilityResult } from '@/utils/MSMEEligibilityCalculator';
import { calculateRiskScore, RiskScore } from '@/utils/riskScoring';

export interface EligibilityParams {
  loanAmount: number;
  loanType: 'business_loan' | 'working_capital' | 'home_loan';
  businessType: string;
  loanTerm: number;
}

export interface DocumentEligibilityResult {
  eligibility: EligibilityResult | null;
  riskScore: RiskScore | null;
  isReady: boolean;
  missingDocs: string[];
  extractedInputs: {
    creditScore: number;
    annualRevenue: number;
    monthlyIncome: number;
    existingLoanAmount: number;
    chequeBounces: number;
    cashFlowPattern: string;
    avgMonthlyBalance: number;
  };
}

export const useDocumentEligibility = (params: EligibilityParams): DocumentEligibilityResult => {
  const { documents } = useDocuments();

  return useMemo(() => {
    const empty: DocumentEligibilityResult = {
      eligibility: null,
      riskScore: null,
      isReady: false,
      missingDocs: [],
      extractedInputs: {
        creditScore: 0,
        annualRevenue: 0,
        monthlyIncome: 0,
        existingLoanAmount: 0,
        chequeBounces: 0,
        cashFlowPattern: 'unknown',
        avgMonthlyBalance: 0,
      },
    };

    const cibilDoc = documents.find(d => d.documentType === 'cibil_report');
    const bankDoc = documents.find(d => d.documentType === 'bank_statement');
    const plDoc = documents.find(d => d.documentType === 'profit_loss');

    const missingDocs: string[] = [];
    if (!cibilDoc) missingDocs.push('CIBIL Report');
    if (!bankDoc) missingDocs.push('Bank Statement');

    if (!cibilDoc && !bankDoc) {
      return { ...empty, missingDocs };
    }

    // ── CIBIL extraction ────────────────────────────────────────
    const cibil = cibilDoc?.extractedData.data as any;
    const rawScore = cibil?.cibilScore ?? cibil?.creditScore ?? 0;
    const creditScore = parseInt(String(rawScore).replace(/[^0-9]/g, '')) || 0;

    const rawOutstanding = cibil?.totalOutstandingAmount ?? cibil?.totalCurrentBalance ?? cibil?.totalLoanAmount ?? 0;
    const existingLoanAmount = parseFloat(String(rawOutstanding).replace(/[^0-9.]/g, '')) || 0;

    // ── Bank statement extraction ────────────────────────────────
    const bank = bankDoc?.extractedData.data as any;
    const avgMonthlyBalance = parseFloat(String(bank?.averageMonthlyBalance ?? 0)) || 0;
    const totalCredits = parseFloat(String(bank?.totalCredits ?? 0)) || 0;
    const chequeBounces = Number(bank?.chequeBounces ?? 0);
    const nachEcsReturns = Number(bank?.nachEcsReturns ?? 0);
    const cashFlowPattern: string = bank?.cashFlowPattern ?? 'unknown';

    // ── P&L extraction (best revenue source) ────────────────────
    const pl = plDoc?.extractedData.data as any;
    const plRevenue = parseFloat(String(pl?.totalRevenue ?? pl?.revenueFromOperations ?? pl?.revenue ?? 0).replace(/[^0-9.]/g, '')) || 0;

    // Revenue priority: P&L > total bank credits > avg balance × 12
    const annualRevenue = plRevenue || (totalCredits > 0 ? totalCredits : avgMonthlyBalance * 12);
    const monthlyIncome = annualRevenue / 12;

    const extractedInputs = {
      creditScore,
      annualRevenue,
      monthlyIncome,
      existingLoanAmount,
      chequeBounces: chequeBounces + nachEcsReturns,
      cashFlowPattern,
      avgMonthlyBalance,
    };

    const input: EligibilityInput = {
      creditScore,
      annualRevenue,
      monthlyIncome,
      existingLoanAmount,
      loanAmount: params.loanAmount,
      loanType: params.loanType,
      businessType: params.businessType,
      loanTerm: params.loanTerm,
      extractedDocuments: documents.map(d => d.extractedData),
    };

    const eligibility = calculateEligibility(input);

    const mockApp = {
      id: 'preview',
      eligibilityScore: eligibility.overallScore,
      loanAmount: params.loanAmount,
      businessType: params.businessType,
    } as any;

    const riskScore = calculateRiskScore(
      mockApp,
      documents.map(d => d.extractedData),
      eligibility,
    );

    return {
      eligibility,
      riskScore,
      isReady: true,
      missingDocs,
      extractedInputs,
    };
  }, [documents, params.loanAmount, params.loanType, params.businessType, params.loanTerm]);
};
