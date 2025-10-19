/**
 * Enhanced CIBIL Extractor
 * Specialized extraction for CIBIL credit reports with high accuracy
 */

import { FinancialDataExtractor } from './financialDataExtractor';
import {
    EnhancedCibilData,
    ExtractionResult,
    ValidationResult,
    ProcessingMethod,
    FieldConfidenceMap,
    ExtractionQuality,
    ValidationFlag,
    ReportType
} from '@/types/enhanced-cibil';

export class EnhancedCibilExtractor extends FinancialDataExtractor {
    private extractionText: string;
    private extractionMetadata?: any;

    constructor(text: string, metadata?: any) {
        super(text);
        this.extractionText = text;
        this.extractionMetadata = metadata;
    }

    /**
     * Main extraction method for enhanced CIBIL data
     */
    public extractEnhancedCibilData(): EnhancedCibilData {
        const startTime = Date.now();

        // Extract base financial data first
        const baseData = this.extractAll();

        // Extract CIBIL-specific fields with confidence scoring
        const cibilScore = this.extractWithConfidence('cibilScore');
        const numberOfLoans = this.extractWithConfidence('numberOfLoans');
        const totalLoanAmount = this.extractWithConfidence('totalLoanAmount');
        const amountOverdue = this.extractWithConfidence('amountOverdue');
        const suitFiledAndDefault = this.extractWithConfidence('suitFiledAndDefault');
        const settledAndWrittenOff = this.extractWithConfidence('settledAndWrittenOff');

        // Extract additional information
        const reportDate = this.extractWithConfidence('reportDate');
        const applicantName = this.extractWithConfidence('applicantName');
        const panNumber = this.extractWithConfidence('panNumber');
        const accountNumbers = this.extractAccountNumbersEnhanced();

        // Build field confidence map
        const fieldConfidence: FieldConfidenceMap = {
            cibilScore: cibilScore.confidence,
            numberOfLoans: numberOfLoans.confidence,
            totalLoanAmount: totalLoanAmount.confidence,
            amountOverdue: amountOverdue.confidence,
            suitFiledAndDefault: suitFiledAndDefault.confidence,
            settledAndWrittenOff: settledAndWrittenOff.confidence,
            reportDate: reportDate.confidence,
            applicantName: applicantName.confidence,
            panNumber: panNumber.confidence,
            accountNumbers: accountNumbers.confidence
        };

        // Determine processing methods and calculate effectiveness
        const processingMethods = this.determineProcessingMethods();
        const methodEffectiveness = this.calculateMethodEffectiveness(processingMethods, fieldConfidence);

        // Create enhanced data object
        const enhancedData: EnhancedCibilData = {
            ...baseData,
            cibilScore: cibilScore.value,
            numberOfLoans: numberOfLoans.value,
            totalLoanAmount: totalLoanAmount.value,
            amountOverdue: amountOverdue.value,
            suitFiledAndDefault: suitFiledAndDefault.value,
            settledAndWrittenOff: settledAndWrittenOff.value,
            reportDate: reportDate.value,
            applicantName: applicantName.value,
            panNumber: panNumber.value,
            accountNumbers: accountNumbers.value ? accountNumbers.value.split(',').map(s => s.trim()) : [],
            reportType: 'CIBIL' as ReportType,
            processingMethod: processingMethods,
            fieldConfidence,
            extractionQuality: this.calculateExtractionQuality(fieldConfidence),
            extractionTimestamp: new Date().toISOString(),
            documentPages: this.extractionMetadata?.totalPages || 1,
            ocrConfidence: this.extractionMetadata?.confidence || 0.8,
            // Add method effectiveness data
            methodEffectiveness
        };

        // Validate extracted data
        const validationResult = this.validateExtractedData(enhancedData);
        enhancedData.extractionQuality.validationFlags = validationResult.flags;

        return enhancedData;
    }

