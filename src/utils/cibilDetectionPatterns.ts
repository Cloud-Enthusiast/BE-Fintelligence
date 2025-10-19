/**
 * CIBIL Detection Patterns Configuration
 * 
 * Comprehensive collection of patterns and rules for detecting and validating
 * CIBIL credit reports across different formats and versions.
 */

/**
 * Primary CIBIL identification patterns with confidence weights
 */
export const CIBIL_IDENTIFICATION_PATTERNS = [
  // Highest confidence patterns (0.9-1.0)
  {
    pattern: /cibil\s+transunion\s+(?:credit\s+)?report/i,
    confidence: 0.95,
    description: 'Official CIBIL TransUnion report header'
  },
  {
    pattern: /transunion\s+cibil\s+(?:credit\s+)?(?:information\s+)?report/i,
    confidence: 0.95,
    description: 'TransUnion CIBIL official report'
  },
  {
    pattern: /credit\s+information\s+bureau\s+\(india\)\s+limited/i,
    confidence: 0.9,
    description: 'Full CIBIL company name'
  },
  {
    pattern: /your\s+cibil\s+score\s*:?\s*\d{3}/i,
    confidence: 0.9,
    description: 'Direct CIBIL score reference'
  },

  // High confidence patterns (0.7-0.89)
  {
    pattern: /cibil\s+score\s*:?\s*\d{3}/i,
    confidence: 0.85,
    description: 'CIBIL score with label'
  },
  {
    pattern: /transunion\s+(?:credit\s+)?score\s*:?\s*\d{3}/i,
    confidence: 0.8,
    description: 'TransUnion score reference'
  },
  {
    pattern: /cibil\s+(?:credit\s+)?report/i,
    confidence: 0.75,
    description: 'CIBIL report mention'
  },
  {
    pattern: /credit\s+information\s+bureau/i,
    confidence: 0.7,
    description: 'Credit bureau reference'
  },

  // Medium confidence patterns (0.5-0.69)
  {
    pattern: /transunion/i,
    confidence: 0.6,
    description: 'TransUnion company mention'
  },
  {
    pattern: /cibil/i,
    confidence: 0.5,
    description: 'CIBIL mention'
  }
];

/**
 * Content structure patterns that indicate CIBIL report format
 */
export const CIBIL_STRUCTURE_PATTERNS = [
  // Account summary section
  {
    pattern: /account\s+summary/i,
    weight: 0.2,
    section: 'account_summary'
  },
  {
    pattern: /credit\s+account\s+details/i,
    weight: 0.2,
    section: 'account_details'
  },

  // Enquiry section
  {
    pattern: /enquiry\s+summary/i,
    weight: 0.15,
    section: 'enquiry_summary'
  },
  {
    pattern: /recent\s+enquir(?:y|ies)/i,
    weight: 0.1,
    section: 'recent_enquiries'
  },

  // Personal information section
  {
    pattern: /personal\s+information/i,
    weight: 0.1,
    section: 'personal_info'
  },
  {
    pattern: /contact\s+information/i,
    weight: 0.1,
    section: 'contact_info'
  },

  // Employment section
  {
    pattern: /employment\s+information/i,
    weight: 0.1,
    section: 'employment_info'
  },

  // Score section
  {
    pattern: /score\s+summary/i,
    weight: 0.15,
    section: 'score_summary'
  },
  {
    pattern: /factors\s+affecting\s+(?:your\s+)?score/i,
    weight: 0.1,
    section: 'score_factors'
  }
];

/**
 * Fallback detection patterns for various CIBIL report formats
 */
export const CIBIL_FALLBACK_PATTERNS = [
  // Legacy format patterns
  {
    pattern: /(?:credit\s+)?score\s*:?\s*\d{3}.*(?:suit\s+filed|overdue|settled)/is,
    confidence: 0.7,
    format: 'legacy',
    description: 'Legacy format with score and status indicators'
  },

  // Scanned document patterns (OCR artifacts)
  {
    pattern: /c[il1]b[il1]l.*(?:score|report)/i,
    confidence: 0.6,
    format: 'scanned',
    description: 'OCR artifacts of CIBIL text'
  },
  {
    pattern: /trans\s*un[il1]on.*(?:score|report)/i,
    confidence: 0.6,
    format: 'scanned',
    description: 'OCR artifacts of TransUnion text'
  },

  // Partial/corrupted format patterns
  {
    pattern: /credit\s+(?:information\s+)?report.*(?:account|loan).*(?:overdue|outstanding)/is,
    confidence: 0.5,
    format: 'partial',
    description: 'Partial credit report with key financial terms'
  },

  // Mobile/web format patterns
  {
    pattern: /(?:your|my)\s+credit\s+score.*\d{3}/i,
    confidence: 0.6,
    format: 'mobile',
    description: 'Mobile app or web format score display'
  }
];

/**
 * Validation rules for CIBIL report content
 */
export const CIBIL_VALIDATION_RULES = {
  // Minimum content requirements
  minimumContentLength: 100,
  
  // Required sections for high confidence
  requiredSections: [
    'score', 'account', 'personal'
  ],
  
  // Score validation
  scoreValidation: {
    pattern: /\b([3-9]\d{2})\b/,
    minValue: 300,
    maxValue: 900,
    requiredForHighConfidence: true
  },

  // Financial terms that should be present
  requiredFinancialTerms: [
    /(?:loan|account|credit)/i,
    /(?:amount|balance|outstanding)/i,
    /(?:overdue|due|payment)/i
  ],

  // Exclusion patterns (things that indicate this is NOT a CIBIL report)
  exclusionPatterns: [
    /bank\s+statement/i,
    /salary\s+slip/i,
    /income\s+tax\s+return/i,
    /form\s+16/i,
    /invoice/i,
    /receipt/i,
    /medical\s+report/i,
    /insurance\s+policy/i
  ],

  // Minimum confidence thresholds
  confidenceThresholds: {
    high: 0.8,
    medium: 0.6,
    low: 0.4,
    minimum: 0.3
  }
};

