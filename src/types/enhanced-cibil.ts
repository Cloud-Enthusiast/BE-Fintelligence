import { FinancialData } from '@/utils/financialDataExtractor';

/**
 * Processing methods used for data extraction
 */
export type ProcessingMethod = 'TEXT_LAYER' | 'OCR' | 'HYBRID' | 'PATTERN_MATCH' | 'FAILED';

/**
 * Report types supported by the system
 */
export type ReportType = 'CIBIL' | 'STANDARD';

/**
 * Quality levels for extraction assessment
 */
export type QualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Severity levels for validation flags
 */
export type ValidationSeverity = 'WARNING' | 'ERROR';

/**
 * Amount types for CIBIL extraction
 */
export type AmountType = 'TOTAL_LOAN' | 'OVERDUE' | 'SETTLED' | 'SANCTIONED' | 'OUTSTANDING';

/**
 * Validation flag interface for flagging extraction issues
 */
export interface ValidationFlag {
  field: string;
  issue: string;
  severity: ValidationSeverity;
  suggestion?: string;
}

/**
 * Field-specific confidence scores for extracted data
 */
export interface FieldConfidenceMap {
  cibilScore: number;
  numberOfLoans: number;
  totalLoanAmount: number;
  amountOverdue: number;
  suitFiledAndDefault: number;
  settledAndWrittenOff: number;
  reportDate: number;
  applicantName: number;
  panNumber: number;
  accountNumbers: number;
}

/**
 * Overall extraction quality assessment
 */
export interface ExtractionQuality {
  overallScore: number; // 0-100
  fieldsExtracted: number;
  totalFields: number;
  qualityLevel: QualityLevel;
  validationFlags: ValidationFlag[];
}

/**
 * Enhanced CIBIL data interface extending the base FinancialData
 */
export interface EnhancedCibilData extends FinancialData {
  // Enhanced Fields
  reportType: ReportType;
  processingMethod: ProcessingMethod[];
  
  // Quality & Analytics Fields
  extractionQuality: ExtractionQuality;
  fieldConfidence: FieldConfidenceMap;
  
  // Additional metadata
  extractionTimestamp?: string;
  documentPages?: number;
  ocrConfidence?: number;
  
  // Method effectiveness analytics
  methodEffectiveness?: {
    primaryMethod: ProcessingMethod;
    methodCount: number;
    averageConfidence: number;
    effectiveness: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  };
}

/**
 * Result of a single field extraction operation
 */
export interface ExtractionResult {
  value: string;
  confidence: number; // 0-1
  method: ProcessingMethod;
  error?: string;
  metadata?: {
    pattern?: string;
    position?: number;
    context?: string;
    fallbackStrategy?: string;
    originalValue?: string;
    matchCount?: number;
    keywordMatches?: number;
    attemptedStrategies?: string[];
    recoveredFromError?: boolean;
    originalError?: string;
    recoveryStrategy?: string;
    fallbackValue?: string;
    errorSeverity?: ValidationSeverity;
    extractionContext?: string;
    recoveryStrategies?: string[];
    validationFlags?: ValidationFlag[];
    validationSuggestions?: string[];
    wasValidated?: boolean;
    validationPassed?: boolean;
  };
}

/**
 * Result of data validation operation
 */
export interface ValidationResult {
  isValid: boolean;
  correctedValue?: string;
  confidence: number;
  flags: ValidationFlag[];
  suggestions?: string[];
}

/**
 * Configuration for CIBIL extraction patterns
 */
export interface CibilExtractionConfig {
  enableOCR: boolean;
  confidenceThreshold: number;
  maxRetries: number;
  fallbackToStandard: boolean;
  validationRules: {
    cibilScoreRange: { min: number; max: number };
    loanCountRange: { min: number; max: number };
    amountRange: { min: number; max: number };
  };
}

/**
 * CIBIL report metadata extracted during processing
 */
export interface CibilReportMetadata {
  version: string;
  format: 'STANDARD' | 'DETAILED' | 'SUMMARY';
  pageCount: number;
  generationDate?: string;
  reportId?: string;
  memberBanks?: string[];
}

/**
 * Internal processing state for CIBIL extraction
 */
export interface CibilExtractionState {
  currentStep: string;
  completedSteps: string[];
  errors: string[];
  warnings: string[];
  startTime: number;
  endTime?: number;
}