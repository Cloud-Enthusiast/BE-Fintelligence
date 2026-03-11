
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
    FileText,
    CreditCard,
    Ban,
    User,
    MapPin,
    Calendar,
    IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Using inline interface mirroring the backend Zod schema
export interface CibilData {
    name: string;
    addresses: string[];
    cibilScore: number;
    totalAccounts: number;
    totalOverdueAccounts: number;
    totalOutstandingAmount: number;
    totalSanctionedAmount: number;
    accounts: {
        accountType: string;
        accountNumber: string;
        dateOpened: string;
        sanctionedAmount: number;
        currentBalance: number;
        amountOverdue: number;
        paymentStatus: string;
    }[];
}

interface CibilReportViewProps {
    data: CibilData;
    aiAnalysis?: string;
}

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
    const numericScore = data.cibilScore || 0;

    // Determine Score Color
    let scoreColor = "text-gray-600";
    let scoreBg = "border-gray-200";
    let scoreLabel = "Unknown";

    if (numericScore >= 750) { scoreColor = "text-emerald-600"; scoreBg = "border-emerald-500"; scoreLabel = "Excellent"; }
    else if (numericScore >= 700) { scoreColor = "text-blue-600"; scoreBg = "border-blue-500"; scoreLabel = "Good"; }
    else if (numericScore >= 650) { scoreColor = "text-amber-600"; scoreBg = "border-amber-500"; scoreLabel = "Fair"; }
    else if (numericScore > 0) { scoreColor = "text-red-600"; scoreBg = "border-red-500"; scoreLabel = "Poor"; }

    return (
        <div className="space-y-6">

            {/* Header / Identity Section */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-none shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm uppercase tracking-wide">
                                <User className="h-4 w-4" /> Consumer Details
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">{data.name}</h2>
                            <div className="flex items-start gap-2 text-slate-600 text-sm">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>{data.addresses && data.addresses.length > 0 ? data.addresses[0] : "Address not available"}</p>
                            </div>
                        </div>

                        {/* Credit Score Dial */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-100 w-full md:w-auto min-w-[180px]">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">CIBIL Score</span>
                            <div className={cn("text-5xl font-black tabular-nums tracking-tight", scoreColor)}>
                                {data.cibilScore}
                            </div>
                            <Badge variant="outline" className={cn("mt-2 px-3 py-1 font-semibold", scoreColor.replace('text-', 'border-').replace('600', '200'), "bg-white")}>
                                {scoreLabel}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Active Loans"
                    value={data.totalAccounts || 0}
                    icon={CreditCard}
                />
                <MetricCard
                    label="Overdue Loans"
                    value={data.totalOverdueAccounts || 0}
                    icon={AlertTriangle}
                    alert={(data.totalOverdueAccounts || 0) > 0}
                />
                <MetricCard
                    label="Current Balance"
                    value={`₹${data.totalOutstandingAmount}`}
                    icon={IndianRupee}
                />
                <MetricCard
                    label="Sanctioned Amount"
                    value={`₹${data.totalSanctionedAmount}`}
                    icon={TrendingUp}
                />
            </div>

            {/* Detailed Account List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Account Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="font-bold text-slate-700">Account</TableHead>
                                    <TableHead className="font-bold text-slate-700">Dates</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right">Sanctioned</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right">Current Bal</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-right">Overdue</TableHead>
                                    <TableHead className="font-bold text-slate-700 text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.accounts.map((acc, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-semibold text-slate-900">{acc.accountType}</div>
                                            <div className="text-xs text-slate-500 font-mono">{acc.accountNumber}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs text-slate-600">Opened: {acc.dateOpened}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {acc.sanctionedAmount}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {acc.currentBalance}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {acc.amountOverdue > 0 ? (
                                                <span className="text-red-600 font-bold">₹{acc.amountOverdue.toLocaleString('en-IN')}</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {acc.paymentStatus === 'STD' || acc.paymentStatus === '000' ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Regular</Badge>
                                            ) : (
                                                <Badge variant="destructive">{acc.paymentStatus}</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.accounts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500 italic">
                                            No account details extracted found in the report.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* AI Analysis Section */}
            {aiAnalysis && (
                <Card className="bg-indigo-50 border-indigo-100">
                    <CardHeader>
                        <CardTitle className="text-indigo-900 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            AI Risk Assessment
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
                    <AccordionTrigger className="text-gray-400 text-xs">Developer Debug Data</AccordionTrigger>
                    <AccordionContent>
                        <pre className="bg-gray-950 text-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60 font-mono">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default CibilReportView;
