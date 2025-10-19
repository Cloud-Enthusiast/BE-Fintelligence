# CIBIL Data Validation and Quality Assurance System

This system provides comprehensive validation, anomaly detection, and quality assurance for CIBIL report data extraction. It ensures high accuracy and reliability of extracted financial data through multiple layers of validation and intelligent anomaly detection.

## Overview

The system consists of three main components:

1. **Field-Specific Validation** (`cibilValidation.ts`) - Validates individual data fields against CIBIL-specific rules
2. **Anomaly Detection** (`cibilAnomalyDetection.ts`) - Detects suspicious patterns and logical inconsistencies
3. **Quality Assurance** (`cibilQualityAssurance.ts`) - Integrates validation and anomaly detection for comprehensive quality assessment

## Features

### ✅ Field-Specific Validation Rules

- **CIBIL Score Validation**: Ensures scores are within valid range (300-900)
- **Loan Count Validation**: Validates reasonable loan counts (0-50)
- **Amount Validation**: Handles various currency formats and validates ranges
- **Format Validation**: Ensures proper data formatting and structure
- **Confidence Scoring**: Provides confidence levels for each validation

### 🔍 Suspicious Value Detection

- **Logical Inconsistency Detection**: Identifies contradictory data patterns
- **Statistical Outlier Detection**: Flags unusually high/low values
- **Pattern Anomaly Detection**: Detects suspicious number patterns
- **Cross-Field Validation**: Validates relationships between different fields
- **Risk Scoring**: Calculates overall risk score for extracted data

### 🎯 Quality Assurance Integration

- **Comprehensive Assessment**: Combines validation and anomaly detection
- **Quality Scoring**: Provides overall quality score (0-100)
- **Automated Recommendations**: Generates actionable improvement suggestions
- **Auto-Correction**: Automatically fixes simple formatting issues
- **Quality Flags**: Provides UI-friendly quality indicators

## Usage Examples

### Basic Validation

```typescript
import { CibilDataValidator } from './cibilValidation';

// Validate individual field
const scoreResult = CibilDataValidator.validateField('cibilScore', '750');
console.log(scoreResult.isValid); // true
console.log(scoreResult.confidence); // 1.0

// Validate all fields
const data = {
  cibilScore: '750',
  numberOfLoans: '5',
  totalLoanAmount: '₹25.00 L'
};
const results = CibilDataValidator.validateAllFields(data);
```

### Anomaly Detection

```typescript
import { CibilAnomalyDetector } from './cibilAnomalyDetection';

const data = {
  cibilScore: '350', // Very low score
  totalLoanAmount: '₹50.00 L' // High amount
};

const anomalies = CibilAnomalyDetector.detectAnomalies(data);
console.log(anomalies.hasAnomalies); // true
console.log(anomalies.riskScore); // High risk score
```

### Comprehensive Quality Assessment

```typescript
import { CibilQualityAssurance } from './cibilQualityAssurance';

const data = {
  cibilScore: '750',
  numberOfLoans: '5',
  totalLoanAmount: '₹25.00 L',
  amountOverdue: '₹50,000'
};

const assessment = CibilQualityAssurance.assessQuality(data);
console.log(assessment.overallQuality); // 'GOOD', 'EXCELLENT', etc.
console.log(assessment.qualityScore); // 0-100
console.log(assessment.recommendations); // Array of recommendations
```

## Validation Rules

### CIBIL Score Rules
- **Range**: 300-900 (inclusive)
- **Format**: Exactly 3 digits
- **Required**: Yes
- **Warnings**: Scores below 350 or above 850 generate warnings

### Loan Count Rules
- **Range**: 0-50 loans
- **Format**: Whole numbers only
- **Required**: No (defaults to 0)
- **Warnings**: Counts above 20 generate warnings

### Amount Rules
- **Range**: ₹0 to ₹100 Cr
- **Formats Supported**:
  - `₹1,00,000.00`
  - `₹5.5 L`
  - `₹2 Cr`
  - `Rs. 1,00,000`
  - Plain numbers
