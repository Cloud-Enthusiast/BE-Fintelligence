import { useState, useCallback } from 'react';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { usePdfExtraction } from './usePdfExtraction';
import { CibilReportDetector } from '@/utils/cibilReportDetector';
import { EnhancedCibilExtractor } from '@/utils/enhancedCibilExtractor';
import { SimpleCibilExtractor } from '@/utils/simpleCibilExtractor';
import { EnhancedCibilData } from '@/types/enhanced-cibil';

export interface ExtractedData {
    fileName: string;
    fileType: string;
    fileSize: number;
    extractedText: string;
    metadata?: Record<string, any>;
    structuredData?: any[];
    error?: string;
    // Enhanced CIBIL data when detected
    enhancedCibilData?: EnhancedCibilData;
    isCibilReport?: boolean;
    cibilDetectionResult?: any;
}

export const useFileExtraction = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' });
    const { extractPdf, checkServerHealth, isProcessing: isPdfProcessing, progress: pdfProgress } = usePdfExtraction();



    const extractTextFromFile = useCallback(async (file: File): Promise<ExtractedData> => {
        setIsProcessing(true);
        setProgress({ current: 0, total: 1, stage: 'Starting extraction...' });

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
                // Use Python PyPDF service for all PDF processing
                const pdfResult = await extractPdf(file);
                
                if (pdfResult.success) {
                    result.extractedText = pdfResult.extracted_text;
                    result.metadata = {
                        ...result.metadata,
                        ...pdfResult.metadata,
                        totalPages: pdfResult.page_count,
                        pagesWithText: pdfResult.pages_with_text,
                        extractedInfo: pdfResult.extracted_info,
                        statistics: pdfResult.statistics,
                        pageBreakdown: pdfResult.pages,
                        confidence: pdfResult.confidence
                    };
                    
                    // Add structured data from extracted info
                    if (pdfResult.extracted_info) {
                        result.structuredData = [pdfResult.extracted_info];
                    }

                    // CIBIL Report Detection and Enhanced Processing
                    if (result.extractedText && result.extractedText.trim().length > 0) {
                        const cibilDetection = CibilReportDetector.detectCibilReport(result.extractedText);
                        result.cibilDetectionResult = cibilDetection;
                        result.isCibilReport = cibilDetection.isCibilReport;

                        // If CIBIL report detected, use simple extraction approach
                        if (cibilDetection.isCibilReport && cibilDetection.confidence >= 40) {
                            try {
                                // Use simple, direct extraction approach
                                const simpleExtractor = new SimpleCibilExtractor(result.extractedText);
                                const simpleData = simpleExtractor.extractAll();
                                
                                // Convert to EnhancedCibilData format with all fields
                                result.enhancedCibilData = {
                                    // Base fields from FinancialData
                                    cibilScore: simpleData.cibilScore,
                                    numberOfLoans: simpleData.loansPerBank || '0',
                                    totalLoanAmount: simpleData.totalAmountOfLoan,
                                    amountOverdue: '₹0.00', // Not in new structure, set default
                                    suitFiledAndDefault: simpleData.suitFiledWilfulDefault,
                                    settledAndWrittenOff: simpleData.settlementAmount,
                                    reportDate: '',
                                    applicantName: simpleData.nameOfCustomer,
                                    panNumber: '',
                                    accountNumbers: [],
                                    
                                    // Extended fields for complete table
                                    nameOfCustomer: simpleData.nameOfCustomer,
                                    bankName: simpleData.bankName,
                                    accountType: simpleData.accountType,
                                    loansPerBank: simpleData.loansPerBank,
                                    totalAmountOfLoan: simpleData.totalAmountOfLoan,
                                    bouncedDetails: simpleData.bouncedDetails,
                                    typeOfCollateral: simpleData.typeOfCollateral,
                                    emiAmount: simpleData.emiAmount,
                                    writtenOffAmountTotal: simpleData.writtenOffAmountTotal,
                                    writtenOffAmountPrincipal: simpleData.writtenOffAmountPrincipal,
                                    suitFiledWilfulDefault: simpleData.suitFiledWilfulDefault,
                                    settlementAmount: simpleData.settlementAmount,
                                    
                                    // Enhanced fields
                                    reportType: 'CIBIL' as const,
                                    processingMethod: ['SIMPLE_EXTRACTION'] as any,
                                    extractionQuality: {
                                        overallScore: Math.round(Object.values(simpleData.confidence).reduce((a, b) => a + b, 0) / 6),
                                        fieldsExtracted: Object.values(simpleData).filter(v => v && v !== '').length - 1, // -1 for confidence object
                                        totalFields: 6,
                                        qualityLevel: 'HIGH' as const,
                                        validationFlags: []
                                    },
                                    fieldConfidence: {
                                        cibilScore: simpleData.confidence.cibilScore / 100,
                                        numberOfLoans: simpleData.confidence.loansPerBank / 100,
                                        totalLoanAmount: simpleData.confidence.totalAmountOfLoan / 100,
                                        amountOverdue: 0.8, // Default confidence for calculated field
                                        suitFiledAndDefault: simpleData.confidence.suitFiledWilfulDefault / 100,
                                        settledAndWrittenOff: simpleData.confidence.settlementAmount / 100,
                                        reportDate: 0,
                                        applicantName: simpleData.confidence.nameOfCustomer / 100,
                                        panNumber: 0,
                                        accountNumbers: 0,
                                        
                                        // Extended field confidences
                                        nameOfCustomer: simpleData.confidence.nameOfCustomer / 100,
                                        bankName: simpleData.confidence.bankName / 100,
                                        accountType: simpleData.confidence.accountType / 100,
                                        loansPerBank: simpleData.confidence.loansPerBank / 100,
                                        totalAmountOfLoan: simpleData.confidence.totalAmountOfLoan / 100,
                                        bouncedDetails: simpleData.confidence.bouncedDetails / 100,
                                        typeOfCollateral: simpleData.confidence.typeOfCollateral / 100,
                                        emiAmount: simpleData.confidence.emiAmount / 100,
                                        writtenOffAmountTotal: simpleData.confidence.writtenOffAmountTotal / 100,
                                        writtenOffAmountPrincipal: simpleData.confidence.writtenOffAmountPrincipal / 100,
                                        suitFiledWilfulDefault: simpleData.confidence.suitFiledWilfulDefault / 100,
                                        settlementAmount: simpleData.confidence.settlementAmount / 100
                                    },
                                    extractionTimestamp: new Date().toISOString(),
                                    documentPages: result.metadata?.totalPages || 1,
                                    ocrConfidence: result.metadata?.confidence || 0.95
                                } as EnhancedCibilData;
                                
                                // Update metadata with CIBIL-specific information
                                result.metadata = {
                                    ...result.metadata,
                                    reportType: 'CIBIL',
                                    cibilDetection: cibilDetection,
                                    enhancedExtraction: true,
                                    extractionQuality: result.enhancedCibilData.extractionQuality,
                                    processingMethods: result.enhancedCibilData.processingMethod,
                                    extractionAnalytics: {
                                        methodsUsed: result.enhancedCibilData.processingMethod,
                                        primaryMethod: result.enhancedCibilData.processingMethod[0],
                                        fallbackUsed: result.enhancedCibilData.processingMethod.length > 1,
                                        ocrConfidence: result.enhancedCibilData.ocrConfidence,
                                        textLayerAvailable: result.metadata.pagesWithText > 0,
                                        ocrPagesProcessed: result.metadata.ocrPagesProcessed || 0,
                                        hybridProcessing: result.enhancedCibilData.processingMethod.includes('HYBRID')
                                    }
                                };
                            } catch (enhancedError) {
                                console.warn('Enhanced CIBIL extraction failed, falling back to standard extraction:', enhancedError);
                                // Fallback to standard extraction - data is already extracted above
                                result.metadata = {
                                    ...result.metadata,
                                    reportType: 'STANDARD',
                                    cibilDetection: cibilDetection,
                                    enhancedExtraction: false,
                                    enhancedExtractionError: enhancedError instanceof Error ? enhancedError.message : 'Unknown error'
                                };
                            }
                        } else {
                            // Standard extraction for non-CIBIL reports
                            result.metadata = {
                                ...result.metadata,
                                reportType: 'STANDARD',
                                cibilDetection: cibilDetection,
                                enhancedExtraction: false
                            };
                        }
                    }
                } else {
                    result.error = pdfResult.error || 'PDF extraction failed';
                    result.extractedText = '';
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
            setProgress({ current: 0, total: 0, stage: '' });
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
        isProcessing: isProcessing || isPdfProcessing,
        extractedData,
        processFile,
        clearData,
        progress: isPdfProcessing ? pdfProgress : progress
    };
};