/**
 * CIBIL Pattern Engine
 * 
 * Specialized pattern matching engine for extracting CIBIL-specific data
 * from credit reports with high accuracy and confidence scoring.
 */

import { ExtractionResult, AmountType, ValidationResult } from '@/types/enhanced-cibil';

/**
 * CIBIL-specific extraction patterns with validation
 */
export class CibilPatternEngine {
  // CIBIL Score Patterns (300-900 range validation)
  private static readonly CIBIL_SCORE_PATTERNS = [
    // Direct score mentions with high confidence
    {
      pattern: /(?:your\s+)?cibil\s*(?:trans\s*union\s*)?score\s*:?\s*([3-9]\d{2})/i,
      confidence: 0.95,
      description: 'Direct CIBIL score with label'
    },
    {
      pattern: /credit\s+score\s*:?\s*([3-9]\d{2})/i,
      confidence: 0.9,
      description: 'Credit score with label'
    },
    {
      pattern: /score\s*:?\s*([3-9]\d{2})/i,
      confidence: 0.85,
      description: 'Generic score with label'
    },
    
    // Score in context patterns
    {
      pattern: /your\s*(?:current\s*)?(?:cibil\s*)?score\s*(?:is\s*)?:?\s*([3-9]\d{2})/i,
      confidence: 0.9,
      description: 'Contextual score mention'
    },
    {
      pattern: /current\s+score\s*:?\s*([3-9]\d{2})/i,
      confidence: 0.85,
      description: 'Current score reference'
    },
    
    // Score in structured format (tables/lists)
    {
      pattern: /score\s*\|\s*([3-9]\d{2})/i,
      confidence: 0.8,
      description: 'Score in table format'
    },
    {
      pattern: /([3-9]\d{2})\s*\|\s*score/i,
      confidence: 0.8,
      description: 'Score value in table format'
    },
    
    // Score with range context
    {
      pattern: /([3-9]\d{2})\s*(?:out\s+of\s+900|\/900)/i,
      confidence: 0.9,
      description: 'Score with range context'
    },
    
    // Fallback patterns with lower confidence
    {
      pattern: /\b([3-9]\d{2})\b(?=.*(?:cibil|credit|score))/i,
      confidence: 0.6,
      description: 'Numeric value near score keywords'
    }
  ];

  // Loan Count Patterns for various account types
  private static readonly LOAN_COUNT_PATTERNS = [
    // Direct count mentions
    {
      pattern: /(?:total\s+)?(?:number\s+of\s+)?(?:active\s+)?(?:loan|account)s?\s*:?\s*(\d+)/i,
      confidence: 0.9,
      description: 'Direct loan/account count'
    },
    {
      pattern: /(\d+)\s+(?:active\s+)?(?:loan|account)s?\s*(?:found|reported|listed|available)/i,
      confidence: 0.85,
      description: 'Count with status qualifier'
    },
    
    // Account summary patterns
    {
      pattern: /accounts?\s+in\s+report\s*:?\s*(\d+)/i,
      confidence: 0.9,
      description: 'Accounts in report count'
    },
    {
      pattern: /total\s+accounts?\s*:?\s*(\d+)/i,
      confidence: 0.85,
      description: 'Total accounts count'
    },
    
    // Credit facility patterns
    {
      pattern: /(?:credit\s+)?facilit(?:y|ies)\s*:?\s*(\d+)/i,
      confidence: 0.8,
      description: 'Credit facilities count'
    },
    {
      pattern: /(\d+)\s+credit\s+lines?/i,
      confidence: 0.8,
      description: 'Credit lines count'
    },
    
    // Account type specific patterns
    {
      pattern: /(?:secured\s+)?(?:loan|account)s?\s*:?\s*(\d+)/i,
      confidence: 0.75,
      description: 'Secured loans count'
    },
    {
      pattern: /(?:unsecured\s+)?(?:loan|account)s?\s*:?\s*(\d+)/i,
      confidence: 0.75,
      description: 'Unsecured loans count'
    },
    {
      pattern: /credit\s+cards?\s*:?\s*(\d+)/i,
      confidence: 0.8,
      description: 'Credit cards count'
    },
    
    // Summary table patterns
    {
      pattern: /(?:loan|account)\s+count\s*:?\s*(\d+)/i,
      confidence: 0.85,
      description: 'Count in summary format'
    }
  ];

