/**
 * CIBIL Data Validation System
 * Provides comprehensive validation rules for CIBIL report data fields
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  correctedValue?: string;
  confidence: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  code: string;
}

export interface ValidationRule {
  field: string;
  validate: (value: string) => ValidationResult;
  required: boolean;
  description: string;
}

/**
 * CIBIL Score Validation (300-900 range)
 */
export class CibilScoreValidator {
  private static readonly MIN_SCORE = 300;
  private static readonly MAX_SCORE = 900;
  private static readonly SCORE_PATTERN = /^\d{3}$/;

  static validate(value: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let confidence = 1.0;

    // Check if value is empty
    if (!value || value.trim() === '') {
      return {
        isValid: false,
        errors: [{
          field: 'cibilScore',
          message: 'CIBIL score is required',
          severity: 'ERROR',
          code: 'SCORE_REQUIRED'
        }],
        warnings: [],
        confidence: 0
      };
    }

    // Check format (3 digits)
    if (!this.SCORE_PATTERN.test(value.trim())) {
      errors.push({
        field: 'cibilScore',
        message: 'CIBIL score must be exactly 3 digits',
        severity: 'ERROR',
        code: 'SCORE_FORMAT_INVALID'
      });
      confidence = 0;
    }

    const numericValue = parseInt(value.trim(), 10);

    // Check range
    if (!isNaN(numericValue)) {
      if (numericValue < this.MIN_SCORE) {
        errors.push({
          field: 'cibilScore',
          message: `CIBIL score cannot be below ${this.MIN_SCORE}`,
          severity: 'ERROR',
          code: 'SCORE_TOO_LOW'
        });
        confidence = 0;
      } else if (numericValue > this.MAX_SCORE) {
        errors.push({
          field: 'cibilScore',
          message: `CIBIL score cannot be above ${this.MAX_SCORE}`,
          severity: 'ERROR',
          code: 'SCORE_TOO_HIGH'
        });
        confidence = 0;
      }

      // Add warnings for unusual but valid scores
      if (numericValue >= 300 && numericValue <= 350) {
        warnings.push({
          field: 'cibilScore',
          message: 'Very low CIBIL score detected',
          suggestion: 'Verify score accuracy - scores below 350 are uncommon',
          code: 'SCORE_VERY_LOW'
        });
        confidence = 0.7;
      } else if (numericValue >= 850) {
        warnings.push({
          field: 'cibilScore',
          message: 'Exceptionally high CIBIL score detected',
          suggestion: 'Verify score accuracy - scores above 850 are rare',
          code: 'SCORE_VERY_HIGH'
        });
        confidence = 0.9;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence,
      correctedValue: errors.length === 0 ? value.trim() : undefined
    };
  }
}

/**
 * Loan Count Validation (0-50 reasonable limits)
 */
export class LoanCountValidator {
  private static readonly MIN_COUNT = 0;
  private static readonly MAX_COUNT = 50;
  private static readonly TYPICAL_MAX = 20;
  private static readonly COUNT_PATTERN = /^\d+$/;

  static validate(value: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let confidence = 1.0;

    // Allow empty values for optional field
    if (!value || value.trim() === '') {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        confidence: 1.0,
        correctedValue: '0'
      };
    }

    // Check format (digits only)
    if (!this.COUNT_PATTERN.test(value.trim())) {
      errors.push({
        field: 'numberOfLoans',
        message: 'Loan count must be a whole number',
        severity: 'ERROR',
        code: 'COUNT_FORMAT_INVALID'
      });
      confidence = 0;
    }

    const numericValue = parseInt(value.trim(), 10);

    if (!isNaN(numericValue)) {
      // Check minimum
      if (numericValue < this.MIN_COUNT) {
        errors.push({
          field: 'numberOfLoans',
          message: 'Loan count cannot be negative',
          severity: 'ERROR',
          code: 'COUNT_NEGATIVE'
        });
        confidence = 0;
      }

      // Check maximum
      if (numericValue > this.MAX_COUNT) {
        errors.push({
          field: 'numberOfLoans',
          message: `Loan count exceeds reasonable limit of ${this.MAX_COUNT}`,
          severity: 'ERROR',
          code: 'COUNT_TOO_HIGH'
        });
        confidence = 0;
      }

      // Add warnings for unusual counts
      if (numericValue > this.TYPICAL_MAX && numericValue <= this.MAX_COUNT) {
        warnings.push({
          field: 'numberOfLoans',
          message: 'High number of loans detected',
          suggestion: `Verify count accuracy - ${numericValue} loans is unusually high`,
          code: 'COUNT_UNUSUALLY_HIGH'
        });
        confidence = 0.8;
      }

      if (numericValue === 0) {
        warnings.push({
          field: 'numberOfLoans',
          message: 'No loans found in report',
          suggestion: 'Verify if this is a new credit profile or extraction error',
          code: 'COUNT_ZERO'
        });
        confidence = 0.9;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence,
      correctedValue: errors.length === 0 ? value.trim() : undefined
    };
  }
}

/**
 * Amount Validation with format and range checks
 */
export class AmountValidator {
  private static readonly MIN_AMOUNT = 0;
  private static readonly MAX_AMOUNT = 100000000000; // 100 Cr
  private static readonly SUSPICIOUS_THRESHOLD = 10000000000; // 10 Cr
  