    /**
     * Extract field with confidence scoring
     */
    private extractWithConfidence(field: string): ExtractionResult {
        try {
            let value = '';
            let confidence = 0;
            let method: ProcessingMethod = 'PATTERN_MATCH';
            const metadata: any = {};

            switch (field) {
                case 'cibilScore':
                    const cibilResult = this.extractCibilScoreEnhanced();
                    value = cibilResult.value;
                    confidence = cibilResult.confidence;
                    Object.assign(metadata, cibilResult.metadata);
                    break;
                case 'numberOfLoans':
                    const loanResult = this.extractLoanCountEnhanced();
                    value = loanResult.value;
                    confidence = loanResult.confidence;
                    Object.assign(metadata, loanResult.metadata);
                    break;
                case 'totalLoanAmount':
                    const totalAmountResult = this.extractTotalLoanAmountEnhanced();
                    value = totalAmountResult.value;
                    confidence = totalAmountResult.confidence;
                    Object.assign(metadata, totalAmountResult.metadata);
                    break;
                case 'amountOverdue':
                    const overdueResult = this.extractAmountOverdueEnhanced();
                    value = overdueResult.value;
                    confidence = overdueResult.confidence;
                    Object.assign(metadata, overdueResult.metadata);
                    break;
                case 'suitFiledAndDefault':
                    const suitResult = this.extractSuitFiledAndDefaultEnhanced();
                    value = suitResult.value;
                    confidence = suitResult.confidence;
                    Object.assign(metadata, suitResult.metadata);
                    break;
                case 'settledAndWrittenOff':
                    const settledResult = this.extractSettledAndWrittenOffEnhanced();
                    value = settledResult.value;
                    confidence = settledResult.confidence;
                    Object.assign(metadata, settledResult.metadata);
                    break;
                case 'reportDate':
                    const dateResult = this.extractReportDateEnhanced();
                    value = dateResult.value;
                    confidence = dateResult.confidence;
                    Object.assign(metadata, dateResult.metadata);
                    break;
                case 'applicantName':
                    const nameResult = this.extractApplicantNameEnhanced();
                    value = nameResult.value;
                    confidence = nameResult.confidence;
                    Object.assign(metadata, nameResult.metadata);
                    break;
                case 'panNumber':
                    const panResult = this.extractPanNumberEnhanced();
                    value = panResult.value;
                    confidence = panResult.confidence;
                    Object.assign(metadata, panResult.metadata);
                    break;
                default:
                    method = 'FAILED';
            }

            return {
                value,
                confidence,
                method,
                metadata
            };
        } catch (error) {
            return {
                value: '',
                confidence: 0,
                method: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Extract CIBIL score with validation
     */
    private extractCibilScoreEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            // High confidence patterns
            { pattern: /cibil\s*(?:trans\s*union\s*)?score\s*:?\s*(\d{3})/i, confidence: 0.95 },
            { pattern: /credit\s*score\s*:?\s*(\d{3})/i, confidence: 0.9 },
            { pattern: /your\s*(?:cibil\s*)?score\s*(?:is\s*)?:?\s*(\d{3})/i, confidence: 0.9 },
            { pattern: /current\s*score\s*:?\s*(\d{3})/i, confidence: 0.85 },
            { pattern: /score\s*:?\s*(\d{3})/i, confidence: 0.8 },

            // Context-based patterns
            { pattern: /(\d{3})\s*(?:out\s+of\s+900|\/900)/i, confidence: 0.9 },
            { pattern: /(\d{3})\s*(?:cibil|credit|score)/i, confidence: 0.75 },

            // Table format patterns
            { pattern: /score\s*\|\s*(\d{3})/i, confidence: 0.8 },
            { pattern: /(\d{3})\s*\|\s*score/i, confidence: 0.8 },

            // Fallback patterns
            { pattern: /\b(\d{3})\b(?=.*(?:cibil|credit|score))/i, confidence: 0.6 }
        ];

        let bestMatch = { value: '', confidence: 0, metadata: {} };

        for (const patternConfig of patterns) {
            const matches = [...this.originalText.matchAll(new RegExp(patternConfig.pattern.source, 'gi'))];

            for (const match of matches) {
                if (match[1]) {
                    const score = parseInt(match[1]);
                    if (score >= 300 && score <= 900 && patternConfig.confidence > bestMatch.confidence) {
                        bestMatch = {
                            value: score.toString(),
                            confidence: patternConfig.confidence,
                            metadata: {
                                pattern: patternConfig.pattern.source,
                                originalValue: match[1],
                                position: match.index,
                                context: this.getContext(match.index || 0, 50)
                            }
                        };
                    }
                }
            }
        }

        return {
            value: bestMatch.value,
            confidence: bestMatch.confidence,
            metadata: {
                pattern: bestMatch.pattern,
                context: bestMatch.context,
                matchCount: patterns.reduce((count, p) => count + (this.extractionText.match(p) ? 1 : 0), 0)
            }
        };
    }

    /**
     * Extract loan count
     */
    private extractLoanCountEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            // Enhanced patterns for better loan count detection
            { pattern: /(?:total\s*)?(?:number\s*of\s*)?(?:active\s*)?(?:loan|account)s?\s*:?\s*(\d+)/i, confidence: 0.9 },
            { pattern: /(\d+)\s*(?:active\s*)?(?:loan|account)s?\s*(?:found|reported|listed|available)/i, confidence: 0.85 },
            { pattern: /accounts?\s*in\s*report\s*:?\s*(\d+)/i, confidence: 0.95 },
            { pattern: /total\s*accounts?\s*:?\s*(\d+)/i, confidence: 0.9 },
            { pattern: /credit\s*facilit(?:y|ies)\s*:?\s*(\d+)/i, confidence: 0.8 },
            { pattern: /(\d+)\s*credit\s*lines?/i, confidence: 0.8 },
            { pattern: /loan\s*count\s*:?\s*(\d+)/i, confidence: 0.85 },
            { pattern: /account\s*count\s*:?\s*(\d+)/i, confidence: 0.85 },
            // Fallback patterns
            { pattern: /loans?\s*:?\s*(\d+)/i, confidence: 0.7 },
            { pattern: /accounts?\s*:?\s*(\d+)/i, confidence: 0.6 }
        ];

