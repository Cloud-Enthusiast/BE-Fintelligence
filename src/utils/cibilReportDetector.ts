/**
 * CIBIL Report Detection Utility
 * Detects CIBIL reports from extracted text and classifies report types
 */

export interface CibilDetectionResult {
  isCibilReport: boolean;
  confidence: number;
  reportVersion: string;
  reportFormat: 'STANDARD' | 'DETAILED' | 'SUMMARY';
  detectionReasons: string[];
}

export class CibilReportDetector {
  // CIBIL-specific keywords and patterns for detection
  private static readonly CIBIL_KEYWORDS = [
    'cibil',
    'credit information bureau',
    'transunion cibil',
    'cibil score',
    'credit score',
    'credit report',
    'credit information report',
    'cir',
    'member bank',
    'enquiry details',
    'account details',
    'payment history',
    'credit facility',
    'suit filed',
    'written off',
    'settled',
    'dpd',
    'days past due'
  ];

  private static readonly CIBIL_PATTERNS = [
    // CIBIL score patterns
    /cibil\s*(?:trans\s*union\s*)?score\s*:?\s*(\d{3})/i,
    /credit\s*score\s*:?\s*(\d{3})/i,
    /your\s*(?:cibil\s*)?score\s*(?:is\s*)?:?\s*(\d{3})/i,
    
    // CIBIL report identifiers
    /credit\s*information\s*report/i,
    /transunion\s*cibil/i,
    /cibil\s*report/i,
    /credit\s*information\s*bureau/i,
    
    // CIBIL-specific sections
    /enquiry\s*details/i,
    /account\s*details/i,
    /payment\s*history/i,
    /credit\s*facility/i,
    /member\s*bank/i,
    
    // CIBIL-specific statuses
    /suit\s*filed/i,
    /written\s*off/i,
    /settled/i,
    /dpd\s*\d+/i,
    /days\s*past\s*due/i
  ];

  private static readonly VERSION_PATTERNS = [
    /version\s*:?\s*(\d+\.?\d*)/i,
    /report\s*version\s*:?\s*(\d+\.?\d*)/i,
    /cibil\s*version\s*:?\s*(\d+\.?\d*)/i
  ];

  private static readonly FORMAT_INDICATORS = {
    DETAILED: [
      'detailed credit report',
      'comprehensive report',
      'full credit history',
      'detailed account information'
    ],
    SUMMARY: [
      'summary report',
      'credit summary',
      'brief report',
      'executive summary'
    ],
    STANDARD: [
      'standard report',
      'regular report',
      'credit report'
    ]
  };

