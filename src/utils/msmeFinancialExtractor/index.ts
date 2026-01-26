// MSME Financial Data Extractor
// Extracts structured financial data from raw text using pattern matching

import {
  MSMEDocumentType,
  ExtractedMSMEData,
  BalanceSheetData,
  ProfitLossData,
  BankStatementData,
  GSTReturnsData,
  ITRDocumentData,
  CIBILReportData
} from '@/types/msmeDocuments';
import {
  balanceSheetPatterns,
  profitLossPatterns,
  bankStatementPatterns,
  gstPatterns,
  itrPatterns,
  cibilPatterns,
} from './patterns';
import { extractCibilData } from '../cibilExtractor';

interface ExtractorInput {
  type: MSMEDocumentType;
  extractedText: string;
  structuredData?: any[];
  fileName: string;
}

// Helper to format currency values
const formatCurrency = (value: string | null): string => {
  if (!value) return 'N/A';
  const num = parseFloat(value.replace(/,/g, ''));
  if (isNaN(num)) return 'N/A';
  return `₹${num.toLocaleString('en-IN')}`;
};

// Helper to extract first match from pattern array
const extractFirstMatch = (text: string, patterns: RegExp[]): string | null => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/,/g, '');
    }
  }
  return null;
};

// Calculate extraction confidence based on fields found
const calculateConfidence = (data: Record<string, any>, requiredFields: string[]): 'high' | 'medium' | 'low' => {
  const foundFields = requiredFields.filter(field => data[field] && data[field] !== 'N/A');
  const ratio = foundFields.length / requiredFields.length;

  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  return 'low';
};

// Extract Balance Sheet data
const extractBalanceSheet = (text: string): BalanceSheetData => {
  const data = {
    totalAssets: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.totalAssets)),
    totalLiabilities: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.totalLiabilities)),
    currentAssets: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.currentAssets)),
    fixedAssets: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.fixedAssets)),
    currentLiabilities: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.currentLiabilities)),
    longTermDebt: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.longTermDebt)),
    netWorth: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.netWorth)),
    workingCapital: formatCurrency(extractFirstMatch(text, balanceSheetPatterns.workingCapital)),
    fiscalYear: text.match(/(?:fy|fiscal\s+year|year)\s*[:\-]?\s*(20[0-9]{2}[\-\s]?(?:20)?[0-9]{2})/i)?.[1] || 'N/A',
  };
  return data;
};

// Extract Profit & Loss data
const extractProfitLoss = (text: string): ProfitLossData => {
  const data = {
    revenue: formatCurrency(extractFirstMatch(text, profitLossPatterns.revenue)),
    costOfGoods: formatCurrency(extractFirstMatch(text, profitLossPatterns.costOfGoods)),
    grossProfit: formatCurrency(extractFirstMatch(text, profitLossPatterns.grossProfit)),
    operatingExpenses: formatCurrency(extractFirstMatch(text, profitLossPatterns.operatingExpenses)),
    ebitda: formatCurrency(extractFirstMatch(text, profitLossPatterns.ebitda)),
    netProfit: formatCurrency(extractFirstMatch(text, profitLossPatterns.netProfit)),
    profitMargin: extractFirstMatch(text, profitLossPatterns.profitMargin)
      ? `${extractFirstMatch(text, profitLossPatterns.profitMargin)}%`
      : 'N/A',
    fiscalYear: text.match(/(?:fy|fiscal\s+year|year)\s*[:\-]?\s*(20[0-9]{2}[\-\s]?(?:20)?[0-9]{2})/i)?.[1] || 'N/A',
  };
  return data;
};

// Extract Bank Statement data
const extractBankStatement = (text: string): BankStatementData => {
  const credits = extractFirstMatch(text, bankStatementPatterns.totalCredits);
  const debits = extractFirstMatch(text, bankStatementPatterns.totalDebits);

  // Determine cash flow pattern
  let cashFlowPattern: BankStatementData['cashFlowPattern'] = 'unknown';
  if (credits && debits) {
    const creditsNum = parseFloat(credits);
    const debitsNum = parseFloat(debits);
    if (creditsNum > debitsNum * 1.1) cashFlowPattern = 'positive';
    else if (debitsNum > creditsNum * 1.1) cashFlowPattern = 'negative';
    else cashFlowPattern = 'mixed';
  }

  const bounceMatch = extractFirstMatch(text, bankStatementPatterns.chequeBounce);

  return {
    averageMonthlyBalance: formatCurrency(extractFirstMatch(text, bankStatementPatterns.averageBalance)),
    cashFlowPattern,
    loanEMIs: formatCurrency(extractFirstMatch(text, bankStatementPatterns.emi)),
    chequeBounces: bounceMatch ? parseInt(bounceMatch) : 0,
    totalCredits: formatCurrency(credits),
    totalDebits: formatCurrency(debits),
    statementPeriod: text.match(/(?:period|from)\s*[:\-]?\s*([A-Za-z]+\s+20[0-9]{2}\s*(?:to|[\-–])\s*[A-Za-z]+\s+20[0-9]{2})/i)?.[1] || 'N/A',
    accountNumber: extractFirstMatch(text, bankStatementPatterns.accountNumber) || 'N/A',
  };
};

