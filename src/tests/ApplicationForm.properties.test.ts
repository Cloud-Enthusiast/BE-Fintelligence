
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { StoredDocument } from '../contexts/DocumentContext';

// Mock logic from MSMEApplicationForm for testing isolation
const populateFromDocuments = (selectedDocs: StoredDocument[]) => {
    let revenue = 0;

    selectedDocs.forEach(doc => {
        const data = doc.extractedData.data as any;
        if (doc.documentType === 'profit_loss') {
            if (data.revenue) {
                const parsed = parseFloat(String(data.revenue).replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) revenue = parsed;
            }
        }
        if (doc.documentType === 'gst_returns') {
            if (data.monthlyTurnover && !revenue) {
                const parsed = parseFloat(String(data.monthlyTurnover).replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) revenue = parsed * 12;
            }
        }
    });

    return { revenue };
};

describe('Application Form Auto-Population Properties', () => {

    it('should correctly extract annual revenue from Profit & Loss', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1000, max: 10000000 }),
                (revenueVal) => {
                    const docs: StoredDocument[] = [{
                        id: '1',
                        documentType: 'profit_loss',
                        fileName: 'pl.pdf',
                        fileSize: 1000,
                        uploadedAt: '',
                        extractedData: {
                            documentType: 'profit_loss',
                            fileName: 'pl.pdf',
                            extractedAt: '',
                            extractionConfidence: 'high',
                            data: { revenue: `₹${revenueVal}` }
                        }
                    }];

                    const result = populateFromDocuments(docs);
                    expect(result.revenue).toBe(revenueVal);
                }
            )
        );
    });

    it('should estimate annual revenue from GST monthly turnover if P&L missing', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1000, max: 1000000 }),
                (monthly) => {
                    const docs: StoredDocument[] = [{
                        id: '1',
                        documentType: 'gst_returns',
                        fileName: 'gst.pdf',
                        fileSize: 1000,
                        uploadedAt: '',
                        extractedData: {
                            documentType: 'gst_returns',
                            fileName: 'gst.pdf',
                            extractedAt: '',
                            extractionConfidence: 'high',
                            data: { monthlyTurnover: `₹${monthly}` }
                        }
                    }];

                    const result = populateFromDocuments(docs);
                    expect(result.revenue).toBe(monthly * 12);
                }
            )
        );
    });

    it('should prioritize P&L revenue over GST estimation', () => {
        const docs: StoredDocument[] = [
            {
                id: '1',
                documentType: 'profit_loss',
                fileName: 'pl.pdf',
                fileSize: 1000,
                uploadedAt: '',
                extractedData: {
                    documentType: 'profit_loss',
                    fileName: 'pl.pdf',
                    extractedAt: '',
                    extractionConfidence: 'high',
                    data: { revenue: '120000' }
                }
            },
            {
                id: '2',
                documentType: 'gst_returns',
                fileName: 'gst.pdf',
                fileSize: 1000,
                uploadedAt: '',
                extractedData: {
                    documentType: 'gst_returns',
                    fileName: 'gst.pdf',
                    extractedAt: '',
                    extractionConfidence: 'high',
                    data: { monthlyTurnover: '5000' } // 60k annual
                }
            }
        ];

        const result = populateFromDocuments(docs);
        expect(result.revenue).toBe(120000);
    });
});
