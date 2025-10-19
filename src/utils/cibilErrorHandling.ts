/**
 * CIBIL Extraction Error Handling System
 * 
 * Provides comprehensive error handling, recovery mechanisms, and validation
 * for CIBIL data extraction processes as specified in requirements 3.4, 5.4, 6.4
 */

import {
    ValidationFlag,
    ValidationSeverity,
    ExtractionResult,
    ValidationResult,
    ProcessingMethod,
    EnhancedCibilData
} from '@/types/enhanced-cibil';
import { CIBIL_VALIDATION_RULES, createValidationFlag } from '@/types/validation-rules';

/**
 * Structured error class for CIBIL extraction operations
 * Provides detailed error information for debugging and recovery
 */
export class ExtractionError extends Error {
    public readonly timestamp: string;
    public readonly extractionContext?: string;
    public readonly attemptedMethods?: ProcessingMethod[];
    public readonly recoveryStrategies?: string[];

    constructor(
        public readonly field: string,
        public readonly reason: string,
        public readonly severity: ValidationSeverity,
        public readonly originalValue?: string,
        public readonly context?: {
            extractionMethod?: ProcessingMethod;
            patternUsed?: string;
            textPosition?: number;
            surroundingText?: string;
            attemptCount?: number;
            fallbackAvailable?: boolean;
        }
    ) {
        super(`Extraction failed for ${field}: ${reason}`);
        this.name = 'ExtractionError';
        this.timestamp = new Date().toISOString();
        
        // Set extraction context for debugging
        if (context) {
            this.extractionContext = JSON.stringify(context);
            this.attemptedMethods = context.extractionMethod ? [context.extractionMethod] : undefined;
            
            // Suggest recovery strategies based on error type
            this.recoveryStrategies = this.generateRecoveryStrategies();
        }
    }

    /**
     * Generate recovery strategies based on error context
     */
    private generateRecoveryStrategies(): string[] {
        const strategies: string[] = [];

        if (this.context?.extractionMethod === 'OCR') {
            strategies.push('Try text layer extraction');
            strategies.push('Improve OCR preprocessing');
        }

        if (this.context?.extractionMethod === 'TEXT_LAYER') {
            strategies.push('Fallback to OCR extraction');
            strategies.push('Use hybrid extraction method');
        }

        if (this.context?.patternUsed) {
            strategies.push('Try alternative extraction patterns');
            strategies.push('Use fuzzy matching for pattern detection');
        }

        if (this.context?.fallbackAvailable) {
            strategies.push('Use standard financial extraction as fallback');
        }

        if (strategies.length === 0) {
            strategies.push('Manual verification required');
        }

        return strategies;
    }

    /**
     * Convert error to validation flag
     */
    public toValidationFlag(): ValidationFlag {
        return createValidationFlag(
            this.field,
            this.reason,
            this.severity,
            this.recoveryStrategies?.join('; ')
        );
    }

    /**
     * Check if error is recoverable
     */
    public isRecoverable(): boolean {
        return this.severity === 'WARNING' || 
               (this.context?.fallbackAvailable === true) ||
               (this.recoveryStrategies && this.recoveryStrategies.length > 1);
    }
}

/**
 * Comprehensive error handling and recovery system for CIBIL extraction
 * Provides graceful error recovery and data correction capabilities
 */
export class CibilExtractionHandler {
    private static readonly MAX_RETRY_ATTEMPTS = 3;
    private static readonly CONFIDENCE_THRESHOLD = 0.5;

