// MSME Document Types and Extracted Data Interfaces

export type MSMEDocumentType = 
  | 'balance_sheet'
  | 'profit_loss'
  | 'bank_statement'
  | 'gst_returns'
  | 'itr_document'
  | 'cibil_report';

export interface BalanceSheetData {
  totalAssets: string;
  totalLiabilities: string;
  currentAssets: string;
  fixedAssets: string;
  currentLiabilities: string;
  longTermDebt: string;
  netWorth: string;
  workingCapital: string;
  fiscalYear: string;
}

export interface ProfitLossData {
  revenue: string;
  costOfGoods: string;
  grossProfit: string;
  operatingExpenses: string;
  ebitda: string;
  netProfit: string;
  profitMargin: string;
  fiscalYear: string;
}

export interface BankStatementData {
  averageMonthlyBalance: string;
  cashFlowPattern: 'positive' | 'negative' | 'mixed' | 'unknown';
  loanEMIs: string;
  chequeBounces: number;
  totalCredits: string;
  totalDebits: string;
  statementPeriod: string;
  accountNumber: string;
}

export interface GSTReturnsData {
  monthlyTurnover: string;
  gstPaid: string;
  inputCredit: string;
  filingRegularity: 'regular' | 'irregular' | 'delayed' | 'unknown';
  gstNumber: string;
  reportPeriod: string;
}

export interface CIBILReportData {
  creditScore: string;
  activeLoans: number;
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  defaults: number;
  settledAccounts: number;
  reportDate: string;
  panNumber: string;
  totalLoanAmount: string;
  amountOverdue: string;
}

export interface ITRDocumentData {
  grossIncome: string;
  taxableIncome: string;
  taxPaid: string;
  assessmentYear: string;
  panNumber: string;
  businessIncome: string;
  otherIncome: string;
}

export interface ExtractedMSMEData {
  documentType: MSMEDocumentType;
  fileName: string;
  extractedAt: string;
  data: BalanceSheetData | ProfitLossData | BankStatementData | GSTReturnsData | CIBILReportData | ITRDocumentData;
  extractionConfidence: 'high' | 'medium' | 'low';
  rawText?: string;
}

export interface DocumentUploadState {
  file: File | null;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  extractedData: ExtractedMSMEData | null;
  error: string | null;
}

// Document type metadata
export const DOCUMENT_TYPE_CONFIG: Record<MSMEDocumentType, {
  label: string;
  description: string;
  acceptedFormats: string[];
  icon: string;
  color: string;
}> = {
  balance_sheet: {
    label: 'Balance Sheet',
    description: 'Financial position showing assets, liabilities, and equity',
    acceptedFormats: ['PDF', 'Excel', 'CSV'],
    icon: 'scale',
    color: 'blue'
  },
  profit_loss: {
    label: 'Profit & Loss Statement',
    description: 'Revenue, expenses, and net income for the period',
    acceptedFormats: ['PDF', 'Excel', 'CSV'],
    icon: 'trending-up',
    color: 'green'
  },
  bank_statement: {
    label: 'Bank Statement',
    description: 'Transaction history and account summary',
    acceptedFormats: ['PDF'],
    icon: 'landmark',
    color: 'purple'
  },
  gst_returns: {
    label: 'GST Returns',
    description: 'Monthly or quarterly GST filing documents',
    acceptedFormats: ['PDF', 'JSON'],
    icon: 'receipt',
    color: 'orange'
  },
  itr_document: {
    label: 'ITR Document',
    description: 'Income Tax Return filing documents',
    acceptedFormats: ['PDF'],
    icon: 'file-text',
    color: 'red'
  },
  cibil_report: {
    label: 'CIBIL Report',
    description: 'Credit score and credit history report',
    acceptedFormats: ['PDF'],
    icon: 'shield-check',
    color: 'indigo'
  }
};
