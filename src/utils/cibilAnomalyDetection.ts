/**
 * CIBIL Anomaly Detection and Suspicious Value Flagging System
 * Detects potentially incorrect or suspicious data patterns in CIBIL reports
 */

import { ValidationResult, ValidationError, ValidationWarning } from './cibilValidation';

export interface AnomalyFlag {
  field: string;
  anomalyType: AnomalyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggestion: string;
  confidence: number;
  relatedFields?: string[];
}

export type AnomalyType = 
  | 'INCONSISTENT_DATA'
  | 'SUSPICIOUS_PATTERN'
  | 'OUTLIER_VALUE'
  | 'LOGICAL_INCONSISTENCY'
  | 'FORMAT_ANOMALY'
  | 'TEMPORAL_ANOMALY'
  | 'STATISTICAL_OUTLIER';

export interface AnomalyDetectionResult {
  hasAnomalies: boolean;
  anomalies: AnomalyFlag[];
  riskScore: number; // 0-100, higher means more suspicious
  recommendations: string[];
}

export interface CibilDataContext {
  cibilScore?: string;
  numberOfLoans?: string;
  totalLoanAmount?: string;
  amountOverdue?: string;
  settledAndWrittenOff?: string;
  suitFiledAndDefault?: string;
  reportDate?: string;
  applicantName?: string;
  panNumber?: string;
}

/**
 * Core Anomaly Detection Engine
 */
export class CibilAnomalyDetector {
  private static readonly SCORE_PERCENTILES = {
    P10: 350,  // 10th percentile
    P25: 450,  // 25th percentile  
    P50: 650,  // Median
    P75: 750,  // 75th percentile
    P90: 800   // 90th percentile
  };

  private static readonly TYPICAL_LOAN_RANGES = {
    PERSONAL_LOAN: { min: 50000, max: 2000000 },
    HOME_LOAN: { min: 500000, max: 50000000 },
    CAR_LOAN: { min: 200000, max: 2000000 },
    CREDIT_CARD: { min: 10000, max: 500000 }
  };