    /**
     * Handle extraction errors with appropriate recovery strategies
     * 
     * @param error - The extraction error that occurred
     * @param fallbackValue - Optional fallback value to use
     * @param retryCallback - Optional callback for retry attempts
     * @returns ExtractionResult with error handling applied
     */
    public static handleExtractionError(
        error: ExtractionError,
        fallbackValue?: string,
        retryCallback?: () => ExtractionResult
    ): ExtractionResult {
        // Log error for monitoring and debugging
        console.warn(`CIBIL Extraction Error: ${error.message}`, {
            field: error.field,
            severity: error.severity,
            context: error.extractionContext,
            recoveryStrategies: error.recoveryStrategies,
            timestamp: error.timestamp
        });

        // Attempt recovery based on error severity and context
        if (error.isRecoverable() && retryCallback) {
            try {
                const retryResult = retryCallback();
                if (retryResult.confidence > this.CONFIDENCE_THRESHOLD) {
                    const metadata = {
                        ...retryResult.metadata,
                        recoveredFromError: true,
                        originalError: error.reason,
                        recoveryStrategy: 'retry_callback'
                    };
                    return {
                        ...retryResult,
                        metadata
                    };
                }
            } catch (retryError) {
                console.warn(`Retry failed for field ${error.field}:`, retryError);
            }
        }

        // Use fallback value if available and valid
        if (fallbackValue && this.isValidFallbackValue(error.field, fallbackValue)) {
            const metadata = {
                recoveredFromError: true,
                originalError: error.reason,
                recoveryStrategy: 'fallback_value',
                fallbackValue: fallbackValue
            };
            return {
                value: fallbackValue,
                confidence: 0.3, // Low confidence for fallback values
                method: 'FAILED',
                error: error.reason,
                metadata
            };
        }

        // Return empty result with error information
        const metadata = {
            originalError: error.reason,
            recoveryStrategies: error.recoveryStrategies,
            errorSeverity: error.severity,
            extractionContext: error.extractionContext
        };
        return {
            value: '',
            confidence: 0,
            method: 'FAILED',
            error: error.reason,
            metadata
        };
    }

    /**
     * Validate and correct extracted data using field-specific rules
     * 
     * @param field - The field name being validated
     * @param value - The extracted value to validate
     * @param context - Optional context for enhanced validation
     * @returns ValidationResult with correction applied if needed
     */
    public static validateAndCorrect(
        field: string,
        value: string,
        context?: {
            originalText?: string;
            extractionMethod?: ProcessingMethod;
            confidence?: number;
            surroundingText?: string;
        }
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        try {
            switch (field) {
                case 'cibilScore':
                    const scoreResult = this.validateAndCorrectCibilScore(value, context);
                    return scoreResult;

                case 'numberOfLoans':
                    const countResult = this.validateAndCorrectLoanCount(value, context);
                    return countResult;

                case 'totalLoanAmount':
                case 'amountOverdue':
                case 'settledAndWrittenOff':
                    const amountResult = this.validateAndCorrectAmount(field, value, context);
                    return amountResult;

                case 'suitFiledAndDefault':
                    const legalResult = this.validateAndCorrectLegalStatus(value, context);
                    return legalResult;

                case 'panNumber':
                    const panResult = this.validateAndCorrectPanNumber(value, context);
                    return panResult;

                case 'reportDate':
                    const dateResult = this.validateAndCorrectDate(value, context);
                    return dateResult;

                case 'applicantName':
                    const nameResult = this.validateAndCorrectName(value, context);
                    return nameResult;

                default:
                    // Generic validation for unknown fields
                    if (!value || value.trim() === '') {
                        flags.push(createValidationFlag(
                            field,
                            'Field is empty',
                            'WARNING',
                            'Verify if this field should contain data'
                        ));
                        isValid = false;
                        confidence = 0;
                    }
            }

            return {
                isValid,
                correctedValue,
                confidence,
                flags,
                suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
            };

        } catch (error) {
            // Handle validation errors gracefully
            flags.push(createValidationFlag(
                field,
                `Validation error: ${(error as Error).message}`,
                'ERROR',
                'Manual verification required'
            ));

            return {
                isValid: false,
                correctedValue: value,
                confidence: 0,
                flags,
                suggestions: ['Manual verification required due to validation error']
            };
        }
    }

    /**
     * Validate and correct CIBIL score
     */
    private static validateAndCorrectCibilScore(
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '') {
            flags.push(createValidationFlag(
                'cibilScore',
                'CIBIL score is missing',
                'ERROR',
                'Ensure the document contains a valid CIBIL score'
            ));
            return { isValid: false, correctedValue: '', confidence: 0, flags };
        }

        // Clean and normalize the value
        const cleanValue = value.replace(/[^\d]/g, '');
        
        if (cleanValue.length !== 3) {
            // Try to extract 3-digit number from the value
            const scoreMatch = value.match(/(\d{3})/);
            if (scoreMatch) {
                correctedValue = scoreMatch[1];
                flags.push(createValidationFlag(
                    'cibilScore',
                    'CIBIL score format corrected',
                    'WARNING',
                    `Extracted score ${correctedValue} from "${value}"`
                ));
                confidence *= 0.8; // Reduce confidence for corrected values
            } else {
                flags.push(createValidationFlag(
                    'cibilScore',
                    'CIBIL score format is invalid',
                    'ERROR',
                    'CIBIL score should be a 3-digit number'
                ));
                return { isValid: false, correctedValue: value, confidence: 0, flags };
            }
        } else {
            correctedValue = cleanValue;
        }