  // Amount Extraction Patterns for different currency formats
  private static readonly AMOUNT_PATTERNS = {
    TOTAL_LOAN: [
      {
        pattern: /total\s+(?:loan\s+)?(?:sanctioned\s+)?amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.95,
        description: 'Total loan amount with label'
      },
      {
        pattern: /sanctioned\s+amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.9,
        description: 'Sanctioned amount'
      },
      {
        pattern: /principal\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Principal amount'
      },
      {
        pattern: /credit\s+limit\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Credit limit'
      },
      {
        pattern: /loan\s+amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.8,
        description: 'Loan amount'
      }
    ],
    
    OVERDUE: [
      {
        pattern: /(?:amount\s+)?overdue\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.95,
        description: 'Amount overdue'
      },
      {
        pattern: /outstanding\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.9,
        description: 'Outstanding amount'
      },
      {
        pattern: /current\s+balance\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Current balance'
      },
      {
        pattern: /dues\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.8,
        description: 'Dues amount'
      },
      {
        pattern: /(?:total\s+)?(?:amount\s+)?due\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Amount due'
      }
    ],
    
    SETTLED: [
      {
        pattern: /settled\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.95,
        description: 'Settled amount'
      },
      {
        pattern: /written\s*off\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.9,
        description: 'Written off amount'
      },
      {
        pattern: /closure\s+amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Closure amount'
      },
      {
        pattern: /settlement\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.9,
        description: 'Settlement amount'
      }
    ],
    
    SANCTIONED: [
      {
        pattern: /sanctioned\s+(?:limit|amount)\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.9,
        description: 'Sanctioned limit/amount'
      },
      {
        pattern: /approved\s+(?:limit|amount)\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Approved limit/amount'
      }
    ],
    
    OUTSTANDING: [
      {
        pattern: /outstanding\s+balance\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.9,
        description: 'Outstanding balance'
      },
      {
        pattern: /current\s+outstanding\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
        confidence: 0.85,
        description: 'Current outstanding'
      }
    ]
  };

  /**
   * Extract CIBIL score with validation (300-900 range)
   */
  public static extractCibilScore(text: string): ExtractionResult {
    let bestResult: ExtractionResult = {
      value: '',
      confidence: 0,
      method: 'PATTERN_MATCH'
    };

    for (const patternConfig of this.CIBIL_SCORE_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches[1]) {
        const score = parseInt(matches[1]);
        
        // Validate score range (300-900)
        if (score >= 300 && score <= 900) {
          const confidence = patternConfig.confidence;
          
          if (confidence > bestResult.confidence) {
            bestResult = {
              value: matches[1],
              confidence,
              method: 'PATTERN_MATCH',
              metadata: {
                pattern: patternConfig.description,
                position: matches.index,
                context: this.getContext(text, matches.index || 0, 50)
              }
            };
          }
        }
      }
    }

