import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// Document types matching the Cloud Function
export type MsmeDocumentType =
    | "cibil_report"
    | "balance_sheet"
    | "profit_loss"
    | "bank_statement"
    | "gst_returns"
    | "itr_document";

// ───────────────────────────────────────────────────────────
// Per-document extracted data shapes
// ───────────────────────────────────────────────────────────

export interface BalanceSheetData {
    companyName: string;
    reportingDate: string;
    financialYear: string;
    auditorName: string;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    paidUpCapital: number;
    reservesAndSurplus: number;
    longTermBorrowings: number;
    shortTermBorrowings: number;
    totalBorrowings: number;
    tradePayables: number;
    fixedAssets: number;
    inventory: number;
    tradeReceivables: number;
    cashAndCashEquivalents: number;
    totalCurrentAssets: number;
    totalCurrentLiabilities: number;
    workingCapital: number;
    debtToEquityRatio: number;
    currentRatio: number;
    analysis: string;
}

export interface ProfitLossData {
    companyName: string;
    financialYear: string;
    periodFrom: string;
    periodTo: string;
    totalRevenue: number;
    revenueFromOperations: number;
    otherIncome: number;
    costOfGoodsSold: number;
    grossProfit: number;
    grossProfitMargin: number;
    employeeBenefitExpense: number;
    depreciationAndAmortization: number;
    financeCharges: number;
    totalExpenses: number;
    ebitda: number;
    ebitdaMargin: number;
    profitBeforeTax: number;
    taxExpense: number;
    profitAfterTax: number;
    netProfitMargin: number;
    analysis: string;
}

export interface BankStatementData {
    accountHolderName: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountType: string;
    ifscCode: string;
    statementFromDate: string;
    statementToDate: string;
    openingBalance: number;
    closingBalance: number;
    totalCredits: number;
    totalDebits: number;
    averageMonthlyBalance: number;
    minimumBalance: number;
    maximumBalance: number;
    numberOfCreditTransactions: number;
    numberOfDebitTransactions: number;
    chequeBounces: number;
    nachEcsReturns: number;
    cashFlowPattern: string;
    analysis: string;
}

export interface GstReturnsData {
    businessName: string;
    gstin: string;
    returnType: string;
    taxPeriod: string;
    filingDate: string;
    totalTurnover: number;
    taxableTurnover: number;
    exportTurnover: number;
    totalOutputTax: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalITCClaimed: number;
    netTaxPayable: number;
    taxPaid: number;
    lateFee: number;
    outstandingTax: number;
    numberOfInvoices: number;
    isRegularFiler: boolean;
    analysis: string;
}

export interface ItrDocumentData {
    taxpayerName: string;
    panNumber: string;
    assessmentYear: string;
    filingDate: string;
    itrForm: string;
    acknowledgementNumber: string;
    filingStatus: string;
    grossTotalIncome: number;
    salaryIncome: number;
    businessIncome: number;
    capitalGains: number;
    netTaxableIncome: number;
    totalDeductions: number;
    totalTaxPayable: number;
    taxPaid: number;
    refundAmount: number;
    taxPayable: number;
    analysis: string;
}

// Union of all possible extracted data shapes
export type ExtractedDocumentData =
    | BalanceSheetData
    | ProfitLossData
    | BankStatementData
    | GstReturnsData
    | ItrDocumentData;

// Response from the Cloud Function
export interface MsmeExtractionResult {
    success: boolean;
    documentType: MsmeDocumentType;
    data: ExtractedDocumentData;
}

// ───────────────────────────────────────────────────────────
// Helper: convert File to base64
// ───────────────────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip data URL prefix (e.g. "data:application/pdf;base64,")
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// ───────────────────────────────────────────────────────────
// Main extraction function for all MSME document types
// ───────────────────────────────────────────────────────────

export const extractMsmeDocument = async (
    file: File,
    documentType: MsmeDocumentType
): Promise<MsmeExtractionResult> => {
    const fileBase64 = await fileToBase64(file);

    const fn = httpsCallable<
        { fileBase64: string; mimeType: string; documentType: string },
        MsmeExtractionResult
    >(functions, "extractMsmeDocument");

    const response = await fn({
        fileBase64,
        mimeType: file.type || "application/pdf",
        documentType,
    });

    return response.data;
};

// ───────────────────────────────────────────────────────────
// Formatting helpers
// ───────────────────────────────────────────────────────────

export const formatINR = (amount: number | null | undefined): string => {
    if (!amount && amount !== 0) return "—";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
};

// Key display fields per document type for the upload panel summary
export const getDocumentSummary = (
    documentType: MsmeDocumentType,
    data: any
): Array<{ label: string; value: string }> => {
    switch (documentType) {
        case "balance_sheet":
            return [
                { label: "Net Worth", value: formatINR(data.netWorth) },
                { label: "Total Borrowings", value: formatINR(data.totalBorrowings) },
                { label: "Current Ratio", value: data.currentRatio?.toFixed(2) ?? "—" },
                { label: "Debt/Equity", value: data.debtToEquityRatio?.toFixed(2) ?? "—" },
            ];
        case "profit_loss":
            return [
                { label: "Revenue", value: formatINR(data.totalRevenue) },
                { label: "Net Profit", value: formatINR(data.profitAfterTax) },
                { label: "Net Margin", value: data.netProfitMargin ? `${data.netProfitMargin.toFixed(1)}%` : "—" },
                { label: "EBITDA", value: formatINR(data.ebitda) },
            ];
        case "bank_statement":
            return [
                { label: "Avg Monthly Balance", value: formatINR(data.averageMonthlyBalance) },
                { label: "Total Credits", value: formatINR(data.totalCredits) },
                { label: "Cheque Bounces", value: String(data.chequeBounces ?? 0) },
                { label: "Cash Flow", value: data.cashFlowPattern ?? "—" },
            ];
        case "gst_returns":
            return [
                { label: "Total Turnover", value: formatINR(data.totalTurnover) },
                { label: "Net Tax Payable", value: formatINR(data.netTaxPayable) },
                { label: "Return Type", value: data.returnType ?? "—" },
                { label: "Outstanding Tax", value: formatINR(data.outstandingTax) },
            ];
        case "itr_document":
            return [
                { label: "Gross Income", value: formatINR(data.grossTotalIncome) },
                { label: "Tax Paid", value: formatINR(data.taxPaid) },
                { label: "ITR Form", value: data.itrForm ?? "—" },
                { label: "Assessment Year", value: data.assessmentYear ?? "—" },
            ];
        case "cibil_report":
            return [
                { label: "CIBIL Score", value: String(data.cibilScore ?? "—") },
                { label: "Outstanding", value: formatINR(data.totalCurrentBalance) },
                { label: "Accounts", value: String(data.totalAccounts ?? "—") },
                { label: "Overdue", value: formatINR(data.totalOverdueAmount) },
            ];
        default:
            return [];
    }
};
