
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getMetricsForData, getScoreStatus } from '../utils/financialDisplayUtils';
import { ExtractedMSMEData } from '../types/msmeDocuments';

describe('Financial Display Logic Properties', () => {

    // Property 4.3: Threshold-based warning indicators
    it('should assign correct status based on CIBIL score thresholds', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 300, max: 900 }),
                (score) => {
                    const status = getScoreStatus(score.toString());
                    if (score >= 750) expect(status).toBe('good');
                    else if (score >= 650) expect(status).toBe('warning');
                    else expect(status).toBe('critical');
                }
            )
        );
    });

    // Property 4.2: Financial Data Display for different types
    it('should generate correct metrics for CIBIL report', () => {
        const data: ExtractedMSMEData = {
            documentType: 'cibil_report',
            fileName: 'test.pdf',
            extractedAt: '',
            extractionConfidence: 'high',
            data: {
                creditScore: '800',
                activeLoans: 2,
                paymentHistory: 'good',
                defaults: 0,
                settledAccounts: 0,
                reportDate: '2024',
                panNumber: 'ABC',
                totalLoanAmount: '1000',
                amountOverdue: '0'
            }
        };
        const metrics = getMetricsForData(data);
        expect(metrics).toHaveLength(4);
        expect(metrics[0].label).toBe('Credit Score');
        expect(metrics[0].value).toBe('800');
        expect(metrics[0].status).toBe('good');
    });

    // Property: Handling Defaults (Critical)
    it('should flag defaults as critical', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }),
                (defaults) => {
                    const data: ExtractedMSMEData = {
                        documentType: 'cibil_report',
                        fileName: 'test.pdf',
                        extractedAt: '',
                        extractionConfidence: 'high',
                        data: {
                            creditScore: '700',
                            activeLoans: 2,
                            paymentHistory: 'good',
                            defaults: defaults,
                            settledAccounts: 0,
                            reportDate: '2024',
                            panNumber: 'ABC',
                            totalLoanAmount: '1000',
                            amountOverdue: '0'
                        }
                    };
                    const metrics = getMetricsForData(data);
                    const defaultMetric = metrics.find(m => m.label === 'Defaults');
                    expect(defaultMetric?.status).toBe('critical');
                }
            )
        );
    });

});
