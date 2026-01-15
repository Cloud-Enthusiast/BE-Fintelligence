// Regex patterns for extracting financial data from MSME documents

export const currencyPattern = /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?(?:\s*(?:lakhs?|lacs?|crores?|cr|L|Cr|K|M))?)/gi;
export const percentagePattern = /([0-9]+(?:\.[0-9]{1,2})?)\s*%/g;
export const numberPattern = /([0-9,]+(?:\.[0-9]{1,2})?)/g;

// Balance Sheet patterns
export const balanceSheetPatterns = {
  totalAssets: [
    /total\s+assets?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /assets?\s+total\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /total\s+of\s+assets?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  totalLiabilities: [
    /total\s+liabilities?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /liabilities?\s+total\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  currentAssets: [
    /current\s+assets?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  fixedAssets: [
    /fixed\s+assets?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /non[\-\s]?current\s+assets?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  currentLiabilities: [
    /current\s+liabilities?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  longTermDebt: [
    /long[\-\s]?term\s+(?:debt|borrowings?|liabilities?)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /term\s+loans?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  netWorth: [
    /net\s+worth\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /shareholder'?s?\s+equity\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /equity\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  workingCapital: [
    /working\s+capital\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
};

// Profit & Loss patterns
export const profitLossPatterns = {
  revenue: [
    /(?:total\s+)?revenue\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /(?:total\s+)?sales?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /turnover\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /gross\s+receipts?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  costOfGoods: [
    /cost\s+of\s+(?:goods\s+)?sold\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /cogs\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /purchases?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  grossProfit: [
    /gross\s+profit\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  operatingExpenses: [
    /operating\s+expenses?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /total\s+expenses?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  ebitda: [
    /ebitda\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /operating\s+profit\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  netProfit: [
    /net\s+(?:profit|income)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /profit\s+after\s+tax\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /pat\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  profitMargin: [
    /(?:net\s+)?profit\s+margin\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*%/i,
    /margin\s*[:\-]?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*%/i,
  ],
};

// Bank Statement patterns
export const bankStatementPatterns = {
  averageBalance: [
    /(?:average|avg\.?)\s+(?:monthly\s+)?balance\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /monthly\s+average\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  totalCredits: [
    /(?:total\s+)?credits?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /total\s+deposits?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  totalDebits: [
    /(?:total\s+)?debits?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /total\s+withdrawals?\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  closingBalance: [
    /closing\s+balance\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  emi: [
    /emi\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /loan\s+(?:repayment|payment)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  chequeBounce: [
    /cheque\s+(?:bounce[ds]?|return(?:ed)?|dishonour(?:ed)?)\s*[:\-]?\s*([0-9]+)/i,
    /bounced?\s+cheques?\s*[:\-]?\s*([0-9]+)/i,
    /([0-9]+)\s+cheques?\s+(?:bounced?|returned?|dishonoured?)/i,
  ],
  accountNumber: [
    /a\/c\s*(?:no\.?|number)\s*[:\-]?\s*([0-9]{9,18})/i,
    /account\s*(?:no\.?|number)\s*[:\-]?\s*([0-9]{9,18})/i,
  ],
};

// GST Returns patterns
export const gstPatterns = {
  turnover: [
    /(?:total\s+)?turnover\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /taxable\s+(?:value|turnover)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  gstPaid: [
    /(?:total\s+)?gst\s+(?:paid|payable)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /tax\s+(?:paid|payable)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  inputCredit: [
    /input\s+(?:tax\s+)?credit\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /itc\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  gstNumber: [
    /gstin?\s*[:\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z])/i,
    /gst\s*(?:no\.?|number)\s*[:\-]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z])/i,
  ],
};

// ITR patterns
export const itrPatterns = {
  grossIncome: [
    /gross\s+(?:total\s+)?income\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  taxableIncome: [
    /(?:total\s+)?taxable\s+income\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /income\s+chargeable\s+to\s+tax\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  taxPaid: [
    /(?:total\s+)?tax\s+(?:paid|payable)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  businessIncome: [
    /(?:profit(?:s)?\s+(?:and\s+)?)?(?:gain(?:s)?\s+)?from\s+business\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /business\s+income\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  panNumber: [
    /pan\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i,
  ],
  assessmentYear: [
    /assessment\s+year\s*[:\-]?\s*(20[0-9]{2}[\-\s]?(?:20)?[0-9]{2})/i,
    /a\.?y\.?\s*[:\-]?\s*(20[0-9]{2}[\-\s]?(?:20)?[0-9]{2})/i,
  ],
};

// CIBIL patterns
export const cibilPatterns = {
  creditScore: [
    /(?:cibil\s+)?(?:credit\s+)?score\s*[:\-]?\s*([3-9][0-9]{2})/i,
    /score\s*[:\-]?\s*([3-9][0-9]{2})/i,
  ],
  activeLoans: [
    /active\s+(?:loan)?accounts?\s*[:\-]?\s*([0-9]+)/i,
    /(?:no\.?\s+of\s+)?active\s+loans?\s*[:\-]?\s*([0-9]+)/i,
  ],
  defaults: [
    /defaults?\s*[:\-]?\s*([0-9]+)/i,
    /(?:no\.?\s+of\s+)?default\s+accounts?\s*[:\-]?\s*([0-9]+)/i,
  ],
  overdue: [
    /(?:amount\s+)?overdue\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /overdue\s+amount\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  totalLoanAmount: [
    /(?:total\s+)?(?:outstanding|loan)\s+(?:balance|amount)\s*[:\-]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ],
  settledAccounts: [
    /settled\s+accounts?\s*[:\-]?\s*([0-9]+)/i,
  ],
};