/**
 * Format-specific detection patterns
 */
export const CIBIL_FORMAT_PATTERNS = {
  DETAILED: {
    indicators: [
      /detailed\s+credit\s+report/i,
      /comprehensive\s+(?:credit\s+)?report/i,
      /month\s+wise\s+payment\s+history/i,
      /account\s+wise\s+details/i,
      /payment\s+history\s+(?:24\s+months|2\s+years)/i,
      /enquiry\s+details/i,
      /address\s+information/i,
      /employment\s+information/i,
      /telephone\s+information/i
    ],
    minimumMatches: 2,
    confidence: 0.8
  },

  SUMMARY: {
    indicators: [
      /(?:credit\s+)?summary/i,
      /brief\s+(?:credit\s+)?report/i,
      /overview/i,
      /snapshot/i,
      /quick\s+view/i
    ],
    minimumMatches: 1,
    confidence: 0.7,
    exclusions: [
      /detailed/i,
      /comprehensive/i,
      /month\s+wise/i
    ]
  },

  STANDARD: {
    indicators: [
      /standard\s+(?:credit\s+)?report/i,
      /regular\s+(?:credit\s+)?report/i,
      /basic\s+(?:credit\s+)?report/i,
      /(?:credit\s+)?report/i
    ],
    minimumMatches: 1,
    confidence: 0.6
  }
};

/**
 * Version detection patterns with associated features
 */
export const CIBIL_VERSION_PATTERNS = [
  {
    version: '4.0',
    patterns: [
      /version\s*:?\s*4\.0/i,
      /cibil\s+4\.0/i,
      /new\s+cibil\s+format/i
    ],
    features: ['enhanced_score_factors', 'detailed_enquiry_analysis', 'credit_mix_analysis']
  },
  {
    version: '3.0',
    patterns: [
      /version\s*:?\s*3\.0/i,
      /cibil\s+3\.0/i
    ],
    features: ['score_factors', 'enquiry_summary', 'account_summary']
  },
  {
    version: '2.0',
    patterns: [
      /version\s*:?\s*2\.0/i,
      /cibil\s+2\.0/i
    ],
    features: ['basic_score', 'account_list', 'enquiry_list']
  },
  {
    version: '1.0',
    patterns: [
      /version\s*:?\s*1\.0/i,
      /cibil\s+1\.0/i,
      /legacy\s+format/i
    ],
    features: ['basic_score', 'simple_account_list']
  }
];

/**
 * Quality assessment patterns for different extraction scenarios
 */
export const QUALITY_ASSESSMENT_PATTERNS = {
  // High quality indicators
  highQuality: [
    /cibil\s+transunion/i,
    /credit\s+information\s+bureau/i,
    /your\s+cibil\s+score\s*:?\s*\d{3}/i,
    /account\s+summary/i,
    /enquiry\s+summary/i
  ],

  // Medium quality indicators
  mediumQuality: [
    /cibil/i,
    /credit\s+score/i,
    /credit\s+report/i,
    /transunion/i
  ],

  // Low quality indicators (OCR issues, partial extraction)
  lowQuality: [
    /c[il1]b[il1]l/i,
    /trans\s*un[il1]on/i,
    /cred[il1]t/i,
    /sc[o0]re/i
  ],

  // Quality degradation factors
  qualityDegradationFactors: [
    { pattern: /[^\w\s\.\,\:\;\-\(\)]/g, impact: -0.1, description: 'Special characters (OCR artifacts)' },
    { pattern: /\b[a-z]{1,2}\b/g, impact: -0.05, description: 'Short fragmented words' },
    { pattern: /\d{10,}/g, impact: -0.1, description: 'Long number sequences (potential OCR errors)' },
    { pattern: /[A-Z]{5,}/g, impact: -0.05, description: 'Long uppercase sequences' }
  ]
};

/**
 * Regional and language-specific patterns for Indian CIBIL reports
 */
export const REGIONAL_PATTERNS = {
  // Hindi/Devanagari script indicators
  hindi: [
    /[\u0900-\u097F]/,
    /सिबिल/,
    /क्रेडिट/,
    /रिपोर्ट/
  ],

  // Common Indian bank names and financial terms
  indianFinancial: [
    /(?:state\s+bank\s+of\s+india|sbi)/i,
    /(?:hdfc|icici|axis|kotak)/i,
    /(?:punjab\s+national\s+bank|pnb)/i,
    /(?:bank\s+of\s+baroda|canara\s+bank)/i,
    /(?:union\s+bank|indian\s+bank)/i,
    /(?:rupees?|rs\.?|₹)/i,
    /(?:lakh|crore|cr\.?|l\.?)/i
  ],

  // Indian address patterns
  indianAddress: [
    /(?:mumbai|delhi|bangalore|chennai|kolkata|hyderabad|pune|ahmedabad)/i,
    /(?:maharashtra|karnataka|tamil\s+nadu|west\s+bengal|gujarat|rajasthan)/i,
    /(?:pin\s*code|pincode)\s*:?\s*\d{6}/i,
    /\d{6}(?:\s*india)?$/im
  ]
};