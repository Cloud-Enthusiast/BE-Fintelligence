/**
 * CIBIL Quality Assurance System
 * Integrates validation rules and anomaly detection for comprehensive data quality assessment
 */

import { 
  CibilDataValidator, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning 
} from './cibilValidation';
import { 
  CibilAnomalyDetector, 
  CibilSuggestionEngine,
  AnomalyDetectionResult, 
  AnomalyFlag,
  CibilDataContext 
} from './cibilAnomalyDetection';

export interface QualityAssessmentResult {
  // Overall quality metrics
  overallQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  qualityScore: number; // 0-100
  confidence: number; // 0-1
  
  // Validation results
  validationResults: Record<string, ValidationResult>;
  validationSummary: {
    totalErrors: number;
    totalWarnings: number;
    criticalFields: string[];
    isValid: boolean;
  };
  
  // Anomaly detection results
  anomalyResults: AnomalyDetectionResult;
  
  // Integrated recommendations
  recommendations: QualityRecommendation[];
  correctionSuggestions: Record<string, string[]>;
  
  // Processing metadata
  processedAt: Date;
  processingMethod: string[];
  dataCompleteness: number; // 0-1
}

export interface QualityRecommendation {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'VALIDATION' | 'ANOMALY' | 'COMPLETENESS' | 'ACCURACY';
  message: string;
  action: string;
  affectedFields: string[];
  confidence: number;
}

export interface QualityFlag {
  field: string;
  type: 'VALIDATION_ERROR' | 'VALIDATION_WARNING' | 'ANOMALY' | 'MISSING_DATA';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggestion: string;
  confidence: number;
  autoCorrectible: boolean;
}

/**
 * Main Quality Assurance Engine
 */
export class CibilQualityAssurance {
  private static readonly REQUIRED_FIELDS = ['cibilScore'];
  private static readonly IMPORTANT_FIELDS = ['numberOfLoans', 'totalLoanAmount', 'amountOverdue'];
  private static readonly OPTIONAL_FIELDS = ['settledAndWrittenOff', 'suitFiledAndDefault'];

  /**
   * Perform comprehensive quality assessment
   */
  static assessQuality(data: CibilDataContext, processingMethod: string[] = []): QualityAssessmentResult {
    // Run validation
    const dataRecord: Record<string, string> = {
      cibilScore: data.cibilScore || '',
      numberOfLoans: data.numberOfLoans || '',
      totalLoanAmount: data.totalLoanAmount || '',
      amountOverdue: data.amountOverdue || '',
      settledAndWrittenOff: data.settledAndWrittenOff || ''
    };
    const validationResults = CibilDataValidator.validateAllFields(dataRecord);
    const validationSummary = CibilDataValidator.getOverallValidation(validationResults);
    
    // Run anomaly detection
    const anomalyResults = CibilAnomalyDetector.detectAnomalies(data);
    
    // Calculate data completeness
    const dataCompleteness = this.calculateDataCompleteness(data);
    
    // Generate integrated recommendations
    const recommendations = this.generateQualityRecommendations(
      validationResults, 
      anomalyResults, 
      dataCompleteness
    );
    
    // Generate correction suggestions
    const correctionSuggestions = this.generateCorrectionSuggestions(
      validationResults, 
      anomalyResults, 
      data
    );
    
    // Calculate overall quality metrics
    const qualityScore = this.calculateQualityScore(
      validationSummary, 
      anomalyResults, 
      dataCompleteness
    );
    
    const overallQuality = this.determineQualityLevel(qualityScore);
    const confidence = this.calculateOverallConfidence(validationResults, anomalyResults);

    return {
      overallQuality,
      qualityScore,
      confidence,
      validationResults,
      validationSummary,
      anomalyResults,
      recommendations,
      correctionSuggestions,
      processedAt: new Date(),
      processingMethod,
      dataCompleteness
    };
  }

