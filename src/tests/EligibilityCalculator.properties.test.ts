
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
    calculateDSCR,
    scoreDSCR,
    calculateCurrentRatio,
    scoreCurrentRatio,
    calculateRevenueGrowth,
    scoreRevenueGrowth,
    scoreGSTCompliance,
    scoreBankingRelationship,
    scoreIndustryRisk,
    calculateEligibility,
} from '../utils/MSMEEligibilityCalculator';
import { ExtractedMSMEData } from '../types/msmeDocuments';

describe('MSME Eligibility Calculator Properties', () => {

    // Property 8.2: DSCR Calculation Accuracy
    it('should calculate DSCR correctly', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 100000, max: 10000000 }), // revenue
                fc.integer({ min: 0, max: 1000000 }), // existing loan
                fc.integer({ min: 100000, max: 5000000 }), // new loan
                fc.integer({ min: 12, max: 60 }), // term
                (revenue, existingLoan, newLoan, term) => {
                    const dscr = calculateDSCR(revenue, existingLoan, newLoan, term);
                    expect(dscr).toBeGreaterThan(0);
                    expect(dscr).toBeLessThan(1000); // Reasonable upper bound
                }
            )
        );
    });

    it('should score DSCR according to thresholds', () => {
        expect(scoreDSCR(2.0)).toBe(100);
        expect(scoreDSCR(1.5)).toBe(100);
        expect(scoreDSCR(1.3)).toBe(85);
        expect(scoreDSCR(1.1)).toBe(65);
        expect(scoreDSCR(0.9)).toBe(40);
        expect(scoreDSCR(0.5)).toBe(20);
    });

    // Property 8.3: Current Ratio Calculation Accuracy
    it('should calculate current ratio from balance sheet', () => {
        const docs: ExtractedMSMEData[] = [{
            documentType: 'balance_sheet',
            fileName: 'bs.pdf',
            extractedAt: '',
            extractionConfidence: 'high',
            data: {
                currentAssets: '₹500000',
                currentLiabilities: '₹250000',
                totalAssets: '₹1000000',
                totalLiabilities: '₹400000',
                netWorth: '₹600000',
                workingCapital: '₹250000',
                reportDate: '2024',
            }
        }];

        const ratio = calculateCurrentRatio(docs);
        expect(ratio).toBe(2.0);
    });

    it('should score current ratio according to thresholds', () => {
        expect(scoreCurrentRatio(2.5)).toBe(100);
        expect(scoreCurrentRatio(1.7)).toBe(85);
        expect(scoreCurrentRatio(1.2)).toBe(65);
        expect(scoreCurrentRatio(0.8)).toBe(40);
        expect(scoreCurrentRatio(0.5)).toBe(20);
        expect(scoreCurrentRatio(null)).toBe(50); // No data
    });

    // Property 8.4: Revenue Growth Analysis
    it('should calculate revenue growth correctly', () => {
        const docs: ExtractedMSMEData[] = [{
            documentType: 'profit_loss',
            fileName: 'pl.pdf',
            extractedAt: '',
            extractionConfidence: 'high',
            data: {
                revenue: '₹1000000',
                costOfGoods: '₹600000',
                grossProfit: '₹400000',
                operatingExpenses: '₹200000',
                ebitda: '₹200000',
                netProfit: '₹150000',
                profitMargin: '15%',
                reportPeriod: '2023',
            }
        }];

        const growth = calculateRevenueGrowth(docs, 1200000);
        expect(growth).toBe(20); // 20% growth
    });

    it('should score revenue growth according to thresholds', () => {
        expect(scoreRevenueGrowth(25)).toBe(100);
        expect(scoreRevenueGrowth(15)).toBe(85);
        expect(scoreRevenueGrowth(7)).toBe(70);
        expect(scoreRevenueGrowth(2)).toBe(55);
        expect(scoreRevenueGrowth(-3)).toBe(40);
        expect(scoreRevenueGrowth(-10)).toBe(20);
        expect(scoreRevenueGrowth(null)).toBe(50);
    });

    // Property 8.5: GST Compliance Scoring
    it('should score GST compliance based on filing regularity', () => {
        const regularDocs: ExtractedMSMEData[] = [{
            documentType: 'gst_returns',
            fileName: 'gst.pdf',
            extractedAt: '',
            extractionConfidence: 'high',
            data: {
                monthlyTurnover: '₹100000',
                gstPaid: '₹18000',
                inputCredit: '₹5000',
                filingRegularity: 'regular',
                gstNumber: 'GST123',
                reportPeriod: '2024',
            }
        }];

        expect(scoreGSTCompliance(regularDocs)).toBe(100);

        const irregularDocs: ExtractedMSMEData[] = [{
            ...regularDocs[0],
            data: { ...regularDocs[0].data, filingRegularity: 'irregular' }
        }];

        expect(scoreGSTCompliance(irregularDocs)).toBe(30);
        expect(scoreGSTCompliance([])).toBe(50); // No data
    });

    // Property 8.6: Banking Relationship Scoring
    it('should score banking relationship based on cheque bounces and cash flow', () => {
        const goodDocs: ExtractedMSMEData[] = [{
            documentType: 'bank_statement',
            fileName: 'bank.pdf',
            extractedAt: '',
            extractionConfidence: 'high',
            data: {
                averageMonthlyBalance: '₹200000',
                cashFlowPattern: 'positive',
                chequeBounces: 0,
                loanEMIs: '₹50000',
                statementPeriod: '2024',
            }
        }];

        const score = scoreBankingRelationship(goodDocs);
        expect(score).toBeGreaterThanOrEqual(85);

        const badDocs: ExtractedMSMEData[] = [{
            ...goodDocs[0],
            data: { ...goodDocs[0].data, chequeBounces: 3, cashFlowPattern: 'negative' }
        }];

        const badScore = scoreBankingRelationship(badDocs);
        expect(badScore).toBeLessThan(50);
    });

    // Property 8.7: Industry Risk Factor Application
    it('should apply industry-specific risk scores', () => {
        expect(scoreIndustryRisk('Technology')).toBe(85);
        expect(scoreIndustryRisk('Services')).toBe(80);
        expect(scoreIndustryRisk('Manufacturing')).toBe(75);
        expect(scoreIndustryRisk('Agriculture')).toBe(60);
        expect(scoreIndustryRisk('Unknown Industry')).toBe(65); // Default
    });

    // Integration test: Overall eligibility calculation
    it('should calculate overall eligibility correctly', () => {
        const result = calculateEligibility({
            annualRevenue: 2000000,
            monthlyIncome: 166667,
            existingLoanAmount: 500000,
            loanAmount: 1000000,
            loanTerm: 36,
            creditScore: 750,
            businessType: 'Technology',
            extractedDocuments: [],
        });

        expect(result.overallScore).toBeGreaterThan(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
        expect(result.isEligible).toBeDefined();
        expect(result.breakdown).toBeDefined();
        expect(result.metrics.dscr).toBeDefined();
    });

    it('should reject applications with low credit score', () => {
        const result = calculateEligibility({
            annualRevenue: 2000000,
            monthlyIncome: 166667,
            existingLoanAmount: 100000,
            loanAmount: 500000,
            loanTerm: 36,
            creditScore: 550, // Below threshold
            businessType: 'Technology',
        });

        expect(result.isEligible).toBe(false);
        expect(result.rejectionReason).toContain('Credit score');
    });

    it('should reject applications with poor DSCR', () => {
        const result = calculateEligibility({
            annualRevenue: 500000, // Low revenue
            monthlyIncome: 41667,
            existingLoanAmount: 1000000, // High existing debt
            loanAmount: 1000000, // High new loan
            loanTerm: 12, // Short term
            creditScore: 750,
            businessType: 'Technology',
        });

        expect(result.isEligible).toBe(false);
        expect(result.rejectionReason).toContain('debt service coverage');
    });
});