  /**
   * Main anomaly detection method
   */
  static detectAnomalies(data: CibilDataContext): AnomalyDetectionResult {
    const anomalies: AnomalyFlag[] = [];
    
    // Run all detection algorithms
    anomalies.push(...this.detectScoreAnomalies(data));
    anomalies.push(...this.detectLoanCountAnomalies(data));
    anomalies.push(...this.detectAmountAnomalies(data));
    anomalies.push(...this.detectLogicalInconsistencies(data));
    anomalies.push(...this.detectPatternAnomalies(data));
    anomalies.push(...this.detectStatisticalOutliers(data));

    const riskScore = this.calculateRiskScore(anomalies);
    const recommendations = this.generateRecommendations(anomalies, data);

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      riskScore,
      recommendations
    };
  }

  /**
   * Detect CIBIL score related anomalies
   */
  private static detectScoreAnomalies(data: CibilDataContext): AnomalyFlag[] {
    const anomalies: AnomalyFlag[] = [];
    
    if (!data.cibilScore) return anomalies;
    
    const score = parseInt(data.cibilScore, 10);
    if (isNaN(score)) return anomalies;

    // Detect extremely low scores with high loan amounts
    if (score < 400 && data.totalLoanAmount) {
      const loanAmount = this.parseAmount(data.totalLoanAmount);
      if (loanAmount && loanAmount > 1000000) { // > 10L
        anomalies.push({
          field: 'cibilScore',
          anomalyType: 'LOGICAL_INCONSISTENCY',
          severity: 'HIGH',
          message: 'Very low CIBIL score with high loan amount',
          suggestion: 'Verify score accuracy - banks rarely approve large loans for scores below 400',
          confidence: 0.9,
          relatedFields: ['totalLoanAmount']
        });
      }
    }

    // Detect perfect scores (rare)
    if (score === 900) {
      anomalies.push({
        field: 'cibilScore',
        anomalyType: 'STATISTICAL_OUTLIER',
        severity: 'MEDIUM',
        message: 'Perfect CIBIL score detected',
        suggestion: 'Perfect scores are extremely rare - verify extraction accuracy',
        confidence: 0.8
      });
    }

    // Detect scores ending in 00 (potentially rounded)
    if (score % 100 === 0 && score !== 300 && score !== 900) {
      anomalies.push({
        field: 'cibilScore',
        anomalyType: 'SUSPICIOUS_PATTERN',
        severity: 'LOW',
        message: 'Round number CIBIL score',
        suggestion: 'CIBIL scores are typically not round numbers - verify if this is estimated',
        confidence: 0.6
      });
    }

    return anomalies;
  }

  /**
   * Detect loan count anomalies
   */
  private static detectLoanCountAnomalies(data: CibilDataContext): AnomalyFlag[] {
    const anomalies: AnomalyFlag[] = [];
    
    if (!data.numberOfLoans) return anomalies;
    
    const loanCount = parseInt(data.numberOfLoans, 10);
    if (isNaN(loanCount)) return anomalies;

    // Detect high loan count with low total amount
    if (loanCount > 10 && data.totalLoanAmount) {
      const totalAmount = this.parseAmount(data.totalLoanAmount);
      if (totalAmount && totalAmount < loanCount * 50000) { // Less than 50K per loan
        anomalies.push({
          field: 'numberOfLoans',
          anomalyType: 'LOGICAL_INCONSISTENCY',
          severity: 'MEDIUM',
          message: 'High loan count with unusually low average loan amount',
          suggestion: 'Verify if these are micro-loans or if extraction missed larger amounts',
          confidence: 0.7,
          relatedFields: ['totalLoanAmount']
        });
      }
    }

    // Detect zero loans with overdue amounts
    if (loanCount === 0 && data.amountOverdue) {
      const overdueAmount = this.parseAmount(data.amountOverdue);
      if (overdueAmount && overdueAmount > 0) {
        anomalies.push({
          field: 'numberOfLoans',
          anomalyType: 'LOGICAL_INCONSISTENCY',
          severity: 'HIGH',
          message: 'No loans reported but overdue amount exists',
          suggestion: 'Check if loan count extraction failed or if these are closed accounts',
          confidence: 0.9,
          relatedFields: ['amountOverdue']
        });
      }
    }

    return anomalies;
  }

  /**
   * Detect amount-related anomalies
   */
  private static detectAmountAnomalies(data: CibilDataContext): AnomalyFlag[] {
    const anomalies: AnomalyFlag[] = [];

    const totalAmount = data.totalLoanAmount ? this.parseAmount(data.totalLoanAmount) : 0;
    const overdueAmount = data.amountOverdue ? this.parseAmount(data.amountOverdue) : 0;
    const settledAmount = data.settledAndWrittenOff ? this.parseAmount(data.settledAndWrittenOff) : 0;

    // Overdue amount exceeds total loan amount
    if (totalAmount && overdueAmount && overdueAmount > totalAmount) {
      anomalies.push({
        field: 'amountOverdue',
        anomalyType: 'LOGICAL_INCONSISTENCY',
        severity: 'HIGH',
        message: 'Overdue amount exceeds total loan amount',
        suggestion: 'Verify amounts - overdue typically cannot exceed sanctioned amount',
        confidence: 0.95,
        relatedFields: ['totalLoanAmount']
      });
    }

    // Settled amount much higher than total amount
    if (totalAmount && settledAmount && settledAmount > totalAmount * 1.5) {
      anomalies.push({
        field: 'settledAndWrittenOff',
        anomalyType: 'SUSPICIOUS_PATTERN',
        severity: 'MEDIUM',
        message: 'Settled amount significantly exceeds loan amount',
        suggestion: 'Check if this includes interest and penalties or if extraction is incorrect',
        confidence: 0.8,
        relatedFields: ['totalLoanAmount']
      });
    }

    // All amounts are exactly the same (suspicious)
    if (totalAmount && overdueAmount && settledAmount &&
        totalAmount === overdueAmount && overdueAmount === settledAmount && totalAmount > 0) {
      anomalies.push({
        field: 'totalLoanAmount',
        anomalyType: 'SUSPICIOUS_PATTERN',
        severity: 'HIGH',
        message: 'All amounts are identical',
        suggestion: 'Verify extraction - identical amounts across fields is highly unusual',
        confidence: 0.9,
        relatedFields: ['amountOverdue', 'settledAndWrittenOff']
      });
    }

    return anomalies;
  }

  /**
   * Detect logical inconsistencies across fields
   */
  private static detectLogicalInconsistencies(data: CibilDataContext): AnomalyFlag[] {
    const anomalies: AnomalyFlag[] = [];

    // High CIBIL score with suit filed
    if (data.cibilScore && data.suitFiledAndDefault) {
      const score = parseInt(data.cibilScore, 10);
      const hasSuitFiled = data.suitFiledAndDefault.toLowerCase().includes('yes') || 
                          data.suitFiledAndDefault.toLowerCase().includes('suit');
      
      if (!isNaN(score) && score > 750 && hasSuitFiled) {
        anomalies.push({
          field: 'cibilScore',
          anomalyType: 'LOGICAL_INCONSISTENCY',
          severity: 'HIGH',
          message: 'High CIBIL score with legal action',
          suggestion: 'Verify data - high scores rarely coexist with suit filed status',
          confidence: 0.85,
          relatedFields: ['suitFiledAndDefault']
        });
      }
    }

    // No overdue but suit filed
    if (data.amountOverdue && data.suitFiledAndDefault) {
      const overdueAmount = this.parseAmount(data.amountOverdue);
      const hasSuitFiled = data.suitFiledAndDefault.toLowerCase().includes('yes');
      
      if (overdueAmount === 0 && hasSuitFiled) {
        anomalies.push({
          field: 'suitFiledAndDefault',
          anomalyType: 'LOGICAL_INCONSISTENCY',
          severity: 'MEDIUM',
          message: 'Legal action with no overdue amount',
          suggestion: 'Check if overdue was recently cleared or if extraction missed amounts',
          confidence: 0.7,
          relatedFields: ['amountOverdue']
        });
      }
    }

    return anomalies;
  }

  /**
   * Detect suspicious patterns in data
   */
  private static detectPatternAnomalies(data: CibilDataContext): AnomalyFlag[] {
    const anomalies: AnomalyFlag[] = [];

    // Check for repeated digits (like 111, 222, etc.)
    if (data.cibilScore) {
      const score = data.cibilScore;
      if (/^(\d)\1{2}$/.test(score)) {
        anomalies.push({
          field: 'cibilScore',
          anomalyType: 'SUSPICIOUS_PATTERN',
          severity: 'MEDIUM',
          message: 'CIBIL score has repeated digits',
          suggestion: 'Scores like 111, 222, etc. are unusual - verify extraction accuracy',
          confidence: 0.7
        });
      }
    }

    // Check for sequential patterns
    if (data.cibilScore) {
      const score = data.cibilScore;
      if (/^(123|234|345|456|567|678|789)$/.test(score)) {
        anomalies.push({
          field: 'cibilScore',
          anomalyType: 'SUSPICIOUS_PATTERN',
          severity: 'MEDIUM',
          message: 'CIBIL score shows sequential pattern',
          suggestion: 'Sequential numbers are unusual for CIBIL scores - verify accuracy',
          confidence: 0.8
        });
      }
    }

    return anomalies;
  }

  /**
   * Detect statistical outliers
   */
  private static detectStatisticalOutliers(data: CibilDataContext): AnomalyFlag[] {
    const anomalies: AnomalyFlag[] = [];

    if (data.cibilScore) {
      const score = parseInt(data.cibilScore, 10);
      if (!isNaN(score)) {
        // Bottom 5% of scores
        if (score < 350) {
          anomalies.push({
            field: 'cibilScore',
            anomalyType: 'STATISTICAL_OUTLIER',
            severity: 'HIGH',
            message: 'CIBIL score in bottom 5% range',
            suggestion: 'Extremely low score - verify accuracy and consider manual review',
            confidence: 0.9
          });
        }
        
        // Top 5% of scores
        if (score > 850) {
          anomalies.push({
            field: 'cibilScore',
            anomalyType: 'STATISTICAL_OUTLIER',
            severity: 'LOW',
            message: 'CIBIL score in top 5% range',
            suggestion: 'Exceptionally high score - verify accuracy',
            confidence: 0.8
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Calculate overall risk score based on anomalies
   */
  private static calculateRiskScore(anomalies: AnomalyFlag[]): number {
    if (anomalies.length === 0) return 0;

    let totalRisk = 0;
    const severityWeights = {
      'LOW': 10,
      'MEDIUM': 25,
      'HIGH': 50,
      'CRITICAL': 100
    };

    for (const anomaly of anomalies) {
      const baseScore = severityWeights[anomaly.severity];
      const confidenceAdjusted = baseScore * anomaly.confidence;
      totalRisk += confidenceAdjusted;
    }

    // Cap at 100 and normalize
    return Math.min(100, totalRisk);
  }

  /**
   * Generate recommendations based on detected anomalies
   */
  private static generateRecommendations(anomalies: AnomalyFlag[], data: CibilDataContext): string[] {
    const recommendations: string[] = [];
    
    const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL');
    const highAnomalies = anomalies.filter(a => a.severity === 'HIGH');
    
    if (criticalAnomalies.length > 0) {
      recommendations.push('CRITICAL: Manual review required - multiple critical data inconsistencies detected');
    }
    
    if (highAnomalies.length > 0) {
      recommendations.push('HIGH PRIORITY: Verify extracted data accuracy before processing');
    }
    
    // Specific recommendations based on anomaly types
    const logicalInconsistencies = anomalies.filter(a => a.anomalyType === 'LOGICAL_INCONSISTENCY');
    if (logicalInconsistencies.length > 0) {
      recommendations.push('Review data relationships - some values appear inconsistent with each other');
    }
    
    const suspiciousPatterns = anomalies.filter(a => a.anomalyType === 'SUSPICIOUS_PATTERN');
    if (suspiciousPatterns.length > 0) {
      recommendations.push('Check for extraction errors - unusual patterns detected in data');
    }
    
    const outliers = anomalies.filter(a => a.anomalyType === 'STATISTICAL_OUTLIER');
    if (outliers.length > 0) {
      recommendations.push('Values fall outside typical ranges - consider additional verification');
    }

    if (recommendations.length === 0) {
      recommendations.push('Data appears consistent - proceed with standard processing');
    }

    return recommendations;
  }

  /**
   * Helper method to parse amount strings
   */
  private static parseAmount(amountStr: string): number | null {
    if (!amountStr) return null;
    
    // Remove currency symbols and spaces
    const cleaned = amountStr.replace(/[₹Rs\.\s,]/g, '');
    
    // Handle multipliers
    let multiplier = 1;
    if (cleaned.includes('Cr')) {
      multiplier = 10000000;
    } else if (cleaned.includes('L')) {
      multiplier = 100000;
    } else if (cleaned.includes('K')) {
      multiplier = 1000;
    }
    
    const numStr = cleaned.replace(/[CrLK]/gi, '');
    const num = parseFloat(numStr);
    
    return isNaN(num) ? null : num * multiplier;
  }
}

/**
 * Suggestion System for Data Correction
 */
export class CibilSuggestionEngine {
  /**
   * Generate correction suggestions for flagged data
   */
  static generateCorrections(anomalies: AnomalyFlag[], data: CibilDataContext): Record<string, string[]> {
    const suggestions: Record<string, string[]> = {};
    
    for (const anomaly of anomalies) {
      if (!suggestions[anomaly.field]) {
        suggestions[anomaly.field] = [];
      }
      
      // Add specific correction suggestions based on anomaly type
      switch (anomaly.anomalyType) {
        case 'LOGICAL_INCONSISTENCY':
          suggestions[anomaly.field].push(this.getLogicalCorrectionSuggestion(anomaly, data));
          break;
        case 'SUSPICIOUS_PATTERN':
          suggestions[anomaly.field].push(this.getPatternCorrectionSuggestion(anomaly, data));
          break;
        case 'STATISTICAL_OUTLIER':
          suggestions[anomaly.field].push(this.getOutlierCorrectionSuggestion(anomaly, data));
          break;
        default:
          suggestions[anomaly.field].push(anomaly.suggestion);
      }
    }
    
    return suggestions;
  }
  
  private static getLogicalCorrectionSuggestion(anomaly: AnomalyFlag, data: CibilDataContext): string {
    switch (anomaly.field) {
      case 'cibilScore':
        return 'Consider re-extracting score from a different section of the report';
      case 'amountOverdue':
        return 'Verify if this represents current balance vs. original overdue amount';
      case 'numberOfLoans':
        return 'Check if closed/settled accounts were incorrectly counted as active';
      default:
        return anomaly.suggestion;
    }
  }
  
  private static getPatternCorrectionSuggestion(anomaly: AnomalyFlag, data: CibilDataContext): string {
    return 'Re-examine source document for potential OCR errors or misaligned text extraction';
  }
  
  private static getOutlierCorrectionSuggestion(anomaly: AnomalyFlag, data: CibilDataContext): string {
    return 'Cross-reference with other sections of the report to confirm accuracy';
  }
}