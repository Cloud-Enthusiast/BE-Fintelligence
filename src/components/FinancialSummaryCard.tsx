import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ExtractedMSMEData, DOCUMENT_TYPE_CONFIG } from '@/types/msmeDocuments';

interface FinancialSummaryCardProps {
  data: ExtractedMSMEData;
  onViewDetails?: () => void;
}

type StatusLevel = 'good' | 'warning' | 'critical' | 'neutral';

interface MetricDisplay {
  label: string;
  value: string;
  status: StatusLevel;
}

const statusConfig: Record<StatusLevel, { icon: React.ElementType; color: string; bg: string }> = {
  good: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  neutral: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ data, onViewDetails }) => {
  const config = DOCUMENT_TYPE_CONFIG[data.documentType];

  // Extract key metrics based on document type
  const getMetrics = (): MetricDisplay[] => {
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

  const getScoreStatus = (score: string): StatusLevel => {
    const num = parseInt(score);
    if (isNaN(num)) return 'neutral';
    if (num >= 750) return 'good';
    if (num >= 650) return 'warning';
    return 'critical';
  };

  const metrics = getMetrics();
  const confidenceBadge = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{config.label}</CardTitle>
          <Badge className={confidenceBadge[data.extractionConfidence]}>
            {data.extractionConfidence} confidence
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{data.fileName}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, idx) => {
            const StatusIcon = statusConfig[metric.status].icon;
            return (
              <div key={idx} className={`p-2 rounded-lg ${statusConfig[metric.status].bg}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <StatusIcon className={`h-3 w-3 ${statusConfig[metric.status].color}`} />
                </div>
                <p className={`text-sm font-semibold ${statusConfig[metric.status].color}`}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
        {onViewDetails && (
          <button 
            onClick={onViewDetails}
            className="mt-3 w-full text-xs text-primary hover:underline"
          >
            View full details →
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
