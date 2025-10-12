import { useState, useCallback } from 'react';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

export interface ExtractedData {
    fileName: string;
    fileType: string;
    fileSize: number;
    extractedText: string;
    metadata?: Record<string, any>;
    structuredData?: any[];
    error?: string;
}

export const useFileExtraction = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

    // Configure PDF.js worker
    const initializePdfJs = useCallback(() => {
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
    }, []);

    const extractTextFromPdf = useCallback(async (file: File): Promise<{ text: string; metadata: any }> => {
        initializePdfJs();
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        const pages: string[] = [];
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (pageText) {
                pages.push(pageText);
                fullText += pageText + '\n\n';
            }
        }
        
        const metadata = {
            totalPages: pdf.numPages,
            pagesWithText: pages.length,
            pdfInfo: await pdf.getMetadata().catch(() => null),
            extractionMethod: 'PDF.js'
        };
        
        return { text: fullText.trim(), metadata };
    }, [initializePdfJs]);

    const extractTextFromFile = useCallback(async (file: File): Promise<ExtractedData> => {
        setIsProcessing(true);

        try {
            const result: ExtractedData = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                extractedText: '',
                metadata: {
                    lastModified: new Date(file.lastModified).toISOString(),
                    size: file.size,
                    type: file.type
                }
            };

            // Handle different file types
            if (file.type === 'text/plain') {
                result.extractedText = await file.text();
            }
            else if (file.type === 'application/json') {
                const text = await file.text();
                result.extractedText = text;
                try {
                    result.structuredData = [JSON.parse(text)];
                } catch (e) {
                    result.error = 'Invalid JSON format';
                }
            }
            else if (file.type === 'text/csv') {
                const text = await file.text();
                result.extractedText = text;

                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        result.structuredData = results.data;
                        result.metadata = {
                            ...result.metadata,
                            rows: results.data.length,
                            columns: results.meta.fields?.length || 0
                        };
                    }
                });
            }
            else if (file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml') ||
                file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const mammothResult = await mammoth.extractRawText({ arrayBuffer });
                result.extractedText = mammothResult.value;

                if (mammothResult.messages.length > 0) {
                    result.metadata = {
                        ...result.metadata,
                        warnings: mammothResult.messages.map(m => m.message)
                    };
                }
            }
            else if (file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml') ||
                file.type.includes('application/vnd.ms-excel') ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls')) {
                // Excel file processing
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON for structured data
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                result.structuredData = jsonData;

                // Convert to CSV text for display
                const csvText = XLSX.utils.sheet_to_csv(worksheet);
                result.extractedText = csvText;

                result.metadata = {
                    ...result.metadata,
                    sheets: workbook.SheetNames,
                    activeSheet: sheetName,
                    rows: jsonData.length,
                    columns: jsonData[0] ? (jsonData[0] as any[]).length : 0
                };
            }
            else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                // PDF text extraction using PDF.js
                try {
                    const { text, metadata: pdfMetadata } = await extractTextFromPdf(file);
                    result.extractedText = text;
                    result.metadata = {
                        ...result.metadata,
                        ...pdfMetadata
                    };
                    
                    if (!text || text.trim().length === 0) {
                        result.error = 'No text found in PDF. The PDF might contain only images or be password protected.';
                    }
                } catch (pdfError) {
                    console.error('PDF extraction error:', pdfError);
                    result.error = `PDF extraction failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`;
                    result.extractedText = 'Failed to extract text from PDF';
                }
            }
            else {
                result.error = `Unsupported file type: ${file.type}`;
                result.extractedText = 'File type not supported for text extraction';
            }

            return result;
        } catch (error) {
            return {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                extractedText: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const processFile = useCallback(async (file: File) => {
        const result = await extractTextFromFile(file);
        setExtractedData(result);
        return result;
    }, [extractTextFromFile]);

    const clearData = useCallback(() => {
        setExtractedData(null);
    }, []);

    return {
        isProcessing,
        extractedData,
        processFile,
        clearData
    };
};