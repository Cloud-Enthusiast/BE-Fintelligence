
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { DOCUMENT_TYPE_CONFIG, MSMEDocumentType } from '@/types/msmeDocuments';

// Helper to check if a mime match exists
const getMimesForFormat = (fmt: string) => {
    if (fmt === 'PDF') return ['application/pdf'];
    if (fmt === 'Excel') return ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (fmt === 'CSV') return ['text/csv'];
    if (fmt === 'JSON') return ['application/json'];
    return [];
};

describe('Document Upload Validation Properties', () => {

    // Property 2: Document Format Support
    // Verify that the CONFIG accepts the right formats as per requirements
    it('should have correct accepted formats for each document type', () => {
        const requirements: Record<MSMEDocumentType, string[]> = {
            balance_sheet: ['PDF', 'Excel'], // Req 2.2
            profit_loss: ['PDF', 'Excel'], // Req 2.3
            bank_statement: ['PDF'], // Req 2.4
            gst_returns: ['PDF'], // Req 2.5 (JSON added in code)
            itr_document: ['PDF'], // Req 2.6
            cibil_report: ['PDF'] // Req 2.7
        };

        Object.entries(requirements).forEach(([type, formats]) => {
            const configFormats = DOCUMENT_TYPE_CONFIG[type as MSMEDocumentType].acceptedFormats;
            formats.forEach(fmt => {
                expect(configFormats).toContain(fmt);
            });
        });
    });

    // Property: Mime Type correctness (Logic check)
    it('should resolve formats to valid mime types', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('PDF', 'Excel', 'CSV', 'JSON'),
                (fmt) => {
                    const mimes = getMimesForFormat(fmt);
                    expect(mimes.length).toBeGreaterThan(0);
                    mimes.forEach(mime => expect(mime).toContain('/'));
                }
            )
        );
    });

});