  // Pattern to match various amount formats
  private static readonly AMOUNT_PATTERNS = [
    /^₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/,  // ₹1,00,000.00
    /^₹?\s*(\d+(?:\.\d{2})?)\s*([KLCr])\s*$/i,      // ₹5.5 L, 2 Cr
    /^Rs\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/i, // Rs. 1,00,000
    /^(\d+(?:\.\d{2})?)\s*$/                        // Plain numbers
  ];

  static validate(value: string, fieldName: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let confidence = 1.0;

    // Allow empty values for optional fields
    if (!value || value.trim() === '') {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        confidence: 1.0,
        correctedValue: '₹0.00'
      };
    }

    const cleanValue = value.trim();
    const numericValue = this.parseAmount(cleanValue);

    // Check if amount could be parsed
    if (numericValue === null) {
      errors.push({
        field: fieldName,
        message: 'Invalid amount format',
        severity: 'ERROR',
        code: 'AMOUNT_FORMAT_INVALID'
      });
      confidence = 0;
    } else {
      // Check range
      if (numericValue < this.MIN_AMOUNT) {
        errors.push({
          field: fieldName,
          message: 'Amount cannot be negative',
          severity: 'ERROR',
          code: 'AMOUNT_NEGATIVE'
        });
        confidence = 0;
      }

      if (numericValue > this.MAX_AMOUNT) {
        errors.push({
          field: fieldName,
          message: `Amount exceeds maximum limit of ₹${this.formatAmount(this.MAX_AMOUNT)}`,
          severity: 'ERROR',
          code: 'AMOUNT_TOO_HIGH'
        });
        confidence = 0;
      }

      // Add warnings for suspicious amounts
      if (numericValue > this.SUSPICIOUS_THRESHOLD && numericValue <= this.MAX_AMOUNT) {
        warnings.push({
          field: fieldName,
          message: 'Very high amount detected',
          suggestion: `Verify amount accuracy - ₹${this.formatAmount(numericValue)} is unusually high`,
          code: 'AMOUNT_SUSPICIOUS_HIGH'
        });
        confidence = 0.8;
      }

      // Check for round numbers that might indicate estimation
      if (numericValue > 0 && numericValue % 100000 === 0) {
        warnings.push({
          field: fieldName,
          message: 'Round number detected',
          suggestion: 'Verify if this is an exact amount or an estimate',
          code: 'AMOUNT_ROUND_NUMBER'
        });
        confidence = 0.9;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence,
      correctedValue: errors.length === 0 && numericValue !== null 
        ? this.formatAmount(numericValue) 
        : undefined
    };
  }

  private static parseAmount(value: string): number | null {
    // Try each pattern
    for (const pattern of this.AMOUNT_PATTERNS) {
      const match = value.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        
        // Handle multipliers (K, L, Cr)
        if (match[2]) {
          const multiplier = match[2].toUpperCase();
          switch (multiplier) {
            case 'K':
              amount *= 1000;
              break;
            case 'L':
              amount *= 100000;
              break;
            case 'CR':
              amount *= 10000000;
              break;
          }
        }
        
        return amount;
      }
    }
    
    return null;
  }

  private static formatAmount(amount: number): string {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)} K`;
    } else {
      return amount.toFixed(2);
    }
  }
}

/**
 * Comprehensive CIBIL Data Validator
 */
export class CibilDataValidator {
  private static readonly VALIDATION_RULES: ValidationRule[] = [
    {
      field: 'cibilScore',
      validate: CibilScoreValidator.validate,
      required: true,
      description: 'CIBIL score must be between 300-900'
    },
    {
      field: 'numberOfLoans',
      validate: LoanCountValidator.validate,
      required: false,
      description: 'Number of loans must be between 0-50'
    }
  ];

  static validateField(field: string, value: string): ValidationResult {
    switch (field) {
      case 'cibilScore':
        return CibilScoreValidator.validate(value);
      case 'numberOfLoans':
        return LoanCountValidator.validate(value);
      case 'totalLoanAmount':
      case 'amountOverdue':
      case 'settledAndWrittenOff':
        return AmountValidator.validate(value, field);
      default:
        return {
          isValid: true,
          errors: [],
          warnings: [],
          confidence: 1.0
        };
    }
  }

  static validateAllFields(data: Record<string, string>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    
    const fieldsToValidate = [
      'cibilScore',
      'numberOfLoans', 
      'totalLoanAmount',
      'amountOverdue',
      'settledAndWrittenOff'
    ];

    for (const field of fieldsToValidate) {
      results[field] = this.validateField(field, data[field] || '');
    }

    return results;
  }

  static getOverallValidation(validationResults: Record<string, ValidationResult>): {
    isValid: boolean;
    overallConfidence: number;
    totalErrors: number;
    totalWarnings: number;
    criticalFields: string[];
  } {
    let totalErrors = 0;
    let totalWarnings = 0;
    let confidenceSum = 0;
    let validFields = 0;
    const criticalFields: string[] = [];

    for (const [field, result] of Object.entries(validationResults)) {
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      confidenceSum += result.confidence;
      validFields++;

      // Track critical errors (required fields with errors)
      if (!result.isValid && (field === 'cibilScore')) {
        criticalFields.push(field);
      }
    }

    return {
      isValid: totalErrors === 0,
      overallConfidence: validFields > 0 ? confidenceSum / validFields : 0,
      totalErrors,
      totalWarnings,
      criticalFields
    };
  }
}