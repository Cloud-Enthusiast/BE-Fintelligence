/**
 * Example usage of CIBIL Quality Assurance System
 * Demonstrates how to use validation and anomaly detection together
 */

import { CibilQualityAssurance, QualityAssessmentResult } from './cibilQualityAssurance';
import { CibilDataContext } from './cibilAnomalyDetection';

/**
 * Example function showing how to use the quality assurance system
 */
export function demonstrateQualityAssurance() {
  // Example CIBIL data (some with issues for demonstration)
  const sampleData: CibilDataContext = {
    cibilScore: '750',
    numberOfLoans: '5',
    totalLoanAmount: '₹25.00 L',
    amountOverdue: '₹50,000',
    settledAndWrittenOff: '₹2.00 L',
    suitFiledAndDefault: 'No',
    reportDate: '2024-01-15',
    applicantName: 'John Doe',
    panNumber: 'ABCDE1234F'
  };

  // Problematic data for testing
  const problematicData: CibilDataContext = {
    cibilScore: '999', // Invalid score
    numberOfLoans: '0', // No loans but has overdue
    totalLoanAmount: '₹10.00 L',
    amountOverdue: '₹15.00 L', // Overdue > total (logical inconsistency)
    settledAndWrittenOff: '₹5.00 L',
    suitFiledAndDefault: 'Yes' // High score with suit filed
  };

  console.log('=== CIBIL Quality Assurance Demo ===\n');

  // Test with good data
  console.log('1. Testing with good data:');
  const goodResult = CibilQualityAssurance.assessQuality(sampleData, ['TEXT_LAYER']);
  printQualityReport(goodResult);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test with problematic data
  console.log('2. Testing with problematic data:');
  const badResult = CibilQualityAssurance.assessQuality(problematicData, ['OCR']);
  printQualityReport(badResult);

  console.log('\n' + '='.repeat(50) + '\n');

  // Demonstrate quality flags
  console.log('3. Quality flags for problematic data:');
  const flags = CibilQualityAssurance.generateQualityFlags(badResult);
  printQualityFlags(flags);

  console.log('\n' + '='.repeat(50) + '\n');

  // Demonstrate auto-correction
  console.log('4. Auto-correction example:');
  const messyData: CibilDataContext = {
    cibilScore: '750',
    numberOfLoans: '3 loans', // Needs cleaning
    totalLoanAmount: 'Rs.500000', // Needs normalization
    amountOverdue: '₹25000',
    settledAndWrittenOff: ''
  };

  console.log('Before correction:', messyData);
  const correctedData = CibilQualityAssurance.autoCorrectData(messyData, badResult);
  console.log('After correction:', correctedData);
}

function printQualityReport(result: QualityAssessmentResult) {
  console.log(`Overall Quality: ${result.overallQuality}`);
  console.log(`Quality Score: ${result.qualityScore}/100`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Data Completeness: ${(result.dataCompleteness * 100).toFixed(1)}%`);
  
  console.log('\nValidation Summary:');
  console.log(`- Valid: ${result.validationSummary.isValid}`);
  console.log(`- Errors: ${result.validationSummary.totalErrors}`);
  console.log(`- Warnings: ${result.validationSummary.totalWarnings}`);
  console.log(`- Critical Fields: ${result.validationSummary.criticalFields.join(', ') || 'None'}`);
  
  console.log('\nAnomaly Detection:');
  console.log(`- Has Anomalies: ${result.anomalyResults.hasAnomalies}`);
  console.log(`- Risk Score: ${result.anomalyResults.riskScore}/100`);
  console.log(`- Anomalies Found: ${result.anomalyResults.anomalies.length}`);
  
  if (result.recommendations.length > 0) {
    console.log('\nRecommendations:');
    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.message}`);
    });
  }
}

function printQualityFlags(flags: any[]) {
  flags.forEach((flag, index) => {
    console.log(`${index + 1}. [${flag.severity}] ${flag.field}: ${flag.message}`);
    console.log(`   Suggestion: ${flag.suggestion}`);
    console.log(`   Auto-correctable: ${flag.autoCorrectible}`);
    console.log('');
  });
}

// Export for use in other parts of the application
export { CibilQualityAssurance } from './cibilQualityAssurance';
export { CibilDataValidator } from './cibilValidation';
export { CibilAnomalyDetector } from './cibilAnomalyDetection';