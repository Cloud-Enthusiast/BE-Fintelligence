
import { ExtractedMSMEData } from '@/types/msmeDocuments';
import { DOCUMENT_TYPE_CONFIG } from '@/types/msmeDocuments';
import { CheckCircle, AlertTriangle, XCircle, Minus, LucideIcon } from 'lucide-react';

export type StatusLevel = 'good' | 'warning' | 'critical' | 'neutral';

export interface MetricDisplay {
    label: string;
    value: string;
    status: StatusLevel;
}

export const getScoreStatus = (score: string): StatusLevel => {
    const num = parseInt(score);
    if (isNaN(num)) return 'neutral';
    if (num >= 750) return 'good';
    if (num >= 650) return 'warning';
    return 'critical';
};

export const getMetricsForData = (data: ExtractedMSMEData): MetricDisplay[] => {
    const docData = data.data as any;

    switch (data.documentType) {
        case 'cibil_report':
            return [
                { label: 'Credit Score', value: docData.creditScore || 'N/A', status: getScoreStatus(docData.creditScore) },
                { label: 'Active Loans', value: String(docData.activeLoans || 0), status: 'neutral' },
                { label: 'Defaults', value: String(docData.defaults || 0), status: docData.defaults > 0 ? 'critical' : 'good' },
                { label: 'Amount Overdue', value: docData.amountOverdue || '₹0', status: docData.amountOverdue && docData.amountOverdue !== '₹0' ? 'warning' : 'good' },
            ];
        case 'balance_sheet':
            return [
                { label: 'Net Worth', value: docData.netWorth || 'N/A', status: 'neutral' },
                { label: 'Working Capital', value: docData.workingCapital || 'N/A', status: 'neutral' },
                { label: 'Total Assets', value: docData.totalAssets || 'N/A', status: 'neutral' },
                { label: 'Total Liabilities', value: docData.totalLiabilities || 'N/A', status: 'neutral' },
            ];
        case 'profit_loss':
            return [
                { label: 'Revenue', value: docData.revenue || 'N/A', status: 'neutral' },
                { label: 'Net Profit', value: docData.netProfit || 'N/A', status: 'neutral' },
                { label: 'EBITDA', value: docData.ebitda || 'N/A', status: 'neutral' },
                { label: 'Profit Margin', value: docData.profitMargin || 'N/A', status: 'neutral' },
            ];
        case 'bank_statement':
            return [
                { label: 'Avg Monthly Balance', value: docData.averageMonthlyBalance || 'N/A', status: 'neutral' },
                { label: 'Cash Flow', value: docData.cashFlowPattern || 'Unknown', status: docData.cashFlowPattern === 'positive' ? 'good' : docData.cashFlowPattern === 'negative' ? 'warning' : 'neutral' },
                { label: 'Cheque Bounces', value: String(docData.chequeBounces || 0), status: docData.chequeBounces > 0 ? 'critical' : 'good' },
                { label: 'Loan EMIs', value: docData.loanEMIs || 'N/A', status: 'neutral' },
            ];
        case 'gst_returns':
            return [
                { label: 'Monthly Turnover', value: docData.monthlyTurnover || 'N/A', status: 'neutral' },
                { label: 'GST Paid', value: docData.gstPaid || 'N/A', status: 'neutral' },
                { label: 'Filing Status', value: docData.filingRegularity || 'Unknown', status: docData.filingRegularity === 'regular' ? 'good' : docData.filingRegularity === 'irregular' ? 'warning' : 'neutral' },
                { label: 'Input Credit', value: docData.inputCredit || 'N/A', status: 'neutral' },
            ];
        default:
            return [];
    }
};