    return bestResult;
  }

  /**
   * Extract loan count with various account type patterns
   */
  public static extractLoanCount(text: string): ExtractionResult {
    let bestResult: ExtractionResult = {
      value: '',
      confidence: 0,
      method: 'PATTERN_MATCH'
    };

    for (const patternConfig of this.LOAN_COUNT_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches[1]) {
        const count = parseInt(matches[1]);
        
        // Validate reasonable loan count (0-50)
        if (count >= 0 && count <= 50) {
          const confidence = patternConfig.confidence;
          
          if (confidence > bestResult.confidence) {
            bestResult = {
              value: matches[1],
              confidence,
              method: 'PATTERN_MATCH',
              metadata: {
                pattern: patternConfig.description,
                position: matches.index,
                context: this.getContext(text, matches.index || 0, 50)
              }
            };
          }
        }
      }
    }

    return bestResult;
  }

  /**
   * Extract amounts with different currency formats (₹, Cr, L, K)
   */
  public static extractAmounts(text: string, type: AmountType): ExtractionResult {
    let bestResult: ExtractionResult = {
      value: '',
      confidence: 0,
      method: 'PATTERN_MATCH'
    };

    const patterns = this.AMOUNT_PATTERNS[type] || [];

    for (const patternConfig of patterns) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches[1]) {
        const rawAmount = matches[1];
        const normalizedAmount = this.normalizeAmount(rawAmount);
        
        if (normalizedAmount) {
          const confidence = patternConfig.confidence;
          
          if (confidence > bestResult.confidence) {
            bestResult = {
              value: normalizedAmount,
              confidence,
              method: 'PATTERN_MATCH',
              metadata: {
                pattern: patternConfig.description,
                position: matches.index,
                context: this.getContext(text, matches.index || 0, 50)
              }
            };
          }
        }
      }
    }

    return bestResult;
  }

  /**
   * Normalize amount to consistent format
   */
  private static normalizeAmount(rawAmount: string): string {
    // Remove currency symbols and clean up
    let amount = rawAmount.replace(/[₹,\s]/g, '');
    
    // Handle different suffixes
    const croreMatch = amount.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/i);
    if (croreMatch) {
      const value = parseFloat(croreMatch[1]);
      return `₹${value.toFixed(2)} Cr`;
    }
    
    const lakhMatch = amount.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh)/i);
    if (lakhMatch) {
      const value = parseFloat(lakhMatch[1]);
      return `₹${value.toFixed(2)} L`;
    }
    
    const thousandMatch = amount.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)/i);
    if (thousandMatch) {
      const value = parseFloat(thousandMatch[1]);
      return `₹${value.toFixed(2)} K`;
    }
    
    // Handle plain numbers
    const numericMatch = amount.match(/(\d+(?:\.\d+)?)/);
    if (numericMatch) {
      const value = parseFloat(numericMatch[1]);
      
      // Auto-format based on value
      if (value >= 10000000) { // 1 Crore
        return `₹${(value / 10000000).toFixed(2)} Cr`;
      } else if (value >= 100000) { // 1 Lakh
        return `₹${(value / 100000).toFixed(2)} L`;
      } else if (value >= 1000) { // 1 Thousand
        return `₹${(value / 1000).toFixed(2)} K`;
      } else {
        return `₹${value.toFixed(2)}`;
      }
    }
    
    return '';
  }

  /**
   * Get context around a match for better validation
   */
  private static getContext(text: string, position: number, length: number): string {
    const start = Math.max(0, position - length);
    const end = Math.min(text.length, position + length);
    return text.substring(start, end).trim();
  }

  /**
   * Validate extracted CIBIL score
   */
  public static validateCibilScore(score: string): ValidationResult {
    const numericScore = parseInt(score);
    const flags = [];
    
    if (isNaN(numericScore)) {
      flags.push({
        field: 'cibilScore',
        issue: 'Invalid numeric format',
        severity: 'ERROR' as const,
        suggestion: 'Score should be a 3-digit number'
      });
      return { isValid: false, confidence: 0, flags };
    }
    
    if (numericScore < 300 || numericScore > 900) {
      flags.push({
        field: 'cibilScore',
        issue: 'Score outside valid range (300-900)',
        severity: 'ERROR' as const,
        suggestion: 'CIBIL scores range from 300 to 900'
      });
      return { isValid: false, confidence: 0, flags };
    }
    
    // Additional validation for suspicious scores
    if (numericScore < 350) {
      flags.push({
        field: 'cibilScore',
        issue: 'Unusually low score',
        severity: 'WARNING' as const,
        suggestion: 'Verify if this score is correct'
      });
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.95,
      flags
    };
  }

  /**
   * Validate loan count
   */
  public static validateLoanCount(count: string): ValidationResult {
    const numericCount = parseInt(count);
    const flags = [];
    
    if (isNaN(numericCount)) {
      flags.push({
        field: 'numberOfLoans',
        issue: 'Invalid numeric format',
        severity: 'ERROR' as const,
        suggestion: 'Count should be a number'
      });
      return { isValid: false, confidence: 0, flags };
    }
    
    if (numericCount < 0) {
      flags.push({
        field: 'numberOfLoans',
        issue: 'Negative loan count',
        severity: 'ERROR' as const,
        suggestion: 'Loan count cannot be negative'
      });
      return { isValid: false, confidence: 0, flags };
    }
    
    if (numericCount > 50) {
      flags.push({
        field: 'numberOfLoans',
        issue: 'Unusually high loan count',
        severity: 'WARNING' as const,
        suggestion: 'Verify if this count is correct'
      });
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.9,
      flags
    };
  }

  // Legal Status and Settlement Detection Patterns
  private static readonly LEGAL_STATUS_PATTERNS = [
    // Suit Filed patterns
    {
      pattern: /suit\s+filed/i,
      confidence: 0.95,
      status: 'SUIT_FILED',
      description: 'Direct suit filed mention'
    },
    {
      pattern: /legal\s+action\s+(?:taken|initiated)/i,
      confidence: 0.9,
      status: 'SUIT_FILED',
      description: 'Legal action initiated'
    },
    {
      pattern: /court\s+case/i,
      confidence: 0.85,
      status: 'SUIT_FILED',
      description: 'Court case mention'
    },
    {
      pattern: /litigation/i,
      confidence: 0.8,
      status: 'SUIT_FILED',
      description: 'Litigation mention'
    },
    
    // Default patterns
    {
      pattern: /\bdefault\b/i,
      confidence: 0.9,
      status: 'DEFAULT',
      description: 'Default status'
    },
    {
      pattern: /payment\s+default/i,
      confidence: 0.95,
      status: 'DEFAULT',
      description: 'Payment default'
    },
    {
      pattern: /defaulter/i,
      confidence: 0.85,
      status: 'DEFAULT',
      description: 'Defaulter mention'
    },
    
    // NPA (Non-Performing Asset) patterns
    {
      pattern: /\bnpa\b/i,
      confidence: 0.95,
      status: 'NPA',
      description: 'NPA abbreviation'
    },
    {
      pattern: /non[\s-]?performing\s+asset/i,
      confidence: 0.9,
      status: 'NPA',
      description: 'Non-performing asset'
    },
    {
      pattern: /sub[\s-]?standard/i,
      confidence: 0.8,
      status: 'NPA',
      description: 'Sub-standard asset'
    },
    {
      pattern: /doubtful\s+asset/i,
      confidence: 0.85,
      status: 'NPA',
      description: 'Doubtful asset'
    },
    {
      pattern: /loss\s+asset/i,
      confidence: 0.85,
      status: 'NPA',
      description: 'Loss asset'
    },
    
    // Overdue patterns
    {
      pattern: /\d+\s+days?\s+overdue/i,
      confidence: 0.9,
      status: 'OVERDUE',
      description: 'Days overdue'
    },
    {
      pattern: /past\s+due/i,
      confidence: 0.8,
      status: 'OVERDUE',
      description: 'Past due'
    },
    {
      pattern: /payment\s+overdue/i,
      confidence: 0.85,
      status: 'OVERDUE',
      description: 'Payment overdue'
    }
  ];

  private static readonly SETTLEMENT_PATTERNS = [
    // Settled patterns
    {
      pattern: /settled/i,
      confidence: 0.9,
      status: 'SETTLED',
      description: 'Settled status'
    },
    {
      pattern: /settlement/i,
      confidence: 0.85,
      status: 'SETTLED',
      description: 'Settlement mention'
    },
    {
      pattern: /one[\s-]?time\s+settlement/i,
      confidence: 0.95,
      status: 'SETTLED',
      description: 'One-time settlement'
    },
    {
      pattern: /ots/i,
      confidence: 0.9,
      status: 'SETTLED',
      description: 'OTS abbreviation'
    },
    
    // Written-off patterns
    {
      pattern: /written[\s-]?off/i,
      confidence: 0.95,
      status: 'WRITTEN_OFF',
      description: 'Written off status'
    },
    {
      pattern: /write[\s-]?off/i,
      confidence: 0.9,
      status: 'WRITTEN_OFF',
      description: 'Write off mention'
    },
    {
      pattern: /charged[\s-]?off/i,
      confidence: 0.85,
      status: 'WRITTEN_OFF',
      description: 'Charged off'
    },
    {
      pattern: /bad\s+debt/i,
      confidence: 0.8,
      status: 'WRITTEN_OFF',
      description: 'Bad debt'
    },
    
    // Closed patterns
    {
      pattern: /closed/i,
      confidence: 0.8,
      status: 'CLOSED',
      description: 'Closed status'
    },
    {
      pattern: /account\s+closed/i,
      confidence: 0.85,
      status: 'CLOSED',
      description: 'Account closed'
    },
    {
      pattern: /loan\s+closed/i,
      confidence: 0.85,
      status: 'CLOSED',
      description: 'Loan closed'
    },
    
    // Foreclosure patterns
    {
      pattern: /foreclos(?:ed|ure)/i,
      confidence: 0.9,
      status: 'FORECLOSED',
      description: 'Foreclosure'
    },
    {
      pattern: /pre[\s-]?closure/i,
      confidence: 0.85,
      status: 'FORECLOSED',
      description: 'Pre-closure'
    }
  ];

  private static readonly ACCOUNT_STATUS_PATTERNS = [
    // Active account patterns
    {
      pattern: /active/i,
      confidence: 0.9,
      status: 'ACTIVE',
      description: 'Active status'
    },
    {
      pattern: /current/i,
      confidence: 0.7,
      status: 'ACTIVE',
      description: 'Current status'
    },
    {
      pattern: /ongoing/i,
      confidence: 0.8,
      status: 'ACTIVE',
      description: 'Ongoing status'
    },
    
    // Inactive patterns
    {
      pattern: /inactive/i,
      confidence: 0.9,
      status: 'INACTIVE',
      description: 'Inactive status'
    },
    {
      pattern: /dormant/i,
      confidence: 0.85,
      status: 'INACTIVE',
      description: 'Dormant status'
    },
    
    // Suspended patterns
    {
      pattern: /suspended/i,
      confidence: 0.9,
      status: 'SUSPENDED',
      description: 'Suspended status'
    },
    {
      pattern: /blocked/i,
      confidence: 0.85,
      status: 'SUSPENDED',
      description: 'Blocked status'
    }
  ];

  /**
   * Extract legal status indicators (suit filed, default, NPA)
   */
  public static extractLegalStatus(text: string): ExtractionResult {
    const foundStatuses: string[] = [];
    let highestConfidence = 0;
    let bestMatch = '';

    for (const patternConfig of this.LEGAL_STATUS_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches) {
        foundStatuses.push(patternConfig.status);
        
        if (patternConfig.confidence > highestConfidence) {
          highestConfidence = patternConfig.confidence;
          bestMatch = patternConfig.status;
        }
      }
    }

    // Combine multiple statuses if found
    const uniqueStatuses = [...new Set(foundStatuses)];
    const statusString = uniqueStatuses.length > 0 ? uniqueStatuses.join(', ') : 'None';

    return {
      value: statusString,
      confidence: highestConfidence,
      method: 'PATTERN_MATCH',
      metadata: {
        pattern: 'Legal status detection',
        context: `Found ${uniqueStatuses.length} legal status indicators`
      }
    };
  }

  /**
   * Extract settlement and written-off information
   */
  public static extractSettlementStatus(text: string): ExtractionResult {
    const foundStatuses: string[] = [];
    let highestConfidence = 0;
    let bestMatch = '';

    for (const patternConfig of this.SETTLEMENT_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches) {
        foundStatuses.push(patternConfig.status);
        
        if (patternConfig.confidence > highestConfidence) {
          highestConfidence = patternConfig.confidence;
          bestMatch = patternConfig.status;
        }
      }
    }

    // Combine multiple statuses if found
    const uniqueStatuses = [...new Set(foundStatuses)];
    const statusString = uniqueStatuses.length > 0 ? uniqueStatuses.join(', ') : 'None';

    return {
      value: statusString,
      confidence: highestConfidence,
      method: 'PATTERN_MATCH',
      metadata: {
        pattern: 'Settlement status detection',
        context: `Found ${uniqueStatuses.length} settlement status indicators`
      }
    };
  }

  /**
   * Classify account status (active, closed, settled)
   */
  public static classifyAccountStatus(text: string): ExtractionResult {
    const foundStatuses: string[] = [];
    let highestConfidence = 0;
    let bestMatch = '';

    // Check settlement patterns first (higher priority)
    for (const patternConfig of this.SETTLEMENT_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches) {
        foundStatuses.push(patternConfig.status);
        
        if (patternConfig.confidence > highestConfidence) {
          highestConfidence = patternConfig.confidence;
          bestMatch = patternConfig.status;
        }
      }
    }

    // Check general account status patterns
    for (const patternConfig of this.ACCOUNT_STATUS_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches) {
        foundStatuses.push(patternConfig.status);
        
        if (patternConfig.confidence > highestConfidence) {
          highestConfidence = patternConfig.confidence;
          bestMatch = patternConfig.status;
        }
      }
    }

    // Determine primary status
    let primaryStatus = 'UNKNOWN';
    if (foundStatuses.includes('SETTLED') || foundStatuses.includes('WRITTEN_OFF')) {
      primaryStatus = 'SETTLED';
    } else if (foundStatuses.includes('CLOSED') || foundStatuses.includes('FORECLOSED')) {
      primaryStatus = 'CLOSED';
    } else if (foundStatuses.includes('ACTIVE')) {
      primaryStatus = 'ACTIVE';
    } else if (foundStatuses.includes('INACTIVE') || foundStatuses.includes('SUSPENDED')) {
      primaryStatus = 'INACTIVE';
    }

    return {
      value: primaryStatus,
      confidence: highestConfidence,
      method: 'PATTERN_MATCH',
      metadata: {
        pattern: 'Account status classification',
        context: `Primary: ${primaryStatus}, All found: ${foundStatuses.join(', ')}`
      }
    };
  }

  /**
   * Extract settled and written-off amounts
   */
  public static extractSettledAmounts(text: string): ExtractionResult {
    const settledAmounts: string[] = [];
    let totalConfidence = 0;
    let matchCount = 0;

    // Look for settled amounts
    const settledPatterns = [
      /settled\s+(?:for\s+)?(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
      /settlement\s+amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
      /written\s*off\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i,
      /write\s*off\s+(?:amount\s*)?:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?(?:\s*(?:cr|crore|l|lakh|k|thousand))?)/i
    ];

    for (const pattern of settledPatterns) {
      const matches = text.match(pattern);
      if (matches && matches[1]) {
        const normalizedAmount = this.normalizeAmount(matches[1]);
        if (normalizedAmount) {
          settledAmounts.push(normalizedAmount);
          totalConfidence += 0.9;
          matchCount++;
        }
      }
    }

    const averageConfidence = matchCount > 0 ? totalConfidence / matchCount : 0;
    const combinedAmounts = settledAmounts.length > 0 ? settledAmounts.join(', ') : 'None';

    return {
      value: combinedAmounts,
      confidence: averageConfidence,
      method: 'PATTERN_MATCH',
      metadata: {
        pattern: 'Settled/Written-off amounts',
        context: `Found ${settledAmounts.length} settlement amounts`
      }
    };
  }

  /**
   * Validate amount format and value
   */
  public static validateAmount(amount: string): ValidationResult {
    const flags = [];
    
    if (!amount || amount.trim() === '') {
      return { isValid: true, confidence: 0.5, flags }; // Empty amounts are acceptable
    }
    
    // Check if amount follows expected format
    const formatPattern = /^₹\d+(?:\.\d{2})?\s*(?:Cr|L|K)?$/;
    if (!formatPattern.test(amount)) {
      flags.push({
        field: 'amount',
        issue: 'Invalid amount format',
        severity: 'WARNING' as const,
        suggestion: 'Expected format: ₹X.XX Cr/L/K'
      });
    }
    
    // Extract numeric value for range validation
    const numericMatch = amount.match(/₹(\d+(?:\.\d+)?)/);
    if (numericMatch) {
      const value = parseFloat(numericMatch[1]);
      
      if (value < 0) {
        flags.push({
          field: 'amount',
          issue: 'Negative amount',
          severity: 'ERROR' as const,
          suggestion: 'Amount cannot be negative'
        });
        return { isValid: false, confidence: 0, flags };
      }
      
      // Check for suspiciously large amounts (> 100 Cr)
      const multiplier = amount.includes('Cr') ? 10000000 : 
                       amount.includes('L') ? 100000 : 
                       amount.includes('K') ? 1000 : 1;
      
      const actualValue = value * multiplier;
      if (actualValue > 1000000000) { // 100 Cr
        flags.push({
          field: 'amount',
          issue: 'Unusually large amount',
          severity: 'WARNING' as const,
          suggestion: 'Verify if this amount is correct'
        });
      }
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.9,
      flags
    };
  }

  /**
   * Validate legal status extraction
   */
  public static validateLegalStatus(status: string): ValidationResult {
    const flags = [];
    const validStatuses = ['SUIT_FILED', 'DEFAULT', 'NPA', 'OVERDUE', 'None'];
    
    if (!status || status.trim() === '') {
      return { isValid: true, confidence: 0.5, flags };
    }
    
    const statusList = status.split(', ').map(s => s.trim());
    const invalidStatuses = statusList.filter(s => !validStatuses.includes(s) && s !== 'None');
    
    if (invalidStatuses.length > 0) {
      flags.push({
        field: 'legalStatus',
        issue: `Unknown status values: ${invalidStatuses.join(', ')}`,
        severity: 'WARNING' as const,
        suggestion: 'Verify extracted legal status values'
      });
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.9,
      flags
    };
  }

  // Contextual Information Extraction Patterns
  private static readonly REPORT_DATE_PATTERNS = [
    // Standard date formats
    {
      pattern: /report\s+(?:generated?\s+)?(?:date|on)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      confidence: 0.95,
      description: 'Report date with label'
    },
    {
      pattern: /(?:generated?\s+)?(?:date|on)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      confidence: 0.9,
      description: 'Date with label'
    },
    {
      pattern: /date\s+of\s+report\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      confidence: 0.95,
      description: 'Date of report'
    },
    
    // Alternative date formats
    {
      pattern: /(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
      confidence: 0.85,
      description: 'Written date format'
    },
    {
      pattern: /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      confidence: 0.7,
      description: 'ISO date format'
    },
    
    // Context-based date patterns
    {
      pattern: /as\s+(?:on|of)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      confidence: 0.8,
      description: 'As on date'
    },
    {
      pattern: /report\s+as\s+on\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      confidence: 0.9,
      description: 'Report as on date'
    }
  ];

  private static readonly APPLICANT_NAME_PATTERNS = [
    // Direct name patterns
    {
      pattern: /(?:applicant\s+)?name\s*:?\s*([A-Z][a-zA-Z\s\.]{2,50})/i,
      confidence: 0.95,
      description: 'Name with label'
    },
    {
      pattern: /(?:customer\s+)?name\s*:?\s*([A-Z][a-zA-Z\s\.]{2,50})/i,
      confidence: 0.9,
      description: 'Customer name'
    },
    {
      pattern: /(?:borrower\s+)?name\s*:?\s*([A-Z][a-zA-Z\s\.]{2,50})/i,
      confidence: 0.9,
      description: 'Borrower name'
    },
    
    // Personal information section patterns
    {
      pattern: /personal\s+information[\s\S]*?name\s*:?\s*([A-Z][a-zA-Z\s\.]{2,50})/i,
      confidence: 0.85,
      description: 'Name in personal info section'
    },
    {
      pattern: /(?:mr\.?|ms\.?|mrs\.?)\s+([A-Z][a-zA-Z\s\.]{2,50})/i,
      confidence: 0.8,
      description: 'Name with title'
    },
    
    // Report header patterns
    {
      pattern: /credit\s+report\s+(?:for|of)\s+([A-Z][a-zA-Z\s\.]{2,50})/i,
      confidence: 0.85,
      description: 'Name in report header'
    }
  ];

  private static readonly PAN_NUMBER_PATTERNS = [
    // Standard PAN patterns
    {
      pattern: /pan\s*(?:number|no\.?|card)?\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i,
      confidence: 0.95,
      description: 'PAN with label'
    },
    {
      pattern: /permanent\s+account\s+number\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i,
      confidence: 0.9,
      description: 'Full PAN description'
    },
    {
      pattern: /tax\s+id\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i,
      confidence: 0.8,
      description: 'Tax ID (PAN)'
    },
    
    // Context-based PAN patterns
    {
      pattern: /([A-Z]{5}\d{4}[A-Z])/g,
      confidence: 0.7,
      description: 'PAN format match'
    },
    
    // Personal info section PAN
    {
      pattern: /personal\s+information[\s\S]*?pan\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i,
      confidence: 0.85,
      description: 'PAN in personal info section'
    }
  ];

  private static readonly ACCOUNT_NUMBER_PATTERNS = [
    // Direct account number patterns
    {
      pattern: /account\s+(?:number|no\.?)\s*:?\s*([A-Z0-9]{8,20})/gi,
      confidence: 0.9,
      description: 'Account number with label'
    },
    {
      pattern: /a\/c\s+(?:no\.?|number)\s*:?\s*([A-Z0-9]{8,20})/gi,
      confidence: 0.85,
      description: 'A/C number'
    },
    {
      pattern: /loan\s+(?:account\s+)?(?:number|no\.?)\s*:?\s*([A-Z0-9]{8,20})/gi,
      confidence: 0.9,
      description: 'Loan account number'
    },
    
    // Credit card patterns
    {
      pattern: /card\s+(?:number|no\.?)\s*:?\s*([X\d]{4}[\s\-]?[X\d]{4}[\s\-]?[X\d]{4}[\s\-]?[X\d]{4})/gi,
      confidence: 0.85,
      description: 'Credit card number (masked)'
    },
    {
      pattern: /credit\s+card\s*:?\s*([X\d]{4}[\s\-]?[X\d]{4}[\s\-]?[X\d]{4}[\s\-]?[X\d]{4})/gi,
      confidence: 0.8,
      description: 'Credit card with label'
    },
    
    // Table format account numbers
    {
      pattern: /([A-Z0-9]{10,20})(?=\s*\|\s*(?:active|closed|settled))/gi,
      confidence: 0.75,
      description: 'Account number in table'
    },
    
    // Bank-specific patterns
    {
      pattern: /(?:hdfc|icici|sbi|axis|kotak|pnb)[\s\-]?([A-Z0-9]{8,16})/gi,
      confidence: 0.7,
      description: 'Bank-specific account pattern'
    }
  ];

  /**
   * Extract report date with multiple date format support
   */
  public static extractReportDate(text: string): ExtractionResult {
    let bestResult: ExtractionResult = {
      value: '',
      confidence: 0,
      method: 'PATTERN_MATCH'
    };

    for (const patternConfig of this.REPORT_DATE_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches[1]) {
        const dateString = matches[1].trim();
        const normalizedDate = this.normalizeDate(dateString);
        
        if (normalizedDate) {
          const confidence = patternConfig.confidence;
          
          if (confidence > bestResult.confidence) {
            bestResult = {
              value: normalizedDate,
              confidence,
              method: 'PATTERN_MATCH',
              metadata: {
                pattern: patternConfig.description,
                position: matches.index,
                context: this.getContext(text, matches.index || 0, 50)
              }
            };
          }
        }
      }
    }

    return bestResult;
  }

  /**
   * Extract applicant name
   */
  public static extractApplicantName(text: string): ExtractionResult {
    let bestResult: ExtractionResult = {
      value: '',
      confidence: 0,
      method: 'PATTERN_MATCH'
    };

    for (const patternConfig of this.APPLICANT_NAME_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches[1]) {
        const name = matches[1].trim();
        
        // Validate name (should be reasonable length and format)
        if (this.isValidName(name)) {
          const confidence = patternConfig.confidence;
          
          if (confidence > bestResult.confidence) {
            bestResult = {
              value: name,
              confidence,
              method: 'PATTERN_MATCH',
              metadata: {
                pattern: patternConfig.description,
                position: matches.index,
                context: this.getContext(text, matches.index || 0, 50)
              }
            };
          }
        }
      }
    }

    return bestResult;
  }

  /**
   * Extract PAN number
   */
  public static extractPanNumber(text: string): ExtractionResult {
    let bestResult: ExtractionResult = {
      value: '',
      confidence: 0,
      method: 'PATTERN_MATCH'
    };

    for (const patternConfig of this.PAN_NUMBER_PATTERNS) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches[1]) {
        const pan = matches[1].trim().toUpperCase();
        
        // Validate PAN format
        if (this.isValidPAN(pan)) {
          const confidence = patternConfig.confidence;
          
          if (confidence > bestResult.confidence) {
            bestResult = {
              value: pan,
              confidence,
              method: 'PATTERN_MATCH',
              metadata: {
                pattern: patternConfig.description,
                position: matches.index,
                context: this.getContext(text, matches.index || 0, 50)
              }
            };
          }
        }
      }
    }

    return bestResult;
  }

  /**
   * Extract and list all account numbers
   */
  public static extractAccountNumbers(text: string): ExtractionResult {
    const accountNumbers: string[] = [];
    const foundAccounts = new Set<string>();
    let totalConfidence = 0;
    let matchCount = 0;

    for (const patternConfig of this.ACCOUNT_NUMBER_PATTERNS) {
      const matches = text.matchAll(patternConfig.pattern);
      
      for (const match of matches) {
        if (match[1]) {
          const accountNumber = match[1].trim().toUpperCase();
          
          // Avoid duplicates and validate format
          if (!foundAccounts.has(accountNumber) && this.isValidAccountNumber(accountNumber)) {
            foundAccounts.add(accountNumber);
            accountNumbers.push(accountNumber);
            totalConfidence += patternConfig.confidence;
            matchCount++;
          }
        }
      }
    }

    const averageConfidence = matchCount > 0 ? totalConfidence / matchCount : 0;

    return {
      value: accountNumbers.join(', '),
      confidence: averageConfidence,
      method: 'PATTERN_MATCH',
      metadata: {
        pattern: 'Account number extraction',
        context: `Found ${accountNumbers.length} unique account numbers`
      }
    };
  }

  /**
   * Normalize date to consistent format (DD/MM/YYYY)
   */
  private static normalizeDate(dateString: string): string {
    // Handle various date formats
    const datePatterns = [
      // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
      /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/,
      // YYYY/MM/DD, YYYY-MM-DD
      /^(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
      // Written format: 15th March 2024
      /^(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})$/i
    ];

    const monthNames = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    for (let i = 0; i < datePatterns.length; i++) {
      const match = dateString.match(datePatterns[i]);
      if (match) {
        let day, month, year;
        
        if (i === 0) { // DD/MM/YYYY format
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3].length === 2 ? '20' + match[3] : match[3];
        } else if (i === 1) { // YYYY/MM/DD format
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        } else if (i === 2) { // Written format
          day = match[1].padStart(2, '0');
          month = monthNames[match[2].toLowerCase().substring(0, 3)] || '01';
          year = match[3].length === 2 ? '20' + match[3] : match[3];
        }
        
        // Validate date components
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        if (dayNum >= 1 && dayNum <= 31 && 
            monthNum >= 1 && monthNum <= 12 && 
            yearNum >= 2000 && yearNum <= 2030) {
          return `${day}/${month}/${year}`;
        }
      }
    }
    
    return dateString; // Return original if no valid format found
  }

  /**
   * Validate name format
   */
  private static isValidName(name: string): boolean {
    // Name should be 2-50 characters, contain only letters, spaces, and dots
    const namePattern = /^[A-Za-z\s\.]{2,50}$/;
    
    // Should not be all uppercase (likely OCR error) unless short
    if (name.length > 10 && name === name.toUpperCase()) {
      return false;
    }
    
    // Should not contain common non-name words
    const invalidWords = ['REPORT', 'CREDIT', 'CIBIL', 'ACCOUNT', 'LOAN', 'BANK'];
    const upperName = name.toUpperCase();
    
    for (const word of invalidWords) {
      if (upperName.includes(word)) {
        return false;
      }
    }
    
    return namePattern.test(name);
  }

  /**
   * Validate PAN format
   */
  private static isValidPAN(pan: string): boolean {
    // PAN format: 5 letters + 4 digits + 1 letter
    const panPattern = /^[A-Z]{5}\d{4}[A-Z]$/;
    return panPattern.test(pan);
  }

  /**
   * Validate account number format
   */
  private static isValidAccountNumber(accountNumber: string): boolean {
    // Account number should be 8-20 characters, alphanumeric
    if (accountNumber.length < 8 || accountNumber.length > 20) {
      return false;
    }
    
    // Should contain at least some digits
    if (!/\d/.test(accountNumber)) {
      return false;
    }
    
    // Should not be all the same character (likely OCR error)
    if (new Set(accountNumber).size === 1) {
      return false;
    }
    
    return /^[A-Z0-9]+$/.test(accountNumber);
  }

  /**
   * Validate settlement status
   */
  public static validateSettlementStatus(status: string): ValidationResult {
    const flags = [];
    const validStatuses = ['SETTLED', 'WRITTEN_OFF', 'CLOSED', 'FORECLOSED', 'None'];
    
    if (!status || status.trim() === '') {
      return { isValid: true, confidence: 0.5, flags };
    }
    
    const statusList = status.split(', ').map(s => s.trim());
    const invalidStatuses = statusList.filter(s => !validStatuses.includes(s) && s !== 'None');
    
    if (invalidStatuses.length > 0) {
      flags.push({
        field: 'settlementStatus',
        issue: `Unknown status values: ${invalidStatuses.join(', ')}`,
        severity: 'WARNING' as const,
        suggestion: 'Verify extracted settlement status values'
      });
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.9,
      flags
    };
  }

  /**
   * Validate report date
   */
  public static validateReportDate(date: string): ValidationResult {
    const flags = [];
    
    if (!date || date.trim() === '') {
      return { isValid: true, confidence: 0.5, flags };
    }
    
    // Check date format (DD/MM/YYYY)
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(date)) {
      flags.push({
        field: 'reportDate',
        issue: 'Invalid date format',
        severity: 'WARNING' as const,
        suggestion: 'Expected format: DD/MM/YYYY'
      });
      return { isValid: false, confidence: 0.3, flags };
    }
    
    // Validate date components
    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    if (dateObj.getDate() !== day || 
        dateObj.getMonth() !== month - 1 || 
        dateObj.getFullYear() !== year) {
      flags.push({
        field: 'reportDate',
        issue: 'Invalid date values',
        severity: 'ERROR' as const,
        suggestion: 'Check day, month, and year values'
      });
      return { isValid: false, confidence: 0, flags };
    }
    
    // Check if date is reasonable (not too old or in future)
    const now = new Date();
    const reportDate = new Date(year, month - 1, day);
    const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < -30) { // More than 30 days in future
      flags.push({
        field: 'reportDate',
        issue: 'Report date is in the future',
        severity: 'WARNING' as const,
        suggestion: 'Verify the report date'
      });
    } else if (daysDiff > 365 * 5) { // More than 5 years old
      flags.push({
        field: 'reportDate',
        issue: 'Report date is very old',
        severity: 'WARNING' as const,
        suggestion: 'Consider requesting a fresh report'
      });
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.95,
      flags
    };
  }

  /**
   * Validate PAN number
   */
  public static validatePanNumber(pan: string): ValidationResult {
    const flags = [];
    
    if (!pan || pan.trim() === '') {
      return { isValid: true, confidence: 0.5, flags };
    }
    
    if (!this.isValidPAN(pan)) {
      flags.push({
        field: 'panNumber',
        issue: 'Invalid PAN format',
        severity: 'ERROR' as const,
        suggestion: 'PAN should be in format: AAAAA9999A'
      });
      return { isValid: false, confidence: 0, flags };
    }
    
    return {
      isValid: true,
      confidence: 0.95,
      flags
    };
  }

  /**
   * Validate applicant name
   */
  public static validateApplicantName(name: string): ValidationResult {
    const flags = [];
    
    if (!name || name.trim() === '') {
      return { isValid: true, confidence: 0.5, flags };
    }
    
    if (!this.isValidName(name)) {
      flags.push({
        field: 'applicantName',
        issue: 'Invalid name format',
        severity: 'WARNING' as const,
        suggestion: 'Name should contain only letters, spaces, and dots'
      });
      return { isValid: false, confidence: 0.3, flags };
    }
    
    // Check for common OCR errors
    if (name.length < 3) {
      flags.push({
        field: 'applicantName',
        issue: 'Name too short',
        severity: 'WARNING' as const,
        suggestion: 'Verify if the extracted name is complete'
      });
    }
    
    return {
      isValid: true,
      confidence: flags.length > 0 ? 0.7 : 0.9,
      flags
    };
  }
}