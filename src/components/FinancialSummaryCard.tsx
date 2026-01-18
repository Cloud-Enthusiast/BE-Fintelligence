
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ExtractedMSMEData, DOCUMENT_TYPE_CONFIG } from '@/types/msmeDocuments';
import { getMetricsForData, StatusLevel } from '@/utils/financialDisplayUtils';

interface FinancialSummaryCardProps {
  data: ExtractedMSMEData;
  onViewDetails?: () => void;
}

const statusConfig: Record<StatusLevel, { icon: React.ElementType; color: string; bg: string }> = {
  good: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  neutral: { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ data, onViewDetails }) => {
  const config = DOCUMENT_TYPE_CONFIG[data.documentType];
  const metrics = getMetricsForData(data);
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