  /**
   * Generate quality flags for UI display
   */
  static generateQualityFlags(assessmentResult: QualityAssessmentResult): QualityFlag[] {
    const flags: QualityFlag[] = [];
    
    // Add validation flags
    for (const [field, result] of Object.entries(assessmentResult.validationResults)) {
      // Add error flags
      for (const error of result.errors) {
        flags.push({
          field,
          type: 'VALIDATION_ERROR',
          severity: error.severity === 'ERROR' ? 'HIGH' : 'MEDIUM',
          message: error.message,
          suggestion: `Fix ${field}: ${error.message}`,
          confidence: 1.0,
          autoCorrectible: this.isAutoCorrectible(error.code)
        });
      }
      
      // Add warning flags
      for (const warning of result.warnings) {
        flags.push({
          field,
          type: 'VALIDATION_WARNING',
          severity: 'LOW',
          message: warning.message,
          suggestion: warning.suggestion || `Review ${field}: ${warning.message}`,
          confidence: 0.8,
          autoCorrectible: false
        });
      }
    }
    
    // Add anomaly flags
    for (const anomaly of assessmentResult.anomalyResults.anomalies) {
      flags.push({
        field: anomaly.field,
        type: 'ANOMALY',
        severity: anomaly.severity,
        message: anomaly.message,
        suggestion: anomaly.suggestion,
        confidence: anomaly.confidence,
        autoCorrectible: false
      });
    }
    
    return flags.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Calculate data completeness score
   */
  private static calculateDataCompleteness(data: CibilDataContext): number {
    const allFields = [
      ...this.REQUIRED_FIELDS,
      ...this.IMPORTANT_FIELDS,
      ...this.OPTIONAL_FIELDS
    ];
    
    let filledFields = 0;
    let weightedTotal = 0;
    
    // Weight fields by importance
    const fieldWeights = {
      required: 3,
      important: 2,
      optional: 1
    };
    
    for (const field of allFields) {
      const value = data[field as keyof CibilDataContext];
      const hasValue = value && value.trim() !== '';
      
      let weight = fieldWeights.optional;
      if (this.REQUIRED_FIELDS.includes(field)) {
        weight = fieldWeights.required;
      } else if (this.IMPORTANT_FIELDS.includes(field)) {
        weight = fieldWeights.important;
      }
      
      weightedTotal += weight;
      if (hasValue) {
        filledFields += weight;
      }
    }
    
    return weightedTotal > 0 ? filledFields / weightedTotal : 0;
  }

  /**
   * Calculate overall quality score
   */
  private static calculateQualityScore(
    validationSummary: any,
    anomalyResults: AnomalyDetectionResult,
    dataCompleteness: number
  ): number {
    // Base score from validation (40% weight)
    let validationScore = 100;
    if (validationSummary.totalErrors > 0) {
      validationScore = Math.max(0, 100 - (validationSummary.totalErrors * 25));
    }
    if (validationSummary.totalWarnings > 0) {
      validationScore = Math.max(0, validationScore - (validationSummary.totalWarnings * 10));
    }
    
    // Anomaly score (30% weight)
    const anomalyScore = Math.max(0, 100 - anomalyResults.riskScore);
    
    // Completeness score (30% weight)
    const completenessScore = dataCompleteness * 100;
    
    // Weighted average
    const overallScore = (
      validationScore * 0.4 +
      anomalyScore * 0.3 +
      completenessScore * 0.3
    );
    
    return Math.round(overallScore);
  }

  /**
   * Determine quality level from score
   */
  private static determineQualityLevel(score: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'FAIR';
    if (score >= 40) return 'POOR';
    return 'CRITICAL';
  }

  /**
   * Calculate overall confidence
   */
  private static calculateOverallConfidence(
    validationResults: Record<string, ValidationResult>,
    anomalyResults: AnomalyDetectionResult
  ): number {
    const validationConfidences = Object.values(validationResults).map(r => r.confidence);
    const avgValidationConfidence = validationConfidences.length > 0 
      ? validationConfidences.reduce((a, b) => a + b, 0) / validationConfidences.length 
      : 1;
    
    // Reduce confidence based on anomaly risk
    const anomalyConfidenceReduction = anomalyResults.riskScore / 100 * 0.3;
    
    return Math.max(0, avgValidationConfidence - anomalyConfidenceReduction);
  }

  /**
   * Generate integrated quality recommendations
   */
  private static generateQualityRecommendations(
    validationResults: Record<string, ValidationResult>,
    anomalyResults: AnomalyDetectionResult,
    dataCompleteness: number
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];
    
    // Critical validation errors
    const criticalErrors = Object.entries(validationResults)
      .filter(([_, result]) => result.errors.some(e => e.severity === 'ERROR'))
      .map(([field, _]) => field);
    
    if (criticalErrors.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'VALIDATION',
        message: 'Critical validation errors must be resolved',
        action: 'Fix validation errors before processing',
        affectedFields: criticalErrors,
        confidence: 1.0
      });
    }
    
    // High-risk anomalies
    const highRiskAnomalies = anomalyResults.anomalies.filter(a => 
      a.severity === 'HIGH' || a.severity === 'CRITICAL'
    );
    
    if (highRiskAnomalies.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'ANOMALY',
        message: 'Suspicious data patterns detected',
        action: 'Manual review recommended for flagged fields',
        affectedFields: highRiskAnomalies.map(a => a.field),
        confidence: 0.9
      });
    }
    
    // Low data completeness
    if (dataCompleteness < 0.7) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'COMPLETENESS',
        message: 'Low data completeness detected',
        action: 'Review extraction settings or document quality',
        affectedFields: [],
        confidence: 0.8
      });
    }
    
    // Add anomaly-specific recommendations
    for (const rec of anomalyResults.recommendations) {
      recommendations.push({
        priority: rec.includes('CRITICAL') ? 'CRITICAL' : 
                 rec.includes('HIGH') ? 'HIGH' : 'MEDIUM',
        category: 'ACCURACY',
        message: rec,
        action: 'Follow recommendation guidance',
        affectedFields: [],
        confidence: 0.8
      });
    }
    
    return recommendations;
  }

  /**
   * Generate correction suggestions
   */
  private static generateCorrectionSuggestions(
    validationResults: Record<string, ValidationResult>,
    anomalyResults: AnomalyDetectionResult,
    data: CibilDataContext
  ): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};
    
    // Add validation-based suggestions
    for (const [field, result] of Object.entries(validationResults)) {
      if (result.errors.length > 0 || result.warnings.length > 0) {
        suggestions[field] = [];
        
        // Add error corrections
        for (const error of result.errors) {
          suggestions[field].push(this.getValidationCorrection(field, error.code, data));
        }
        
        // Add warning suggestions
        for (const warning of result.warnings) {
          if (warning.suggestion) {
            suggestions[field].push(warning.suggestion);
          }
        }
      }
    }
    
    // Add anomaly-based suggestions
    const anomalySuggestions = CibilSuggestionEngine.generateCorrections(
      anomalyResults.anomalies, 
      data
    );
    
    // Merge suggestions
    for (const [field, anomalySugs] of Object.entries(anomalySuggestions)) {
      if (!suggestions[field]) {
        suggestions[field] = [];
      }
      suggestions[field].push(...anomalySugs);
    }
    
    // Remove duplicates
    for (const field of Object.keys(suggestions)) {
      suggestions[field] = [...new Set(suggestions[field])];
    }
    
    return suggestions;
  }

  /**
   * Get validation correction suggestion
   */
  private static getValidationCorrection(field: string, errorCode: string, data: CibilDataContext): string {
    switch (errorCode) {
      case 'SCORE_REQUIRED':
        return 'CIBIL score is mandatory - check if extraction failed or document is incomplete';
      case 'SCORE_FORMAT_INVALID':
        return 'Score should be exactly 3 digits - verify OCR accuracy';
      case 'SCORE_TOO_LOW':
        return 'Score below 300 is invalid - check for extraction errors';
      case 'SCORE_TOO_HIGH':
        return 'Score above 900 is invalid - verify source data';
      case 'COUNT_FORMAT_INVALID':
        return 'Loan count should be a whole number - check extraction logic';
      case 'COUNT_NEGATIVE':
        return 'Loan count cannot be negative - verify extraction patterns';
      case 'AMOUNT_FORMAT_INVALID':
        return 'Amount format not recognized - check currency patterns';
      case 'AMOUNT_NEGATIVE':
        return 'Amount cannot be negative - verify extraction logic';
      default:
        return `Review ${field} for accuracy`;
    }
  }

  /**
   * Check if error is auto-correctable
   */
  private static isAutoCorrectible(errorCode: string): boolean {
    const autoCorrectibleCodes = [
      'AMOUNT_FORMAT_INVALID', // Can normalize format
      'COUNT_FORMAT_INVALID'   // Can clean numeric format
    ];
    
    return autoCorrectibleCodes.includes(errorCode);
  }

  /**
   * Auto-correct simple formatting issues
   */
  static autoCorrectData(data: CibilDataContext, assessmentResult: QualityAssessmentResult): CibilDataContext {
    const correctedData = { ...data };
    
    // Auto-correct amount formatting
    for (const field of ['totalLoanAmount', 'amountOverdue', 'settledAndWrittenOff']) {
      const value = correctedData[field as keyof CibilDataContext];
      if (value) {
        correctedData[field as keyof CibilDataContext] = this.normalizeAmount(value);
      }
    }
    
    // Auto-correct loan count formatting
    if (correctedData.numberOfLoans) {
      const cleaned = correctedData.numberOfLoans.replace(/[^\d]/g, '');
      if (cleaned && !isNaN(parseInt(cleaned, 10))) {
        correctedData.numberOfLoans = cleaned;
      }
    }
    
    return correctedData;
  }

  /**
   * Normalize amount format
   */
  private static normalizeAmount(amount: string): string {
    // Remove extra spaces and normalize currency symbols
    let normalized = amount.trim().replace(/Rs\.?/gi, '₹');
    
    // Ensure proper spacing
    normalized = normalized.replace(/₹(\d)/, '₹ $1');
    
    return normalized;
  }
}