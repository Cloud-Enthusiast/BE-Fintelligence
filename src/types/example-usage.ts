/**
 * Example usage of Enhanced CIBIL types
 * This file demonstrates how the new interfaces and types work together
 */

import {
  EnhancedCibilData,
  ExtractionResult,
  ValidationResult,
  ProcessingMethod,
  createValidationFlag,
  validateCibilScore,
  validateLoanCount
} from './index';

/**
 * Example of creating an EnhancedCibilData object
 */
export function createSampleEnhancedCibilData(): EnhancedCibilData {
  return {
    // Base FinancialData fields
    cibilScore: '750',
    numberOfLoans: '3',
    totalLoanAmount: '₹15.50 L',
    amountOverdue: '₹0',
    suitFiledAndDefault: '',
    settledAndWrittenOff: '₹2.00 L',
    reportDate: '15/01/2024',
    applicantName: 'John Doe',
    panNumber: 'ABCDE1234F',
    accountNumbers: ['1234567890', '0987654321'],

    // Enhanced fields
    reportType: 'CIBIL',
    processingMethod: ['TEXT_LAYER', 'PATTERN_MATCH'],
    
    // Quality assessment
    extractionQuality: {
      overallScore: 85,
      fieldsExtracted: 8,
      totalFields: 10,
      qualityLevel: 'HIGH',
      validationFlags: []
    },
    
    // Field confidence scores
    fieldConfidence: {
      cibilScore: 0.95,
      numberOfLoans: 0.90,
      totalLoanAmount: 0.85,
      amountOverdue: 0.92,
      suitFiledAndDefault: 0.0,
      settledAndWrittenOff: 0.88,
      reportDate: 0.90,
      applicantName: 0.85,
      panNumber: 0.95,
      accountNumbers: 0.80
    },

    // Metadata
    extractionTimestamp: new Date().toISOString(),
    documentPages: 3,
    ocrConfidence: 0.92
  };
}

/**
 * Example of creating an ExtractionResult
 */
export function createSampleExtractionResult(): ExtractionResult {
  return {
    value: '750',
    confidence: 0.95,
    method: 'TEXT_LAYER',
    metadata: {
      pattern: 'cibil\\s*score\\s*:?\\s*(\\d{3})',
      position: 1250,
      context: 'Your CIBIL Score: 750 as on 15/01/2024'
    }
  };
}

/**
 * Example of creating a ValidationResult
 */
export function createSampleValidationResult(): ValidationResult {
  const flags = [
    ...validateCibilScore('750'),
    ...validateLoanCount('3')
  ];

  return {
    isValid: flags.length === 0,
    confidence: 0.95,
    flags,
    suggestions: flags.length > 0 ? ['Review extracted values for accuracy'] : []
  };
}

/**
 * Example of processing method tracking
 */
export function trackProcessingMethods(): ProcessingMethod[] {
  const methods: ProcessingMethod[] = [];
  
  // Simulate extraction process
  methods.push('TEXT_LAYER'); // First attempt with text layer
  methods.push('PATTERN_MATCH'); // Pattern matching for specific fields
  // methods.push('OCR'); // Would be added if OCR was needed
  
  return methods;
}

/**
 * Example of quality assessment calculation
 */
export function calculateExtractionQuality(data: Partial<EnhancedCibilData>): EnhancedCibilData['extractionQuality'] {
  const fields = [
    'cibilScore', 'numberOfLoans', 'totalLoanAmount', 'amountOverdue',
    'suitFiledAndDefault', 'settledAndWrittenOff', 'reportDate',
    'applicantName', 'panNumber', 'accountNumbers'
  ];
  
  const extractedFields = fields.filter(field => {
    const value = data[field as keyof typeof data];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
  });
  
  const fieldsExtracted = extractedFields.length;
  const totalFields = fields.length;
  const overallScore = Math.round((fieldsExtracted / totalFields) * 100);
  
  let qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (overallScore >= 80) qualityLevel = 'HIGH';
  else if (overallScore >= 50) qualityLevel = 'MEDIUM';
  
  // Generate validation flags for missing critical fields
  const validationFlags = [];
  if (!data.cibilScore) {
    validationFlags.push(createValidationFlag(
      'cibilScore',
      'Critical field missing: CIBIL Score',
      'ERROR',
      'CIBIL Score is required for loan processing'
    ));
  }
  
  return {
    overallScore,
    fieldsExtracted,
    totalFields,
    qualityLevel,
    validationFlags
  };
}