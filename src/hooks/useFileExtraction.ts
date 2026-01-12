import { useState, useCallback } from 'react';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
    const [progress, setProgress] = useState({ current: 0, total: 0, stage: '', percentage: 0 });

    const extractTextFromFile = useCallback(async (file: File): Promise<ExtractedData> => {
        setIsProcessing(true);
        setProgress({ current: 0, total: 1, stage: 'Starting extraction...', percentage: 10 });

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

            setProgress({ current: 0, total: 1, stage: 'Processing file...', percentage: 30 });

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
                // PDF processing - currently not supported without backend service
                // Future: Could integrate a client-side PDF library like pdf.js
                result.error = 'PDF extraction requires backend service. Please upload Word, Excel, CSV, or text files.';
                result.extractedText = '';
                result.metadata = {
                    ...result.metadata,
                    note: 'PDF processing will be available in a future update'
                };
            }
            else {
                result.error = `Unsupported file type: ${file.type}`;
                result.extractedText = 'File type not supported for text extraction';
            }

            setProgress({ current: 1, total: 1, stage: 'Complete', percentage: 100 });
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
            setProgress({ current: 0, total: 0, stage: '', percentage: 0 });
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
        clearData,
        progress
    };
};
