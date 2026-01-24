
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CIBILReportData } from '@/types/msmeDocuments';
import {
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
    FileText,
    CreditCard,
    Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CibilReportViewProps {
    data: CIBILReportData;
    aiAnalysis?: string;
}

const CreditScoreGauge = ({ score }: { score: number }) => {
    const isExcellent = score >= 750;
    const isGood = score >= 700 && score < 750;
    const isFair = score >= 650 && score < 700;
    const isPoor = score < 650;

    let colorClass = "text-gray-500";
    let label = "Unknown";
    let borderColor = "border-gray-200";

    if (isExcellent) { colorClass = "text-green-600"; label = "Excellent"; borderColor = "border-green-200"; }
    else if (isGood) { colorClass = "text-blue-600"; label = "Good"; borderColor = "border-blue-200"; }
    else if (isFair) { colorClass = "text-yellow-600"; label = "Fair"; borderColor = "border-yellow-200"; }
    else if (isPoor) { colorClass = "text-red-600"; label = "Poor"; borderColor = "border-red-200"; }

    return (
        <div className={cn("flex flex-col items-center justify-center p-6 rounded-full border-8 w-48 h-48 mx-auto", borderColor)}>
            <div className="text-4xl font-bold font-mono">{score}</div>
            <div className={cn("text-lg font-medium", colorClass)}>{label}</div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, alert = false }: { label: string, value: string | number, icon: any, alert?: boolean }) => (
    <div className={cn("flex items-start gap-4 p-4 rounded-lg border", alert ? "bg-red-50 border-red-100" : "bg-white border-gray-100")}>
        <div className={cn("p-2 rounded-md", alert ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600")}>
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={cn("text-lg font-bold", alert ? "text-red-700" : "text-gray-900")}>{value}</p>
        </div>
    </div>
);

const CibilReportView: React.FC<CibilReportViewProps> = ({ data, aiAnalysis }) => {
    const numericScore = parseInt(data.creditScore) || 0;

    return (
        <div className="space-y-6">

            {/* Top Warning Banners - Only show if critical flags are true */}
            {(data.suitFiled || data.wilfulDefault) && (
                <Alert variant="destructive" className="border-red-600 bg-red-50">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle className="font-bold text-red-800">CRITICAL ALERTS DETECTED</AlertTitle>
                    <AlertDescription className="text-red-700 font-medium">
                        {data.suitFiled && <div>• Suit Filed detected against the borrower.</div>}
                        {data.wilfulDefault && <div>• Wilful Default flag identified.</div>}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Credit Score Panel */}
                <Card className="md:col-span-1 shadow-sm">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-gray-500 font-medium text-sm uppercase tracking-wider">CIBIL Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreditScoreGauge score={numericScore} />
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Report Date: <span className="font-medium text-gray-900">{data.reportDate || 'N/A'}</span>
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-500">
                            PAN: <span className="font-mono font-medium text-gray-900">{data.panNumber || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics Panel */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard
                        label="Active Loans"
                        value={data.activeLoans}
                        icon={CreditCard}
                    />
                    <MetricCard
                        label="Total Overdue"
                        value={data.amountOverdue || '₹0'}
                        icon={AlertTriangle}
                        alert={parseInt(String(data.amountOverdue).replace(/[^0-9]/g, '')) > 0}
                    />
                    <MetricCard
                        label="Defaults / Write-offs"
                        value={(data.defaults || 0) + (data.writtenOffAccounts || 0)}
                        icon={Ban}
                        alert={(data.defaults || 0) + (data.writtenOffAccounts || 0) > 0}
                    />
                    <MetricCard
                        label="Total Exposure"
                        value={data.totalLoanAmount || '₹0'}
                        icon={TrendingUp}
                    />
                </div>
            </div>

            {/* DPD Analysis */}
            {data.dpdStrings && data.dpdStrings.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            DPD (Days Past Due) Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {data.dpdStrings.map((dpd, idx) => (
                                <Badge
                                    key={idx}
                                    variant={dpd === '000' || dpd === 'STD' ? 'secondary' : 'destructive'}
                                    className="font-mono"
                                >
                                    {dpd}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            * Sequence of payment history markers found in the report (Recent &rarr; Old).
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* AI Narrative Analysis */}
            {aiAnalysis && (
                <Card className="bg-indigo-50 border-indigo-100">
                    <CardHeader>
                        <CardTitle className="text-indigo-900 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            AI Analysis Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-indigo-800 leading-relaxed whitespace-pre-line">
                            {aiAnalysis}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Raw Data Accordion */}
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-gray-500 text-sm">View Raw Extraction Data</AccordionTrigger>
                    <AccordionContent>
                        <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-60">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default CibilReportView;