// Extract GST Returns data
const extractGSTReturns = (text: string): GSTReturnsData => {
  // Determine filing regularity based on keywords
  let filingRegularity: GSTReturnsData['filingRegularity'] = 'unknown';
  if (/regular(?:ly)?\s+fil(?:ed|ing)/i.test(text) || /on[\-\s]?time/i.test(text)) {
    filingRegularity = 'regular';
  } else if (/irregular|late|delayed/i.test(text)) {
    filingRegularity = 'irregular';
  } else if (/delay/i.test(text)) {
    filingRegularity = 'delayed';
  }

  return {
    monthlyTurnover: formatCurrency(extractFirstMatch(text, gstPatterns.turnover)),
    gstPaid: formatCurrency(extractFirstMatch(text, gstPatterns.gstPaid)),
    inputCredit: formatCurrency(extractFirstMatch(text, gstPatterns.inputCredit)),
    filingRegularity,
    gstNumber: extractFirstMatch(text, gstPatterns.gstNumber) || 'N/A',
    reportPeriod: text.match(/(?:period|month|quarter)\s*[:\-]?\s*([A-Za-z]+\s+20[0-9]{2})/i)?.[1] || 'N/A',
  };
};

// Extract ITR Document data
const extractITRDocument = (text: string): ITRDocumentData => {
  return {
    grossIncome: formatCurrency(extractFirstMatch(text, itrPatterns.grossIncome)),
    taxableIncome: formatCurrency(extractFirstMatch(text, itrPatterns.taxableIncome)),
    taxPaid: formatCurrency(extractFirstMatch(text, itrPatterns.taxPaid)),
    assessmentYear: extractFirstMatch(text, itrPatterns.assessmentYear) || 'N/A',
    panNumber: extractFirstMatch(text, itrPatterns.panNumber) || 'N/A',
    businessIncome: formatCurrency(extractFirstMatch(text, itrPatterns.businessIncome)),
    otherIncome: 'N/A', // Complex to extract
  };
};

// Main extraction function
export const extractMsmeDocument = (input: ExtractorInput): ExtractedMSMEData => {
  const { type, extractedText, fileName } = input;

  let data: ExtractedMSMEData['data'];
  let requiredFields: string[];

  switch (type) {
    case 'balance_sheet':
      data = extractBalanceSheet(extractedText);
      requiredFields = ['totalAssets', 'totalLiabilities', 'netWorth'];
      break;
    case 'profit_loss':
      data = extractProfitLoss(extractedText);
      requiredFields = ['revenue', 'netProfit', 'ebitda'];
      break;
    case 'bank_statement':
      data = extractBankStatement(extractedText);
      requiredFields = ['totalCredits', 'totalDebits', 'averageMonthlyBalance'];
      break;
    case 'gst_returns':
      data = extractGSTReturns(extractedText);
      requiredFields = ['monthlyTurnover', 'gstPaid', 'gstNumber'];
      break;
    case 'itr_document':
      data = extractITRDocument(extractedText);
      requiredFields = ['grossIncome', 'taxableIncome', 'assessmentYear'];
      break;
    case 'cibil_report':
      // Using the new robust CIBIL extractor
      const cibilResult = extractCibilData(extractedText);
      data = cibilResult as any; // Cast to bypass type mismatch if interfaces differ slightly
      requiredFields = ['cibilScore', 'name'];
      break;
    default:
      throw new Error(`Unsupported document type: ${type}`);
  }

  const confidence = calculateConfidence(data as Record<string, any>, requiredFields);

  return {
    documentType: type,
    fileName,
    extractedAt: new Date().toISOString(),
    data,
    extractionConfidence: confidence,
    rawText: extractedText,
  };
};