        let bestMatch = { value: '', confidence: 0, metadata: {} };

        for (const patternConfig of patterns) {
            const match = this.originalText.match(patternConfig.pattern);
            if (match && match[1]) {
                const count = parseInt(match[1]);

                // Validate reasonable loan count (0-50)
                if (count >= 0 && count <= 50 && patternConfig.confidence > bestMatch.confidence) {
                    bestMatch = {
                        value: count.toString(),
                        confidence: patternConfig.confidence,
                        metadata: {
                            pattern: patternConfig.pattern.source,
                            originalValue: match[1],
                            position: match.index
                        }
                    };
                }
            }
        }

        // If no specific count found, try to count account numbers or loan references
        if (bestMatch.confidence === 0) {
            const accountNumbers = this.originalText.match(/\b\d{10,20}\b/g) || [];
            const loanReferences = this.originalText.match(/loan\s*(?:no|number|id)\s*:?\s*\w+/gi) || [];

            if (accountNumbers.length > 0) {
                return {
                    value: accountNumbers.length.toString(),
                    confidence: 0.6,
                    metadata: {
                        method: 'account_number_count',
                        note: `Counted ${accountNumbers.length} potential account numbers`
                    }
                };
            }

            if (loanReferences.length > 0) {
                return {
                    value: loanReferences.length.toString(),
                    confidence: 0.5,
                    metadata: {
                        method: 'loan_reference_count',
                        note: `Counted ${loanReferences.length} loan references`
                    }
                };
            }
        }

