
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractMsmeDocument } from '../utils/msmeFinancialExtractor';
import { MSMEDocumentType } from '../types/msmeDocuments';

// Generators for financial text
// We reconstruct the text that the patterns expect to see if they extract correctly.

describe('Financial Data Extraction Properties', () => {

    // Property 4: Document-Specific Data Extraction for Balance Sheet
    it('should extract Balance Sheet fields correctly', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1000, max: 10000000 }),
                fc.integer({ min: 1000, max: 10000000 }),
                (assets, liabilities) => {
                    const text = `
            Balance Sheet as of 31st March 2024
            Total Assets: ₹${assets.toLocaleString('en-IN')}
            Total Liabilities: ₹${liabilities.toLocaleString('en-IN')}
            Net Worth: ₹${(assets - liabilities).toLocaleString('en-IN')}
          `;

                    const result = extractMsmeDocument({
                        type: 'balance_sheet',
                        extractedText: text,
                        fileName: 'test_bs.pdf'
                    });

                    // Check extraction logic (it removes currency symbols and converts, but our result is formatted string "₹...")
                    // The extractor returns formatted strings like "₹1,00,000"
                    expect(result.data).toHaveProperty('totalAssets');
                    expect((result.data as any).totalAssets).toContain(assets.toLocaleString('en-IN'));
                    expect((result.data as any).totalLiabilities).toContain(liabilities.toLocaleString('en-IN'));
                }
            )
        );
    });

    // Property: Profit & Loss Extraction
    it('should extract Profit & Loss fields correctly', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1000, max: 10000000 }),
                (revenue) => {
                    const text = `
            Statement of Profit & Loss
            Total Revenue: INR ${revenue}
            Net Profit: ${Math.floor(revenue * 0.2)}
          `;

                    const result = extractMsmeDocument({
                        type: 'profit_loss',
                        extractedText: text,
                        fileName: 'test_pl.pdf'
                    });

                    // Our extractor is robust enough to handle "Total Revenue: INR 1000"
                    expect((result.data as any).revenue).toContain(revenue.toLocaleString('en-IN'));
                }
            )
        );
    });

    // Property 5: Error Handling (or rather, Partial Extraction handling)
    // If text is garbage, it should return N/A but not crash
    it('should handle malformed text gracefully', () => {
        const text = "This is a random document with no financial data.";
        const result = extractMsmeDocument({
            type: 'balance_sheet',
            extractedText: text,
            fileName: 'garbage.pdf'
        });

        expect(result.extractionConfidence).toBe('low');
        expect((result.data as any).totalAssets).toBe('N/A');
    });

    // Property: GST Extraction
    it('should extract GST fields', () => {
        const text = "GSTIN: 27AABCU9603R1ZN  Total Turnover: ₹50,00,000";
        const result = extractMsmeDocument({
            type: 'gst_returns',
            extractedText: text,
            fileName: 'gst.pdf'
        });
        expect((result.data as any).gstNumber).toBe('27AABCU9603R1ZN');
        expect((result.data as any).monthlyTurnover).toBe('₹50,00,000');
    });

});
