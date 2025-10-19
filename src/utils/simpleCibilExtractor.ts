/**
 * Simple CIBIL Extractor
 * Direct approach: find values near their labels in extracted text
 */

export interface SimpleCibilData {
  // Basic fields
  nameOfCustomer: string;
  cibilScore: string;
  bankName: string;
  accountType: string;
  loansPerBank: string;
  totalAmountOfLoan: string;
  bouncedDetails: string;
  typeOfCollateral: string;
  emiAmount: string;
  writtenOffAmountTotal: string;
  writtenOffAmountPrincipal: string;
  suitFiledWilfulDefault: string;
  settlementAmount: string;

  confidence: {
    nameOfCustomer: number;
    cibilScore: number;
    bankName: number;
    accountType: number;
    loansPerBank: number;
    totalAmountOfLoan: number;
    bouncedDetails: number;
    typeOfCollateral: number;
    emiAmount: number;
    writtenOffAmountTotal: number;
    writtenOffAmountPrincipal: number;
    suitFiledWilfulDefault: number;
    settlementAmount: number;
  };
}

export class SimpleCibilExtractor {
  private text: string;

  constructor(text: string) {
    this.text = text.toLowerCase();
  }

  /**
   * Extract all CIBIL fields using simple, direct approach
   */
  public extractAll(): SimpleCibilData {
    return {
      nameOfCustomer: this.extractCustomerName(),
      cibilScore: this.extractCibilScore(),
      bankName: this.extractBankName(),
      accountType: this.extractAccountType(),
      loansPerBank: this.extractLoansPerBank(),
      totalAmountOfLoan: this.extractTotalAmount(),
      bouncedDetails: this.extractBouncedDetails(),
      typeOfCollateral: this.extractCollateralType(),
      emiAmount: this.extractEmiAmount(),
      writtenOffAmountTotal: this.extractWrittenOffTotal(),
      writtenOffAmountPrincipal: this.extractWrittenOffPrincipal(),
      suitFiledWilfulDefault: this.extractSuitFiledWilfulDefault(),
      settlementAmount: this.extractSettlementAmount(),

      confidence: {
        nameOfCustomer: this.getConfidence('customer name'),
        cibilScore: this.getConfidence('cibil score'),
        bankName: this.getConfidence('bank name'),
        accountType: this.getConfidence('account type'),
        loansPerBank: this.getConfidence('loans per bank'),
        totalAmountOfLoan: this.getConfidence('total amount'),
        bouncedDetails: this.getConfidence('bounced details'),
        typeOfCollateral: this.getConfidence('collateral type'),
        emiAmount: this.getConfidence('emi amount'),
        writtenOffAmountTotal: this.getConfidence('written off total'),
        writtenOffAmountPrincipal: this.getConfidence('written off principal'),
        suitFiledWilfulDefault: this.getConfidence('suit filed wilful default'),
        settlementAmount: this.getConfidence('settlement amount')
      }
    };
  }

  /**
   * Extract Customer Name
   */
  private extractCustomerName(): string {
    const patterns = [
      /name\s*:?\s*([A-Za-z\s]{2,50})/i,
      /customer\s*name\s*:?\s*([A-Za-z\s]{2,50})/i,
      /applicant\s*name\s*:?\s*([A-Za-z\s]{2,50})/i,
      /borrower\s*name\s*:?\s*([A-Za-z\s]{2,50})/i,
      /member\s*name\s*:?\s*([A-Za-z\s]{2,50})/i
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate name (should be reasonable length and contain letters)
        if (name.length >= 2 && name.length <= 50 && /[a-zA-Z]/.test(name)) {
          return this.formatName(name);
        }
      }
    }

