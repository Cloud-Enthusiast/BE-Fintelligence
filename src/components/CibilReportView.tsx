
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ShieldCheck,
    AlertTriangle,
    FileText,
    CreditCard,
    User,
    MapPin,
    IndianRupee,
    Briefcase,
    Activity,
    AlertOctagon,
    Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CibilData {
    name: string;
    addresses: string[];
    cibilScore: number;
    totalAccounts: number;
    totalOverdueAccounts: number;
    totalOutstandingAmount: number;
    totalSanctionedAmount: number;
    suitsFiled?: number;
    wilfulDefault?: boolean;
    totalEnquiries?: number;
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

const MiniMetric = ({ label, value, icon: Icon, alert = false, highlight = false }: { label: string, value: string | number, icon: any, alert?: boolean, highlight?: boolean }) => (
    <div className={cn(
        "flex flex-col p-2.5 rounded-xl border transition-all",
        alert ? "bg-red-50 border-red-100" : highlight ? "bg-indigo-50 border-indigo-100" : "bg-slate-50/50 border-slate-100"
    )}>
        <div className="flex items-center gap-1.5 mb-1">
            <Icon className={cn("h-3.5 w-3.5", alert ? "text-red-500" : highlight ? "text-indigo-500" : "text-slate-400")} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        </div>
        <p className={cn("text-sm font-black tracking-tight", alert ? "text-red-700" : highlight ? "text-indigo-700" : "text-slate-800")}>{value}</p>
    </div>
);

const CibilReportView: React.FC<CibilReportViewProps> = ({ data, aiAnalysis }) => {
    const numericScore = data.cibilScore || 0;

    let scoreColor = "text-slate-600";
    let scoreBg = "from-slate-100 to-slate-50";
    let scoreLabel = "Unknown";
    let scoreRing = "ring-slate-200";

    if (numericScore >= 750) { scoreColor = "text-emerald-600"; scoreBg = "from-emerald-50 to-emerald-100/50"; scoreLabel = "Excellent"; scoreRing = "ring-emerald-200"; }
    else if (numericScore >= 700) { scoreColor = "text-indigo-600"; scoreBg = "from-indigo-50 to-indigo-100/50"; scoreLabel = "Good"; scoreRing = "ring-indigo-200"; }
    else if (numericScore >= 650) { scoreColor = "text-amber-600"; scoreBg = "from-amber-50 to-amber-100/50"; scoreLabel = "Fair"; scoreRing = "ring-amber-200"; }
    else if (numericScore > 0) { scoreColor = "text-rose-600"; scoreBg = "from-rose-50 to-rose-100/50"; scoreLabel = "Poor"; scoreRing = "ring-rose-200"; }

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Split Header: compact layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Identity Block */}
                <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-slate-900 text-white p-4 shadow-lg flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                    <div className="relative z-10 space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-300 font-bold text-[9px] uppercase tracking-widest backdrop-blur-sm">
                            <User className="h-2.5 w-2.5" /> Consumer Details
                        </div>
                        <h2 className="text-lg font-black text-white tracking-tight leading-tight">{data.name}</h2>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <p className="truncate">{data.addresses && data.addresses.length > 0 ? data.addresses[0] : "Address not available"}</p>
                        </div>
                    </div>
                </div>

                {/* Score Dial: compact */}
                <div className={cn("relative overflow-hidden flex flex-col items-center justify-center p-3 bg-gradient-to-br rounded-2xl shadow-md ring-1 backdrop-blur-xl", scoreBg, scoreRing)}>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 text-slate-600">Score</span>
                    <div className={cn("text-4xl font-black tabular-nums tracking-tighter", scoreColor)}>
                        {data.cibilScore}
                    </div>
                    <Badge className={cn("mt-1 px-2 py-0 h-4 text-[9px] font-bold uppercase tracking-widest", scoreColor.replace('text-', 'bg-').replace('600', '500'), "text-white border-none")}>
                        {scoreLabel}
                    </Badge>
                </div>
            </div>

            {/* Metrics Grid: Consolidated and Dense */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                <MiniMetric label="Active" value={data.totalAccounts || 0} icon={CreditCard} />
                <MiniMetric label="Overdue" value={data.totalOverdueAccounts || 0} icon={AlertOctagon} alert={(data.totalOverdueAccounts || 0) > 0} />
                <MiniMetric label="O/S Balance" value={`₹${(data.totalOutstandingAmount || 0).toLocaleString('en-IN')}`} icon={IndianRupee} highlight={true} />
                <MiniMetric label="Suits" value={data.suitsFiled || 0} icon={Scale} alert={(data.suitsFiled || 0) > 0} />
                <MiniMetric label="Default" value={data.wilfulDefault ? 'Yes' : 'No'} icon={AlertTriangle} alert={data.wilfulDefault} />
                <MiniMetric label="Enquiries" value={data.totalEnquiries || 0} icon={Activity} />
            </div>

            {/* Detailed Account List: This now gets the most space */}
            <Card className="flex-1 min-h-[350px] border-slate-200/60 shadow-sm overflow-hidden rounded-2xl flex flex-col">
                <CardHeader className="py-3 px-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        Account Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative">
                    <ScrollArea className="absolute inset-0">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent border-b border-slate-100">
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider">Account</TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Sanctioned</TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right text-indigo-600 font-black">Current Bal</TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Overdue</TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.accounts.map((acc, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                                        <TableCell className="py-2">
                                            <div className="font-bold text-slate-800 text-xs">{acc.accountType}</div>
                                            <div className="text-[9px] text-slate-400 font-mono italic">{acc.accountNumber}</div>
                                        </TableCell>
                                        <TableCell className="py-2 text-right text-xs font-semibold text-slate-600">
                                            ₹{(acc.sanctionedAmount || 0).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell className="py-2 text-right text-xs font-black text-indigo-700">
                                            ₹{(acc.currentBalance || 0).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell className="py-2 text-right">
                                            {acc.amountOverdue > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-black px-1.5 py-0.5 rounded bg-red-50 text-[10px]">
                                                    ₹{acc.amountOverdue.toLocaleString('en-IN')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-medium">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2 text-center">
                                            {acc.paymentStatus === 'STD' || acc.paymentStatus === '000' ? (
                                                <Badge variant="outline" className="h-4 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[9px] px-1.5 py-0">Regular</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="h-4 font-bold text-[9px] px-1.5 py-0 shadow-sm uppercase">{acc.paymentStatus}</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Bottom Accordion for optional info */}
            <Accordion type="single" collapsible className="bg-white rounded-xl border border-slate-200/60 shadow-sm px-3 shrink-0">
                <AccordionItem value="ai" className="border-none">
                    <AccordionTrigger className="py-2 text-indigo-600 hover:text-indigo-800 font-bold text-[11px]">
                        <div className="flex items-center gap-2">
                             <ShieldCheck className="h-3.5 w-3.5" />
                             View AI Risk Analysis
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 px-1">
                         <p className="text-slate-600 font-medium leading-relaxed text-xs">
                            {aiAnalysis || "Full analysis in progress..."}
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default CibilReportView;
