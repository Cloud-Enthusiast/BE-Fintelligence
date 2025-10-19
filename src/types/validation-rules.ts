import { ValidationFlag, ValidationSeverity } from './enhanced-cibil';

/**
 * Validation rules for CIBIL data fields
 */
export const CIBIL_VALIDATION_RULES = {
  CIBIL_SCORE: {
    min: 300,
    max: 900,
    required: true,
    pattern: /^\d{3}$/,
    name: 'CIBIL Score'
  },
  
  LOAN_COUNT: {
    min: 0,
    max: 50,
    required: false,
    pattern: /^\d+$/,
    name: 'Number of Loans'
  },
  
  AMOUNTS: {
    min: 0,
    max: 100000000000, // 100 Cr
    required: false,
    format: 'currency',
    name: 'Amount'
  },
  
  PAN_NUMBER: {
    pattern: /^[A-Z]{5}\d{4}[A-Z]$/,
    required: false,
    length: 10,
    name: 'PAN Number'
  },

  REPORT_DATE: {
    pattern: /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,
    required: false,
    name: 'Report Date'
  }
} as const;

/**
 * Helper function to create validation flags
 */
export function createValidationFlag(
  field: string,
  issue: string,
  severity: ValidationSeverity,
  suggestion?: string
): ValidationFlag {
  return {
    field,
    issue,
    severity,
    suggestion
  };
}

/**
 * Helper function to validate CIBIL score
 */
export function validateCibilScore(score: string): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  const rule = CIBIL_VALIDATION_RULES.CIBIL_SCORE;
  
  if (!score) {
    flags.push(createValidationFlag(
      'cibilScore',
      'CIBIL score is missing',
      'ERROR',
      'Ensure the document contains a valid CIBIL score'
    ));
    return flags;
  }
  
  if (!rule.pattern.test(score)) {
    flags.push(createValidationFlag(
      'cibilScore',
      'CIBIL score format is invalid',
      'ERROR',
      'CIBIL score should be a 3-digit number'
    ));
    return flags;
  }
  
  const numScore = parseInt(score);
  if (numScore < rule.min || numScore > rule.max) {
    flags.push(createValidationFlag(
      'cibilScore',
      `CIBIL score ${numScore} is outside valid range (${rule.min}-${rule.max})`,
      'ERROR',
      'Verify the extracted score is correct'
    ));
  }
  
  return flags;
}

/**
 * Helper function to validate loan count
 */
export function validateLoanCount(count: string): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  const rule = CIBIL_VALIDATION_RULES.LOAN_COUNT;
  
  if (!count) {
    return flags; // Optional field
  }
  
  if (!rule.pattern.test(count)) {
    flags.push(createValidationFlag(
      'numberOfLoans',
      'Loan count format is invalid',
      'WARNING',
      'Loan count should be a number'
    ));
    return flags;
  }
  
  const numCount = parseInt(count);
  if (numCount < rule.min || numCount > rule.max) {
    flags.push(createValidationFlag(
      'numberOfLoans',
      `Loan count ${numCount} seems unusually high`,
      'WARNING',
      'Verify the loan count is accurate'
    ));
  }
  
  return flags;
}