  /**
   * Main detection method to identify CIBIL reports
   */
  static detectCibilReport(text: string): CibilDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        isCibilReport: false,
        confidence: 0,
        reportVersion: 'unknown',
        reportFormat: 'STANDARD',
        detectionReasons: ['Empty or invalid text']
      };
    }

    const normalizedText = text.toLowerCase();
    const detectionReasons: string[] = [];
    let confidence = 0;
    let keywordMatches = 0;
    let patternMatches = 0;

    // Check for CIBIL keywords
    for (const keyword of this.CIBIL_KEYWORDS) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        keywordMatches++;
        detectionReasons.push(`Found keyword: ${keyword}`);
        
        // Weight different keywords differently
        if (keyword === 'cibil' || keyword === 'transunion cibil') {
          confidence += 15;
        } else if (keyword === 'credit information bureau' || keyword === 'cibil score') {
          confidence += 12;
        } else if (keyword === 'credit report' || keyword === 'credit score') {
          confidence += 8;
        } else {
          confidence += 5;
        }
      }
    }

    // Check for CIBIL-specific patterns
    for (const pattern of this.CIBIL_PATTERNS) {
      if (pattern.test(text)) {
        patternMatches++;
        detectionReasons.push(`Matched pattern: ${pattern.source}`);
        confidence += 10;
      }
    }

    // Bonus for multiple matches
    if (keywordMatches >= 3) {
      confidence += 10;
      detectionReasons.push('Multiple keyword matches found');
    }

    if (patternMatches >= 2) {
      confidence += 15;
      detectionReasons.push('Multiple pattern matches found');
    }

    // Check for CIBIL score in valid range (300-900)
    const scoreMatch = text.match(/(?:cibil|credit)\s*score\s*:?\s*(\d{3})/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      if (score >= 300 && score <= 900) {
        confidence += 20;
        detectionReasons.push(`Valid CIBIL score found: ${score}`);
      }
    }

    // Cap confidence at 100
    confidence = Math.min(confidence, 100);

    const isCibilReport = confidence >= 40; // Threshold for CIBIL detection
    const reportVersion = this.getReportVersion(text);
    const reportFormat = this.getReportFormat(text);

    return {
      isCibilReport,
      confidence,
      reportVersion,
      reportFormat,
      detectionReasons
    };
  }

  /**
   * Extract report version from text
   */
  static getReportVersion(text: string): string {
    for (const pattern of this.VERSION_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Fallback version detection based on content structure
    if (text.toLowerCase().includes('new format') || text.toLowerCase().includes('updated report')) {
      return '2.0';
    }

    return '1.0'; // Default version
  }

  /**
   * Determine report format based on content indicators
   */
  static getReportFormat(text: string): 'STANDARD' | 'DETAILED' | 'SUMMARY' {
    const normalizedText = text.toLowerCase();

    // Check for detailed format indicators
    for (const indicator of this.FORMAT_INDICATORS.DETAILED) {
      if (normalizedText.includes(indicator)) {
        return 'DETAILED';
      }
    }

    // Check for summary format indicators
    for (const indicator of this.FORMAT_INDICATORS.SUMMARY) {
      if (normalizedText.includes(indicator)) {
        return 'SUMMARY';
      }
    }

    // Check content length and complexity for format determination
    const wordCount = text.split(/\s+/).length;
    const hasMultipleSections = (text.match(/section|part|chapter/gi) || []).length > 3;
    const hasDetailedTables = (text.match(/account\s*number|loan\s*amount|payment\s*history/gi) || []).length > 5;

    if (wordCount > 2000 && hasMultipleSections && hasDetailedTables) {
      return 'DETAILED';
    } else if (wordCount < 500) {
      return 'SUMMARY';
    }

    return 'STANDARD';
  }

  /**
   * Get confidence level description
   */
  static getConfidenceDescription(confidence: number): string {
    if (confidence >= 80) return 'Very High';
    if (confidence >= 60) return 'High';
    if (confidence >= 40) return 'Medium';
    if (confidence >= 20) return 'Low';
    return 'Very Low';
  }

  /**
   * Validate detection result with additional checks
   */
  static validateDetection(text: string, result: CibilDetectionResult): CibilDetectionResult {
    // Additional validation checks
    const validationReasons: string[] = [...result.detectionReasons];

    // Check for common false positives
    const falsePositiveIndicators = [
      'bank statement',
      'loan application',
      'insurance policy',
      'investment report'
    ];

    let falsePositiveCount = 0;
    for (const indicator of falsePositiveIndicators) {
      if (text.toLowerCase().includes(indicator)) {
        falsePositiveCount++;
        validationReasons.push(`Potential false positive: ${indicator}`);
      }
    }

    // Adjust confidence based on false positive indicators
    let adjustedConfidence = result.confidence;
    if (falsePositiveCount > 0) {
      adjustedConfidence = Math.max(0, adjustedConfidence - (falsePositiveCount * 10));
      validationReasons.push('Confidence adjusted for potential false positives');
    }

    // Check for required CIBIL elements
    const requiredElements = ['score', 'account', 'payment'];
    const foundElements = requiredElements.filter(element => 
      text.toLowerCase().includes(element)
    );

    if (foundElements.length >= 2) {
      adjustedConfidence += 5;
      validationReasons.push('Required CIBIL elements found');
    }

    return {
      ...result,
      confidence: adjustedConfidence,
      isCibilReport: adjustedConfidence >= 40,
      detectionReasons: validationReasons
    };
  }
}