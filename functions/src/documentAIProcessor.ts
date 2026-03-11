import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';

// Type definitions for Document AI outputs we care about
interface DocPage {
    pageNumber: number;
    tables: any[];
    formFields: any[];
}

interface DocResult {
    text: string;
    pages: DocPage[];
}

/**
 * Helper to extract text from a Document AI layout text anchor
 */
const getText = (textAnchor: any, text: string): string => {
    if (!textAnchor || !textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        return '';
    }

    return textAnchor.textSegments.map((segment: any) => {
        const startIndex = segment.startIndex || 0;
        const endIndex = segment.endIndex;
        return text.substring(Number(startIndex), Number(endIndex));
    }).join('');
};

/**
 * Helper to clean up extracted text
 */
const cleanText = (text: string): string => {
    return text.replace(/\n|:/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Converts a Document AI Table into a Markdown Table string
 */
export const tablesToMarkdown = (tables: any[], fullText: string): string => {
    if (!tables || tables.length === 0) return '';

    let markdown = '';

    tables.forEach((table, index) => {
        markdown += `\n### Table ${index + 1}\n\n`;

        // Process header rows
        if (table.headerRows && table.headerRows.length > 0) {
            const headerRow = table.headerRows[0];
            const headers = headerRow.cells.map((cell: any) =>
                cleanText(getText(cell?.layout?.textAnchor, fullText))
            );

            markdown += `| ${headers.join(' | ')} |\n`;
            markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        }

        // Process body rows
        if (table.bodyRows && table.bodyRows.length > 0) {
            table.bodyRows.forEach((row: any) => {
                const rowCells = row.cells.map((cell: any) =>
                    cleanText(getText(cell?.layout?.textAnchor, fullText))
                );
                markdown += `| ${rowCells.join(' | ')} |\n`;
            });
        }
        markdown += '\n';
    });

    return markdown;
};

/**
 * Converts Document AI Form Fields into a readable key-value string
 */
export const formFieldsToText = (formFields: any[], fullText: string): string => {
    if (!formFields || formFields.length === 0) return '';

    let textBlocks: string[] = [];

    formFields.forEach((field) => {
        const fieldName = field.fieldName ? cleanText(getText(field.fieldName.textAnchor, fullText)) : '';
        const fieldValue = field.fieldValue ? cleanText(getText(field.fieldValue.textAnchor, fullText)) : '';
        if (fieldName && fieldValue) {
            textBlocks.push(`${fieldName}: ${fieldValue}`);
        }
    });

    return textBlocks.join('\n');
};

/**
 * Orchestrator: Sends PDF to Document AI and returns structured Markdown text
 */
export const extractStructuredText = async (fileBase64: string, mimeType: string): Promise<string> => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!projectId) {
        throw new HttpsError('internal', 'GCP_PROJECT environment variable not set.');
    }

    // You need to set these in your Firebase environment or as process.env variables
    // Hardcoding for now based on typical Document AI setup, but should be configurable
    const location = 'us';
    const processorId = process.env.DOCUMENT_AI_CIBIL_PROCESSOR_ID;

    if (!processorId) {
        logger.error("Missing DOCUMENT_AI_CIBIL_PROCESSOR_ID environment variable. Ensure this is set via Firebase Secrets or config.");
        throw new HttpsError('internal', 'Document AI processor ID is not configured.');
    }

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Instantiates a client
    const client = new DocumentProcessorServiceClient();

    const request = {
        name,
        rawDocument: {
            content: fileBase64,
            mimeType: mimeType,
        },
    };

    try {
        logger.info(`Calling Document AI Form Parser for processor: ${processorId}`, { mimeType });

        // Recognizes text, tables, and form fields in the document
        const [result] = await client.processDocument(request);
        const document = result.document;

        if (!document || !document.text) {
            throw new Error("Document AI returned empty document or text.");
        }

        const fullText = document.text;
        const pages = document.pages || [];

        let structuredMarkdown = `# Document AI Structure Extraction\n\n`;

        // Adding the raw text ensures Gemini still has access to fine-print (like "Suit Filed") 
        // that might not be captured in a table or form field
        structuredMarkdown += `## Raw Extracted Text\n${fullText.substring(0, 10000)}...\n\n`;

        pages.forEach((page: any) => {
            structuredMarkdown += `## Page ${page.pageNumber || 1}\n\n`;

            if (page.formFields && page.formFields.length > 0) {
                structuredMarkdown += `### Key-Value Pairs\n`;
                structuredMarkdown += formFieldsToText(page.formFields, fullText);
                structuredMarkdown += `\n\n`;
            }

            if (page.tables && page.tables.length > 0) {
                structuredMarkdown += tablesToMarkdown(page.tables, fullText);
            }
        });

        return structuredMarkdown;

    } catch (error: any) {
        logger.error('Error processing document with Document AI:', { error: error.message });
        throw new HttpsError('internal', `Document AI processing failed: ${error.message}`);
    }
};