- **Validation**: Negative amounts not allowed
- **Warnings**: Very high amounts or round numbers generate warnings

## Anomaly Detection Types

### Logical Inconsistencies
- Low CIBIL score with high loan amounts
- Zero loans with overdue amounts
- High CIBIL score with legal action
- Overdue amount exceeding total loan amount

### Suspicious Patterns
- Repeated digits (111, 222, etc.)
- Sequential patterns (123, 456, etc.)
- All amounts being identical
- Round numbers that might indicate estimation

### Statistical Outliers
- CIBIL scores in bottom 5% (< 350)
- CIBIL scores in top 5% (> 850)
- Unusually high loan counts
- Extreme amount values

## Quality Levels

The system assigns one of five quality levels:

- **EXCELLENT** (90-100): High confidence, no issues
- **GOOD** (75-89): Minor warnings, generally reliable
- **FAIR** (60-74): Some issues, review recommended
- **POOR** (40-59): Multiple issues, manual review needed
- **CRITICAL** (0-39): Major problems, requires immediate attention

## Error Codes and Corrections

### Common Error Codes
- `SCORE_REQUIRED`: CIBIL score is missing
- `SCORE_FORMAT_INVALID`: Score format is incorrect
- `SCORE_TOO_LOW/HIGH`: Score outside valid range
- `COUNT_FORMAT_INVALID`: Loan count format issues
- `AMOUNT_FORMAT_INVALID`: Amount format not recognized
- `AMOUNT_NEGATIVE`: Negative amounts detected

### Auto-Correction Capabilities
- Amount format normalization
- Currency symbol standardization
- Numeric format cleaning
- Whitespace normalization

## Integration with UI Components

The system provides UI-friendly outputs:

```typescript
// Generate quality flags for display
const flags = CibilQualityAssurance.generateQualityFlags(assessment);

// Each flag contains:
// - field: Which field has the issue
// - type: VALIDATION_ERROR, VALIDATION_WARNING, ANOMALY, MISSING_DATA
// - severity: LOW, MEDIUM, HIGH, CRITICAL
// - message: Human-readable description
// - suggestion: Actionable correction advice
// - autoCorrectible: Whether it can be auto-fixed
```

## Performance Considerations

- **Validation**: O(1) per field, very fast
- **Anomaly Detection**: O(n) where n is number of fields, still very fast
- **Memory Usage**: Minimal, no large data structures
- **Caching**: Pattern compilation is cached for performance

## Testing

The system includes comprehensive test coverage:

```bash
# Run validation tests
npm test -- cibilValidation.test.ts

# Run anomaly detection tests  
npm test -- cibilAnomalyDetection.test.ts

# Run quality assurance tests
npm test -- cibilQualityAssurance.test.ts
```

## Configuration

### Customizing Validation Rules

```typescript
// Extend validation rules
class CustomCibilValidator extends CibilDataValidator {
  static validateCustomField(value: string): ValidationResult {
    // Custom validation logic
  }
}
```

### Adjusting Anomaly Thresholds

```typescript
// Modify detection sensitivity
const customDetector = new CibilAnomalyDetector();
customDetector.setSensitivity('HIGH'); // LOW, MEDIUM, HIGH
```

## Best Practices

1. **Always validate before processing**: Run quality assessment on all extracted data
2. **Handle auto-corrections carefully**: Review auto-corrected data before final processing
3. **Use quality flags in UI**: Display validation status to users
4. **Log quality metrics**: Track extraction quality over time
5. **Manual review for critical issues**: Always require human review for CRITICAL quality levels

## Future Enhancements

- Machine learning-based anomaly detection
- Historical data comparison for validation
- Custom validation rules per organization
- Integration with external CIBIL validation APIs
- Advanced statistical analysis for outlier detection

## Support

For questions or issues with the validation system:
1. Check the example usage in `cibilQualityAssuranceExample.ts`
2. Review test files for additional usage patterns
3. Consult the inline documentation in each module