        return bestMatch.confidence > 0 ? bestMatch : {
            value: '0',
            confidence: 0.3,
            metadata: { note: 'No loan count indicators found' }
        };
    }

    /**
     * Extract total loan amount
     */
    private extractTotalLoanAmountEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            /total\s*(?:loan\s*)?(?:sanctioned\s*)?amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /sanctioned\s*amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /principal\s*(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /credit\s*limit\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i
        ];

        return this.extractAmountValue(patterns, 'total loan amount');
    }

    /**
     * Extract amount overdue
     */
    private extractAmountOverdueEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            /(?:amount\s*)?overdue\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /outstanding\s*(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /current\s*balance\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /dues\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i
        ];

        return this.extractAmountValue(patterns, 'amount overdue');
    }

    /**
     * Extract suit filed and default information
     */
    private extractSuitFiledAndDefaultEnhanced(): { value: string; confidence: number; metadata: any } {
        const text = this.originalText.toLowerCase();

        // Enhanced patterns for better detection
        const patterns = [
            // Direct mentions with high confidence
            { pattern: /suit\s*filed/i, value: 'Yes', confidence: 0.95 },
            { pattern: /legal\s*action\s*(?:taken|initiated)/i, value: 'Yes', confidence: 0.9 },
            { pattern: /court\s*case/i, value: 'Yes', confidence: 0.85 },
            { pattern: /litigation/i, value: 'Yes', confidence: 0.8 },
            { pattern: /wilful\s*default/i, value: 'Yes', confidence: 0.9 },
            { pattern: /payment\s*default/i, value: 'Yes', confidence: 0.85 },
            { pattern: /\bdefault\b/i, value: 'Yes', confidence: 0.8 },
            { pattern: /\bnpa\b/i, value: 'Yes', confidence: 0.9 },
            { pattern: /non[\s-]?performing/i, value: 'Yes', confidence: 0.85 },

            // Explicit status indicators
            { pattern: /suit\s*filed\s*:?\s*yes/i, value: 'Yes', confidence: 0.95 },
            { pattern: /suit\s*filed\s*:?\s*no/i, value: 'No', confidence: 0.95 },
            { pattern: /default\s*:?\s*yes/i, value: 'Yes', confidence: 0.9 },
            { pattern: /default\s*:?\s*no/i, value: 'No', confidence: 0.9 },
            { pattern: /legal\s*action\s*:?\s*yes/i, value: 'Yes', confidence: 0.9 },
            { pattern: /legal\s*action\s*:?\s*no/i, value: 'No', confidence: 0.9 }
        ];

        let bestMatch = { value: '', confidence: 0, metadata: {} };

        for (const patternConfig of patterns) {
            const match = this.originalText.match(patternConfig.pattern);
            if (match && patternConfig.confidence > bestMatch.confidence) {
                bestMatch = {
                    value: patternConfig.value,
                    confidence: patternConfig.confidence,
                    metadata: {
                        pattern: patternConfig.pattern.source,
                        match: match[0],
                        position: match.index
                    }
                };
            }
        }

        // If no explicit match, check for general indicators
        if (bestMatch.confidence === 0) {
            const indicators = ['suit', 'legal', 'court', 'default', 'npa'];
            const foundIndicators = indicators.filter(indicator => text.includes(indicator));

            if (foundIndicators.length > 0) {
                return {
                    value: 'Possible',
                    confidence: 0.6,
                    metadata: {
                        indicators: foundIndicators,
                        note: 'Potential legal issues detected'
                    }
                };
            }

            // Default to "No" if nothing found
            return {
                value: 'No',
                confidence: 0.7,
                metadata: { note: 'No legal indicators found' }
            };
        }

        return bestMatch;
    }

    /**
     * Extract settled and written off amounts
     */
    private extractSettledAndWrittenOffEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            // Enhanced patterns for better detection
            { pattern: /settled\s*(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i, confidence: 0.95 },
            { pattern: /written\s*off\s*(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i, confidence: 0.9 },
            { pattern: /settlement\s*(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i, confidence: 0.9 },
            { pattern: /closure\s*amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i, confidence: 0.85 },
            { pattern: /write[\s-]?off\s*(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i, confidence: 0.85 },
            { pattern: /one[\s-]?time\s*settlement\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i, confidence: 0.9 }
        ];

        let bestMatch = { value: '', confidence: 0, metadata: {} };
        const foundAmounts: string[] = [];

        for (const patternConfig of patterns) {
            const match = this.originalText.match(patternConfig.pattern);
            if (match && match[1]) {
                const normalizedAmount = this.normalizeAmountValue(match[1]);
                if (normalizedAmount && patternConfig.confidence > bestMatch.confidence) {
                    bestMatch = {
                        value: normalizedAmount,
                        confidence: patternConfig.confidence,
                        metadata: {
                            pattern: patternConfig.pattern.source,
                            originalValue: match[1],
                            position: match.index
                        }
                    };
                    foundAmounts.push(normalizedAmount);
                }
            }
        }

        // Check for status indicators even if no amount found
        if (bestMatch.confidence === 0) {
            const statusPatterns = [
                /settled/i,
                /written\s*off/i,
                /write[\s-]?off/i,
                /closure/i,
                /settlement/i
            ];

            for (const pattern of statusPatterns) {
                if (this.originalText.match(pattern)) {
                    return {
                        value: 'Yes (Amount not specified)',
                        confidence: 0.7,
                        metadata: {
                            pattern: pattern.source,
                            note: 'Settlement status found but amount not specified'
                        }
                    };
                }
            }

            return {
                value: 'No',
                confidence: 0.8,
                metadata: { note: 'No settlement indicators found' }
            };
        }

        return bestMatch;
    }

    /**
     * Extract report date
     */
    private extractReportDateEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            /report\s*date\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
            /generated\s*on\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
            /date\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
        ];

        return this.extractTextValue(patterns, 'report date');
    }

    /**
     * Extract applicant name
     */
    private extractApplicantNameEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            /name\s*:?\s*([a-zA-Z\s]{2,50})/i,
            /applicant\s*name\s*:?\s*([a-zA-Z\s]{2,50})/i,
            /customer\s*name\s*:?\s*([a-zA-Z\s]{2,50})/i
        ];

        return this.extractTextValue(patterns, 'applicant name');
    }

    /**
     * Extract PAN number
     */
    private extractPanNumberEnhanced(): { value: string; confidence: number; metadata: any } {
        const patterns = [
            /pan\s*(?:number\s*)?:?\s*([A-Z]{5}\d{4}[A-Z])/i,
            /permanent\s*account\s*number\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i
        ];

        return this.extractTextValue(patterns, 'PAN number');
    }

    /**
     * Extract account numbers
     */
    private extractAccountNumbersEnhanced(): ExtractionResult {
        const patterns = [
            /account\s*(?:number\s*)?:?\s*(\d{10,20})/gi,
            /a\/c\s*(?:no\s*)?:?\s*(\d{10,20})/gi,
            /loan\s*(?:account\s*)?(?:number\s*)?:?\s*(\d{10,20})/gi
        ];

        const accountNumbers: string[] = [];
        let totalMatches = 0;

        for (const pattern of patterns) {
            const matches = [...this.extractionText.matchAll(pattern)];
            totalMatches += matches.length;

            for (const match of matches) {
                if (match[1] && !accountNumbers.includes(match[1])) {
                    accountNumbers.push(match[1]);
                }
            }
        }

        const confidence = Math.min(accountNumbers.length * 0.2, 1.0);

        return {
            value: accountNumbers.join(', '),
            confidence,
            method: 'PATTERN_MATCH',
            metadata: {
                matchCount: totalMatches,
                originalValue: accountNumbers.join(', ')
            }
        };
    }

    // Helper methods for extraction

    private extractNumericValue(patterns: RegExp[], min: number, max: number, fieldName: string) {
        let bestMatch = { value: '', confidence: 0, metadata: {} };

        for (const pattern of patterns) {
            const match = this.extractionText.match(pattern);
            if (match && match[1]) {
                const numValue = parseInt(match[1]);
                if (numValue >= min && numValue <= max) {
                    const confidence = 0.8;
                    if (confidence > bestMatch.confidence) {
                        bestMatch = {
                            value: numValue.toString(),
                            confidence,
                            metadata: {
                                pattern: pattern.source,
                                originalValue: match[1],
                                context: this.getContext(match.index || 0, 30)
                            }
                        };
                    }
                }
            }
        }

        return bestMatch;
    }

    private extractAmountValue(patterns: RegExp[], fieldName: string) {
        let bestMatch = { value: '', confidence: 0, metadata: {} };

        for (const pattern of patterns) {
            const match = this.extractionText.match(pattern);
            if (match && match[1]) {
                const normalizedAmount = this.normalizeAmount(match[1]);
                const confidence = 0.7;
                if (confidence > bestMatch.confidence) {
                    bestMatch = {
                        value: normalizedAmount,
                        confidence,
                        metadata: {
                            pattern: pattern.source,
                            originalValue: match[1],
                            context: this.getContext(match.index || 0, 30)
                        }
                    };
                }
            }
        }

        return bestMatch;
    }

    private extractTextValue(patterns: RegExp[], fieldName: string) {
        let bestMatch = { value: '', confidence: 0, metadata: {} };

        for (const pattern of patterns) {
            const match = this.extractionText.match(pattern);
            if (match && match[1]) {
                const value = match[1].trim();
                const confidence = 0.7;
                if (confidence > bestMatch.confidence) {
                    bestMatch = {
                        value,
                        confidence,
                        metadata: {
                            pattern: pattern.source,
                            originalValue: match[1],
                            context: this.getContext(match.index || 0, 30)
                        }
                    };
                }
            }
        }

        return bestMatch;
    }

    private calculateScoreConfidence(score: number, pattern: RegExp, position: number): number {
        let confidence = 0.6; // Base confidence

        // Higher confidence for scores in typical range
        if (score >= 600 && score <= 850) confidence += 0.2;
        if (score >= 700 && score <= 800) confidence += 0.1;

        // Higher confidence for specific CIBIL patterns
        if (pattern.source.includes('cibil')) confidence += 0.1;
        if (pattern.source.includes('credit.*score')) confidence += 0.05;

        return Math.min(confidence, 1.0);
    }

    private normalizeAmount(amount: string): string {
        // Remove currency symbols and normalize format
        let normalized = amount.replace(/[₹Rs\.,]/g, '').trim();

        // Handle different formats (Cr, L, K)
        if (normalized.includes('Cr') || normalized.includes('cr')) {
            const value = parseFloat(normalized.replace(/[Cr]/gi, ''));
            return `₹${value.toFixed(2)} Cr`;
        } else if (normalized.includes('L') || normalized.includes('l')) {
            const value = parseFloat(normalized.replace(/[Ll]/g, ''));
            return `₹${value.toFixed(2)} L`;
        } else if (normalized.includes('K') || normalized.includes('k')) {
            const value = parseFloat(normalized.replace(/[Kk]/g, ''));
            return `₹${value.toFixed(2)} K`;
        } else {
            const value = parseFloat(normalized);
            if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
            if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(2)} K`;
            return `₹${value.toFixed(2)}`;
        }
    }

    private normalizeYesNoValue(value: string): string {
        const normalized = value.toLowerCase().trim();
        if (normalized === 'y' || normalized === 'yes' || normalized === '1') return 'Yes';
        if (normalized === 'n' || normalized === 'no' || normalized === '0') return 'No';
        return value;
    }

    private getContext(position: number, length: number): string {
        const start = Math.max(0, position - length);
        const end = Math.min(this.extractionText.length, position + length);
        return this.extractionText.substring(start, end);
    }

    private determineProcessingMethods(): ProcessingMethod[] {
        const methods: ProcessingMethod[] = ['PATTERN_MATCH'];

        // Check for text layer extraction
        if (this.extractionMetadata?.pagesWithText > 0 || this.extractionMetadata?.textLayer) {
            methods.push('TEXT_LAYER');
        }

        // Check for OCR processing
        if (this.extractionMetadata?.ocrPagesProcessed > 0 || this.extractionMetadata?.ocrUsed) {
            methods.push('OCR');
        }

        // Determine if hybrid processing was used
        if (methods.includes('TEXT_LAYER') && methods.includes('OCR')) {
            methods.push('HYBRID');
        }

        // Check extraction method from metadata
        if (this.extractionMetadata?.extraction_method) {
            const extractionMethod = this.extractionMetadata.extraction_method.toLowerCase();
            if (extractionMethod.includes('ocr') && !methods.includes('OCR')) {
                methods.push('OCR');
            }
            if (extractionMethod.includes('text') && !methods.includes('TEXT_LAYER')) {
                methods.push('TEXT_LAYER');
            }
            if (extractionMethod.includes('both') || extractionMethod.includes('hybrid')) {
                if (!methods.includes('HYBRID')) methods.push('HYBRID');
            }
        }

        return methods;
    }

    private calculateExtractionQuality(fieldConfidence: FieldConfidenceMap): ExtractionQuality {
        const confidenceValues = Object.values(fieldConfidence);
        const totalFields = confidenceValues.length;
        const fieldsExtracted = confidenceValues.filter(c => c > 0.3).length;
        const averageConfidence = confidenceValues.reduce((sum, c) => sum + c, 0) / totalFields;

        const overallScore = Math.round(averageConfidence * 100);

        let qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (overallScore >= 80) qualityLevel = 'HIGH';
        else if (overallScore >= 60) qualityLevel = 'MEDIUM';

        return {
            overallScore,
            fieldsExtracted,
            totalFields,
            qualityLevel,
            validationFlags: []
        };
    }

    /**
     * Calculate processing method effectiveness
     */
    private calculateMethodEffectiveness(methods: ProcessingMethod[], fieldConfidence: FieldConfidenceMap): any {
        const confidenceValues = Object.values(fieldConfidence);
        const averageConfidence = confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length;

        const effectiveness = {
            primaryMethod: methods[0],
            methodCount: methods.length,
            averageConfidence,
            effectiveness: 'LOW' as 'HIGH' | 'MEDIUM' | 'LOW',
            recommendations: [] as string[]
        };

        // Determine effectiveness based on confidence and methods used
        if (averageConfidence >= 0.8) {
            effectiveness.effectiveness = 'HIGH';
        } else if (averageConfidence >= 0.6) {
            effectiveness.effectiveness = 'MEDIUM';
        }

        // Add recommendations based on method performance
        if (methods.includes('OCR') && this.extractionMetadata?.ocrConfidence < 0.7) {
            effectiveness.recommendations.push('OCR confidence is low - consider document quality improvement');
        }

        if (!methods.includes('TEXT_LAYER') && this.extractionMetadata?.pagesWithText > 0) {
            effectiveness.recommendations.push('Text layer available but not fully utilized');
        }

        if (methods.includes('HYBRID') && averageConfidence < 0.7) {
            effectiveness.recommendations.push('Hybrid processing used but results could be improved');
        }

        return effectiveness;
    }

    private validateExtractedData(data: EnhancedCibilData): ValidationResult {
        const flags: ValidationFlag[] = [];

        // Validate CIBIL score
        if (data.cibilScore) {
            const score = parseInt(data.cibilScore);
            if (isNaN(score) || score < 300 || score > 900) {
                flags.push({
                    field: 'cibilScore',
                    issue: 'CIBIL score outside valid range (300-900)',
                    severity: 'ERROR',
                    suggestion: 'Verify the extracted score value'
                });
            }
        }

        // Validate loan count
        if (data.numberOfLoans) {
            const count = parseInt(data.numberOfLoans);
            if (isNaN(count) || count < 0 || count > 50) {
                flags.push({
                    field: 'numberOfLoans',
                    issue: 'Loan count seems unrealistic',
                    severity: 'WARNING',
                    suggestion: 'Check if the extracted count is accurate'
                });
            }
        }

        return {
            isValid: flags.filter(f => f.severity === 'ERROR').length === 0,
            flags,
            confidence: 0.8
        };
    }
}