    return '';
  }

  /**
   * Extract Bank Name (Member Name)
   */
  private extractBankName(): string {
    const patterns = [
      /member\s*name\s*:?\s*([A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))/i,
      /bank\s*name\s*:?\s*([A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))/i,
      /lender\s*:?\s*([A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))/i,
      /institution\s*:?\s*([A-Za-z\s&]+(?:bank|financial|nbfc|ltd|limited))/i
    ];

    // Common bank names to look for
    const bankNames = [
      'hdfc bank', 'icici bank', 'sbi', 'state bank of india', 'axis bank',
      'kotak mahindra bank', 'yes bank', 'indusind bank', 'pnb', 'punjab national bank',
      'bank of baroda', 'canara bank', 'union bank', 'indian bank', 'central bank'
    ];

    // First try pattern matching
    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match && match[1]) {
        return this.formatBankName(match[1].trim());
      }
    }

    // Fallback: look for known bank names in text
    for (const bankName of bankNames) {
      if (this.text.includes(bankName)) {
        return this.formatBankName(bankName);
      }
    }

    return '';
  }

  /**
   * Extract Account Type
   */
  private extractAccountType(): string {
    const patterns = [
      /account\s*type\s*:?\s*([A-Za-z\s]+)/i,
      /loan\s*type\s*:?\s*([A-Za-z\s]+)/i,
      /facility\s*type\s*:?\s*([A-Za-z\s]+)/i,
      /product\s*type\s*:?\s*([A-Za-z\s]+)/i
    ];

    // Common account types
    const accountTypes = [
      'personal loan', 'home loan', 'auto loan', 'education loan', 'business loan',
      'credit card', 'overdraft', 'term loan', 'mortgage', 'vehicle loan',
      'gold loan', 'loan against property', 'working capital'
    ];

    // First try pattern matching
    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match && match[1]) {
        const type = match[1].trim().toLowerCase();
        // Check if it matches known types
        for (const knownType of accountTypes) {
          if (type.includes(knownType) || knownType.includes(type)) {
            return this.formatAccountType(knownType);
          }
        }
        return this.formatAccountType(type);
      }
    }

    // Fallback: look for known account types in text
    for (const accountType of accountTypes) {
      if (this.text.includes(accountType)) {
        return this.formatAccountType(accountType);
      }
    }

    return '';
  }

  /**
   * Extract Loans Per Bank
   */
  private extractLoansPerBank(): string {
    const patterns = [
      /loans?\s*per\s*bank\s*:?\s*(\d+)/i,
      /accounts?\s*per\s*bank\s*:?\s*(\d+)/i,
      /facilities\s*per\s*bank\s*:?\s*(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        if (count >= 0 && count <= 20) {
          return count.toString();
        }
      }
    }

    // Fallback: count unique bank mentions
    const bankMentions = this.text.match(/(?:hdfc|icici|sbi|axis|kotak|yes bank|indusind|pnb|bob|canara)/gi);
    if (bankMentions) {
      const uniqueBanks = [...new Set(bankMentions.map(b => b.toLowerCase()))];
      return uniqueBanks.length.toString();
    }

    return '';
  }

  /**
   * Extract Bounced Details (Payment History >0)
   */
  private extractBouncedDetails(): string {
    const patterns = [
      /bounced?\s*(?:payments?\s*)?:?\s*(\d+)/i,
      /returned\s*(?:payments?\s*)?:?\s*(\d+)/i,
      /failed\s*(?:payments?\s*)?:?\s*(\d+)/i,
      /dishonored?\s*(?:payments?\s*)?:?\s*(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Look for payment history indicators (30, 60, 90, XXX, etc.)
    const paymentHistory = this.text.match(/\b(?:30|60|90|120|150|180|XXX|DPD)\b/g);
    if (paymentHistory) {
      const bouncedCount = paymentHistory.filter(p => p !== '0' && p !== '00').length;
      return bouncedCount > 0 ? bouncedCount.toString() : '0';
    }

    return '0';
  }

  /**
   * Extract Type of Collateral
   */
  private extractCollateralType(): string {
    const patterns = [
      /collateral\s*type\s*:?\s*([A-Za-z\s]+)/i,
      /security\s*type\s*:?\s*([A-Za-z\s]+)/i,
      /guarantee\s*type\s*:?\s*([A-Za-z\s]+)/i,
      /asset\s*type\s*:?\s*([A-Za-z\s]+)/i
    ];

    const collateralTypes = [
      'property', 'vehicle', 'gold', 'fixed deposit', 'shares', 'bonds',
      'real estate', 'machinery', 'inventory', 'unsecured', 'personal guarantee',
      'hypothecation', 'mortgage', 'pledge'
    ];

    // First try pattern matching
    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match && match[1]) {
        return this.formatCollateralType(match[1].trim());
      }
    }

    // Fallback: look for known collateral types
    for (const collateralType of collateralTypes) {
      if (this.text.includes(collateralType)) {
        return this.formatCollateralType(collateralType);
      }
    }

    return 'Unsecured';
  }

  /**
   * Extract EMI Amount
   */
  private extractEmiAmount(): string {
    const patterns = [
      /emi\s*(?:amount\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /monthly\s*(?:installment|payment)\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /installment\s*(?:amount\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /monthly\s*due\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return this.formatAmount(match[1]);
      }
    }

    return '';
  }

  /**
   * Extract Written Off Amount (Total)
   */
  private extractWrittenOffTotal(): string {
    const patterns = [
      /written\s*off\s*(?:total\s*)?(?:amount\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /total\s*written\s*off\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /write\s*off\s*(?:total\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return this.formatAmount(match[1]);
      }
    }

    return '';
  }

  /**
   * Extract Written Off Amount (Principal)
   */
  private extractWrittenOffPrincipal(): string {
    const patterns = [
      /written\s*off\s*principal\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /principal\s*written\s*off\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i,
      /write\s*off\s*principal\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/i
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return this.formatAmount(match[1]);
      }
    }

    return '';
  }

  /**
   * Extract Suit Filed / Wilful Default
   */
  private extractSuitFiledWilfulDefault(): string {
    // Check for explicit yes/no first
    const explicitPatterns = [
      /(?:suit\s*filed|wilful\s*default)\s*:?\s*(yes|no|y|n)/i,
      /legal\s*action\s*:?\s*(yes|no|y|n)/i
    ];

    for (const pattern of explicitPatterns) {
      const match = this.text.match(pattern);
      if (match) {
        const value = match[1].toLowerCase();
        return (value === 'yes' || value === 'y') ? 'Yes' : 'No';
      }
    }

    // Check for positive indicators
    const positiveIndicators = [
      'suit filed', 'wilful default', 'legal action', 'court case',
      'litigation', 'defaulter', 'npa'
    ];

    for (const indicator of positiveIndicators) {
      if (this.text.includes(indicator)) {
        return 'Yes';
      }
    }

    return 'No';
  }

  /**
   * Extract CIBIL Score - look for 3-digit number near "score"
   */
  private extractCibilScore(): string {
    const patterns = [
      /cibil\s*score\s*:?\s*(\d{3})/,
      /credit\s*score\s*:?\s*(\d{3})/,
      /your\s*score\s*:?\s*(\d{3})/,
      /score\s*is\s*(\d{3})/,
      /score\s*:?\s*(\d{3})/
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 300 && score <= 900) {
          return score.toString();
        }
      }
    }

    // Fallback: find any 3-digit number in score context
    const scoreContext = this.findTextAround(['cibil', 'score', 'credit'], 50);
    if (scoreContext) {
      const match = scoreContext.match(/(\d{3})/);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 300 && score <= 900) {
          return score.toString();
        }
      }
    }

    return '';
  }

  /**
   * Extract Number of Loans
   */
  private extractLoanCount(): string {
    const patterns = [
      /(?:number\s*of\s*)?loans?\s*:?\s*(\d+)/,
      /(?:total\s*)?accounts?\s*:?\s*(\d+)/,
      /(\d+)\s*loans?\s*(?:found|reported|in\s*report)/,
      /(\d+)\s*accounts?\s*(?:found|reported|in\s*report)/
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        if (count >= 0 && count <= 50) {
          return count.toString();
        }
      }
    }

    // Count account numbers as fallback
    const accountNumbers = this.text.match(/\b\d{10,20}\b/g);
    if (accountNumbers && accountNumbers.length > 0) {
      return accountNumbers.length.toString();
    }

    return '';
  }

  /**
   * Extract Total Loan Amount
   */
  private extractTotalAmount(): string {
    const patterns = [
      /total\s*(?:loan\s*)?amount\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /sanctioned\s*amount\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /loan\s*amount\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /principal\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return this.formatAmount(match[1]);
      }
    }

    return '';
  }

  /**
   * Extract Overdue Amount
   */
  private extractOverdueAmount(): string {
    const patterns = [
      /(?:amount\s*)?overdue\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /outstanding\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /current\s*balance\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /dues?\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return this.formatAmount(match[1]);
      }
    }

    return '';
  }

  /**
   * Extract Legal Status (Suit Filed/Default)
   */
  private extractLegalStatus(): string {
    // Check for explicit yes/no first
    const explicitPatterns = [
      /suit\s*filed\s*:?\s*(yes|no|y|n)/,
      /legal\s*action\s*:?\s*(yes|no|y|n)/,
      /default\s*:?\s*(yes|no|y|n)/
    ];

    for (const pattern of explicitPatterns) {
      const match = this.text.match(pattern);
      if (match) {
        const value = match[1].toLowerCase();
        return (value === 'yes' || value === 'y') ? 'Yes' : 'No';
      }
    }

    // Check for positive indicators
    const positiveIndicators = [
      'suit filed', 'legal action', 'court case', 'litigation',
      'wilful default', 'payment default', 'npa', 'non performing'
    ];

    for (const indicator of positiveIndicators) {
      if (this.text.includes(indicator)) {
        return 'Yes';
      }
    }

    // Check for negative indicators
    const negativeIndicators = [
      'no suit filed', 'no legal action', 'no default'
    ];

    for (const indicator of negativeIndicators) {
      if (this.text.includes(indicator)) {
        return 'No';
      }
    }

    return 'No';
  }

  /**
   * Extract Settlement Amount
   */
  private extractSettlementAmount(): string {
    const patterns = [
      /settled\s*(?:amount\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /written\s*off\s*(?:amount\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /settlement\s*(?:amount\s*)?:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/,
      /closure\s*amount\s*:?\s*₹?\s*([₹\d,]+(?:\.\d{2})?(?:\s*[clk]r?)?)/
    ];

    for (const pattern of patterns) {
      const match = this.text.match(pattern);
      if (match) {
        return this.formatAmount(match[1]);
      }
    }

    // Check for settlement status without amount
    const statusIndicators = ['settled', 'written off', 'closure', 'settlement'];
    for (const indicator of statusIndicators) {
      if (this.text.includes(indicator)) {
        return 'Yes (Amount not specified)';
      }
    }

    return 'No';
  }

  /**
   * Format amount to consistent display
   */
  private formatAmount(amount: string): string {
    if (!amount) return '';

    // Clean up the amount
    let cleanAmount = amount.replace(/[₹,\s]/g, '');

    // Handle suffixes
    if (cleanAmount.match(/\d+(?:\.\d+)?\s*cr?/i)) {
      const value = parseFloat(cleanAmount.replace(/[^\d.]/g, ''));
      return `₹${value.toFixed(2)} Cr`;
    }

    if (cleanAmount.match(/\d+(?:\.\d+)?\s*l/i)) {
      const value = parseFloat(cleanAmount.replace(/[^\d.]/g, ''));
      return `₹${value.toFixed(2)} L`;
    }

    if (cleanAmount.match(/\d+(?:\.\d+)?\s*k/i)) {
      const value = parseFloat(cleanAmount.replace(/[^\d.]/g, ''));
      return `₹${value.toFixed(2)} K`;
    }

    // Handle plain numbers
    const numericValue = parseFloat(cleanAmount.replace(/[^\d.]/g, ''));
    if (!isNaN(numericValue)) {
      if (numericValue >= 10000000) {
        return `₹${(numericValue / 10000000).toFixed(2)} Cr`;
      } else if (numericValue >= 100000) {
        return `₹${(numericValue / 100000).toFixed(2)} L`;
      } else if (numericValue >= 1000) {
        return `₹${(numericValue / 1000).toFixed(2)} K`;
      } else {
        return `₹${numericValue.toFixed(2)}`;
      }
    }

    return amount;
  }

  /**
   * Find text around keywords
   */
  private findTextAround(keywords: string[], radius: number): string {
    for (const keyword of keywords) {
      const index = this.text.indexOf(keyword);
      if (index !== -1) {
        const start = Math.max(0, index - radius);
        const end = Math.min(this.text.length, index + keyword.length + radius);
        return this.text.substring(start, end);
      }
    }
    return '';
  }

  /**
   * Format customer name
   */
  private formatName(name: string): string {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format bank name
   */
  private formatBankName(bankName: string): string {
    return bankName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format account type
   */
  private formatAccountType(accountType: string): string {
    return accountType.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format collateral type
   */
  private formatCollateralType(collateralType: string): string {
    return collateralType.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Calculate confidence based on field presence
   */
  private getConfidence(fieldType: string): number {
    const fieldKeywords = {
      'customer name': ['name', 'customer', 'applicant', 'borrower'],
      'cibil score': ['cibil', 'score', 'credit'],
      'bank name': ['bank', 'member', 'lender', 'institution'],
      'account type': ['account', 'loan', 'type', 'facility'],
      'loans per bank': ['loans', 'bank', 'per', 'accounts'],
      'total amount': ['total', 'amount', 'sanctioned'],
      'bounced details': ['bounced', 'returned', 'failed', 'dishonored'],
      'collateral type': ['collateral', 'security', 'guarantee', 'asset'],
      'emi amount': ['emi', 'installment', 'monthly', 'payment'],
      'written off total': ['written', 'off', 'total'],
      'written off principal': ['written', 'off', 'principal'],
      'suit filed wilful default': ['suit', 'filed', 'wilful', 'default', 'legal'],
      'settlement amount': ['settlement', 'settled', 'closure']
    };

    const keywords = fieldKeywords[fieldType] || [];
    const foundKeywords = keywords.filter(keyword => this.text.includes(keyword));

    if (foundKeywords.length === keywords.length) return 90;
    if (foundKeywords.length >= keywords.length / 2) return 70;
    if (foundKeywords.length > 0) return 50;
    return 0;
  }
}