        // Validate range
        const numScore = parseInt(correctedValue);
        const rule = CIBIL_VALIDATION_RULES.CIBIL_SCORE;
        
        if (numScore < rule.min || numScore > rule.max) {
            flags.push(createValidationFlag(
                'cibilScore',
                `CIBIL score ${numScore} is outside valid range (${rule.min}-${rule.max})`,
                'ERROR',
                'Verify the extracted score is correct'
            ));
            isValid = false;
            confidence = 0;
        }

        // Additional validation based on context
        if (context?.surroundingText) {
            const contextLower = context.surroundingText.toLowerCase();
            if (!contextLower.includes('cibil') && !contextLower.includes('score') && !contextLower.includes('credit')) {
                flags.push(createValidationFlag(
                    'cibilScore',
                    'Score found outside expected context',
                    'WARNING',
                    'Verify this is actually a CIBIL score'
                ));
                confidence *= 0.7;
            }
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Validate and correct loan count
     */
    private static validateAndCorrectLoanCount(
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '') {
            // Loan count is optional, so empty is acceptable
            return { isValid: true, correctedValue: '0', confidence: 0.3, flags };
        }

        // Clean and normalize the value
        const cleanValue = value.replace(/[^\d]/g, '');
        
        if (!cleanValue) {
            flags.push(createValidationFlag(
                'numberOfLoans',
                'Loan count contains no numeric value',
                'WARNING',
                'Verify if loan count information is available'
            ));
            return { isValid: false, correctedValue: '0', confidence: 0, flags };
        }

        correctedValue = cleanValue;
        const numCount = parseInt(correctedValue);
        const rule = CIBIL_VALIDATION_RULES.LOAN_COUNT;

        if (numCount < rule.min || numCount > rule.max) {
            flags.push(createValidationFlag(
                'numberOfLoans',
                `Loan count ${numCount} seems unusually high`,
                'WARNING',
                'Verify the loan count is accurate'
            ));
            confidence *= 0.8;
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Validate and correct amount fields
     */
    private static validateAndCorrectAmount(
        field: string,
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '' || value.toLowerCase() === 'none') {
            // Amount fields are optional
            return { isValid: true, correctedValue: 'None', confidence: 0.3, flags };
        }

        // Try to extract and normalize amount
        const amountMatch = value.match(/₹?\s*([\d,]+(?:\.\d{2})?)\s*([CLK]r?)?/i);
        
        if (!amountMatch) {
            // Try to find any numeric value
            const numericMatch = value.match(/([\d,]+(?:\.\d{2})?)/);
            if (numericMatch) {
                correctedValue = `₹${numericMatch[1]}`;
                flags.push(createValidationFlag(
                    field,
                    'Amount format corrected',
                    'WARNING',
                    `Normalized amount to ${correctedValue}`
                ));
                confidence *= 0.7;
            } else {
                flags.push(createValidationFlag(
                    field,
                    'Amount format is invalid',
                    'ERROR',
                    'Amount should contain numeric value'
                ));
                return { isValid: false, correctedValue: 'None', confidence: 0, flags };
            }
        } else {
            const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
            const unit = amountMatch[2]?.toUpperCase() || '';
            
            // Normalize format
            if (unit === 'CR' || unit === 'C') {
                correctedValue = `₹${amount.toFixed(2)} Cr`;
            } else if (unit === 'L') {
                correctedValue = `₹${amount.toFixed(2)} L`;
            } else if (unit === 'K') {
                correctedValue = `₹${amount.toFixed(2)} K`;
            } else {
                // Determine appropriate unit based on amount size
                if (amount >= 10000000) { // >= 1 Cr
                    correctedValue = `₹${(amount / 10000000).toFixed(2)} Cr`;
                } else if (amount >= 100000) { // >= 1 L
                    correctedValue = `₹${(amount / 100000).toFixed(2)} L`;
                } else if (amount >= 1000) { // >= 1 K
                    correctedValue = `₹${(amount / 1000).toFixed(2)} K`;
                } else {
                    correctedValue = `₹${amount.toFixed(2)}`;
                }
            }

            // Validate amount range
            const rule = CIBIL_VALIDATION_RULES.AMOUNTS;
            if (amount < rule.min || amount > rule.max) {
                flags.push(createValidationFlag(
                    field,
                    `Amount ${correctedValue} seems unusually large`,
                    'WARNING',
                    'Verify the amount is accurate'
                ));
                confidence *= 0.8;
            }
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Validate and correct legal status
     */
    private static validateAndCorrectLegalStatus(
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '' || value.toLowerCase() === 'none') {
            return { isValid: true, correctedValue: 'None', confidence: 0.3, flags };
        }

        // Normalize legal status values
        const legalKeywords = {
            'suit': ['suit filed', 'legal action', 'court case'],
            'default': ['default', 'defaulter', 'npa'],
            'settled': ['settled', 'settlement'],
            'written off': ['written off', 'write off', 'w/o'],
            'none': ['none', 'nil', 'no issues', 'clean']
        };

        const valueLower = value.toLowerCase();
        let matchedStatus = '';

        for (const [status, keywords] of Object.entries(legalKeywords)) {
            if (keywords.some(keyword => valueLower.includes(keyword))) {
                matchedStatus = status;
                break;
            }
        }

        if (matchedStatus) {
            correctedValue = matchedStatus === 'none' ? 'None' : 
                           matchedStatus.charAt(0).toUpperCase() + matchedStatus.slice(1);
            
            if (correctedValue !== value) {
                flags.push(createValidationFlag(
                    'suitFiledAndDefault',
                    'Legal status normalized',
                    'WARNING',
                    `Normalized "${value}" to "${correctedValue}"`
                ));
                confidence *= 0.9;
            }
        } else {
            flags.push(createValidationFlag(
                'suitFiledAndDefault',
                'Legal status format unclear',
                'WARNING',
                'Verify legal status information'
            ));
            confidence *= 0.6;
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Validate and correct PAN number
     */
    private static validateAndCorrectPanNumber(
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '') {
            return { isValid: true, correctedValue: '', confidence: 0, flags };
        }

        // Clean and normalize PAN
        const cleanPan = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
        const rule = CIBIL_VALIDATION_RULES.PAN_NUMBER;

        if (cleanPan.length === 10 && rule.pattern.test(cleanPan)) {
            correctedValue = cleanPan;
            if (correctedValue !== value) {
                flags.push(createValidationFlag(
                    'panNumber',
                    'PAN format normalized',
                    'WARNING',
                    `Normalized "${value}" to "${correctedValue}"`
                ));
                confidence *= 0.9;
            }
        } else {
            flags.push(createValidationFlag(
                'panNumber',
                'PAN format is invalid',
                'ERROR',
                'PAN should be 10 characters: 5 letters, 4 digits, 1 letter'
            ));
            isValid = false;
            confidence = 0;
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Validate and correct date
     */
    private static validateAndCorrectDate(
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '') {
            return { isValid: true, correctedValue: '', confidence: 0, flags };
        }

        // Try to parse and normalize date
        const datePatterns = [
            /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
            /(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/
        ];

        let dateMatch = null;
        for (const pattern of datePatterns) {
            dateMatch = value.match(pattern);
            if (dateMatch) break;
        }

        if (dateMatch) {
            const [, part1, part2, part3] = dateMatch;
            
            // Normalize to DD/MM/YYYY format
            let day, month, year;
            
            if (part3.length === 4) {
                // Format: DD/MM/YYYY or MM/DD/YYYY
                day = part1.padStart(2, '0');
                month = part2.padStart(2, '0');
                year = part3;
            } else {
                // Format: DD/MM/YY
                day = part1.padStart(2, '0');
                month = part2.padStart(2, '0');
                year = '20' + part3.padStart(2, '0');
            }

            correctedValue = `${day}/${month}/${year}`;
            
            // Validate date components
            const dayNum = parseInt(day);
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);

            if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2030) {
                flags.push(createValidationFlag(
                    'reportDate',
                    'Date values seem invalid',
                    'WARNING',
                    'Verify date components are correct'
                ));
                confidence *= 0.7;
            }

            if (correctedValue !== value) {
                flags.push(createValidationFlag(
                    'reportDate',
                    'Date format normalized',
                    'WARNING',
                    `Normalized "${value}" to "${correctedValue}"`
                ));
                confidence *= 0.9;
            }
        } else {
            flags.push(createValidationFlag(
                'reportDate',
                'Date format is invalid',
                'ERROR',
                'Date should be in DD/MM/YYYY format'
            ));
            isValid = false;
            confidence = 0;
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Validate and correct applicant name
     */
    private static validateAndCorrectName(
        value: string,
        context?: any
    ): ValidationResult {
        const flags: ValidationFlag[] = [];
        let correctedValue = value;
        let confidence = context?.confidence || 0.5;
        let isValid = true;

        if (!value || value.trim() === '') {
            return { isValid: true, correctedValue: '', confidence: 0, flags };
        }

        // Clean and normalize name
        correctedValue = value.trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[^\w\s]/g, '') // Remove special characters
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        // Basic name validation
        if (correctedValue.length < 2 || correctedValue.length > 50) {
            flags.push(createValidationFlag(
                'applicantName',
                'Name length seems unusual',
                'WARNING',
                'Verify name is complete and accurate'
            ));
            confidence *= 0.8;
        }

        if (!/^[A-Za-z\s]+$/.test(correctedValue)) {
            flags.push(createValidationFlag(
                'applicantName',
                'Name contains invalid characters',
                'WARNING',
                'Name should contain only letters and spaces'
            ));
            confidence *= 0.7;
        }

        if (correctedValue !== value) {
            flags.push(createValidationFlag(
                'applicantName',
                'Name format normalized',
                'WARNING',
                `Normalized "${value}" to "${correctedValue}"`
            ));
            confidence *= 0.9;
        }

        return {
            isValid,
            correctedValue,
            confidence,
            flags,
            suggestions: flags.map(f => f.suggestion).filter(Boolean) as string[]
        };
    }

    /**
     * Check if a fallback value is valid for the given field
     */
    private static isValidFallbackValue(field: string, value: string): boolean {
        if (!value || value.trim() === '') {
            return false;
        }

        switch (field) {
            case 'cibilScore':
                const score = parseInt(value);
                return !isNaN(score) && score >= 300 && score <= 900;

            case 'numberOfLoans':
                const count = parseInt(value);
                return !isNaN(count) && count >= 0 && count <= 50;

            case 'panNumber':
                return CIBIL_VALIDATION_RULES.PAN_NUMBER.pattern.test(value);

            default:
                return true; // Accept any non-empty value for other fields
        }
    }

    /**
     * Create a comprehensive error report for debugging and monitoring
     */
    public static createErrorReport(errors: ExtractionError[]): {
        summary: {
            totalErrors: number;
            errorsByField: Record<string, number>;
            errorsBySeverity: Record<ValidationSeverity, number>;
            recoverableErrors: number;
        };
        details: Array<{
            field: string;
            reason: string;
            severity: ValidationSeverity;
            timestamp: string;
            recoveryStrategies: string[];
            isRecoverable: boolean;
        }>;
        recommendations: string[];
    } {
        const errorsByField: Record<string, number> = {};
        const errorsBySeverity: Record<ValidationSeverity, number> = { WARNING: 0, ERROR: 0 };
        let recoverableErrors = 0;

        const details = errors.map(error => {
            errorsByField[error.field] = (errorsByField[error.field] || 0) + 1;
            errorsBySeverity[error.severity]++;
            if (error.isRecoverable()) recoverableErrors++;

            return {
                field: error.field,
                reason: error.reason,
                severity: error.severity,
                timestamp: error.timestamp,
                recoveryStrategies: error.recoveryStrategies || [],
                isRecoverable: error.isRecoverable()
            };
        });

        // Generate recommendations based on error patterns
        const recommendations: string[] = [];
        
        if (errorsBySeverity.ERROR > errorsBySeverity.WARNING) {
            recommendations.push('Document quality may be poor - consider OCR preprocessing');
        }
        
        if (errorsByField.cibilScore > 0) {
            recommendations.push('CIBIL score extraction failed - verify document is a valid CIBIL report');
        }
        
        if (recoverableErrors > errors.length / 2) {
            recommendations.push('Many errors are recoverable - implement retry mechanisms');
        }

        return {
            summary: {
                totalErrors: errors.length,
                errorsByField,
                errorsBySeverity,
                recoverableErrors
            },
            details,
            recommendations
        };
    }
}