import { describe, it, expect } from 'vitest';
import { tablesToMarkdown, formFieldsToText } from '../documentAIProcessor';

describe('Document AI Markdown Formatter', () => {
    const mockFullText = "Name John Doe Age 35 Score 750";

    it('should format key-value pairs correctly', () => {
        const mockFormFields = [
            {
                fieldName: { textAnchor: { textSegments: [{ startIndex: 0, endIndex: 4 }] } }, // "Name"
                fieldValue: { textAnchor: { textSegments: [{ startIndex: 5, endIndex: 13 }] } } // "John Doe"
            },
            {
                fieldName: { textAnchor: { textSegments: [{ startIndex: 14, endIndex: 17 }] } }, // "Age"
                fieldValue: { textAnchor: { textSegments: [{ startIndex: 18, endIndex: 20 }] } } // "35"
            }
        ];

        const result = formFieldsToText(mockFormFields, mockFullText);
        expect(result).toBe("Name: John Doe\\nAge: 35");
    });

    it('should format tables into markdown', () => {
        const mockTables = [
            {
                headerRows: [{
                    cells: [
                        { layout: { textAnchor: { textSegments: [{ startIndex: 0, endIndex: 4 }] } } }, // "Name"
                        { layout: { textAnchor: { textSegments: [{ startIndex: 14, endIndex: 17 }] } } } // "Age"
                    ]
                }],
                bodyRows: [{
                    cells: [
                        { layout: { textAnchor: { textSegments: [{ startIndex: 5, endIndex: 13 }] } } }, // "John Doe"
                        { layout: { textAnchor: { textSegments: [{ startIndex: 18, endIndex: 20 }] } } } // "35"
                    ]
                }]
            }
        ];

        const result = tablesToMarkdown(mockTables, mockFullText);
        expect(result).toContain("| Name | Age |");
        expect(result).toContain("| --- | --- |");
        expect(result).toContain("| John Doe | 35 |");
    });
});
