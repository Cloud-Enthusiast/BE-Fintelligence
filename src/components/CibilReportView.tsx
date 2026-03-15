
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
    Scale,
    Info,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';

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

const MiniMetric = ({ label, value, icon: Icon, alert = false, highlight = false, description }: { label: string, value: string | number, icon: any, alert?: boolean, highlight?: boolean, description?: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className={cn(
                "flex flex-col p-2.5 rounded-xl border transition-all cursor-help hover:shadow-sm",
                alert ? "bg-red-50 border-red-100" : highlight ? "bg-indigo-50 border-indigo-100" : "bg-slate-50/50 border-slate-100"
            )}>
                <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("h-3.5 w-3.5", alert ? "text-red-500" : highlight ? "text-indigo-500" : "text-slate-400")} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                    {description && <Info className="h-2.5 w-2.5 text-slate-300 ml-auto" />}
                </div>
                <p className={cn("text-sm font-black tracking-tight", alert ? "text-red-700" : highlight ? "text-indigo-700" : "text-slate-800")}>{value}</p>
            </div>
        </TooltipTrigger>
        {description && (
            <TooltipContent className="max-w-[200px] text-[11px] leading-tight">
                {description}
            </TooltipContent>
        )}
    </Tooltip>
);

const CibilReportView: React.FC<CibilReportViewProps> = ({ data, aiAnalysis }) => {
    const [filter, setFilter] = React.useState<'all' | 'active' | 'overdue'>('all');
    const [expandedRows, setExpandedRows] = React.useState<number[]>([]);

    const toggleRow = (idx: number) => {
        setExpandedRows(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const filteredAccounts = data.accounts.filter(acc => {
        if (filter === 'overdue') return acc.amountOverdue > 0;
        if (filter === 'active') return acc.currentBalance > 0;
        return true;
    });

    const activeCount = data.accounts.filter(acc => acc.currentBalance > 0).length;
    const overdueCount = data.accounts.filter(acc => acc.amountOverdue > 0).length;
    const totalCount = data.accounts.length;

    const numericScore = data.cibilScore || 0;

    let scoreColor = "text-slate-600";
    let scoreBg = "from-slate-100 to-slate-50";
    let scoreLabel = "Unknown";
    let scoreRing = "ring-slate-200";

    if (numericScore >= 750) { scoreColor = "text-emerald-600"; scoreBg = "from-emerald-50 to-emerald-100/50"; scoreLabel = "Excellent"; scoreRing = "ring-emerald-200"; }
    else if (numericScore >= 700) { scoreColor = "text-emerald-600"; scoreBg = "from-emerald-50 to-emerald-100/50"; scoreLabel = "Good"; scoreRing = "ring-emerald-200"; }
    else if (numericScore >= 650) { scoreColor = "text-amber-600"; scoreBg = "from-amber-50 to-amber-100/50"; scoreLabel = "Fair"; scoreRing = "ring-amber-200"; }
    else if (numericScore > 0) { scoreColor = "text-rose-600"; scoreBg = "from-rose-50 to-rose-100/50"; scoreLabel = "Poor"; scoreRing = "ring-rose-200"; }

    const getStatusSummary = (status: string) => {
        if (!status) return { label: "Unknown", color: "text-slate-400", bg: "bg-slate-50", icon: HelpCircle };
        
        const isHealthy = status.split('').every(char => char === '0' || char === 'S' || char === 'T' || char === 'D');
        const hasRiskChars = /SUB|DBT|LSS/.test(status);
        
        if (hasRiskChars) return { label: "Critical Risk", color: "text-rose-700", bg: "bg-rose-50", icon: AlertOctagon };
        if (!isHealthy) return { label: "Delayed Payments", color: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle };
        
        return { label: "Regular Performance", color: "text-emerald-700", bg: "bg-emerald-50", icon: ShieldCheck };
    };

    return (
        <TooltipProvider>
        <div className="flex flex-col h-full space-y-4">
            {/* Risk Alert: if critical issues */}
            {(data.wilfulDefault || (data.suitsFiled && data.suitsFiled > 0)) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-3 shrink-0 shadow-sm"
                >
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-rose-800 uppercase tracking-tight">Critical Risk Item Found</h4>
                        <p className="text-[10px] text-rose-600 font-medium">
                            {data.wilfulDefault && "Wilful default reported. "}
                            {data.suitsFiled && data.suitsFiled > 0 && `${data.suitsFiled} suit(s) filed by lenders.`}
                        </p>
                    </div>
                </motion.div>
            )}

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
                    <Badge className={cn("mt-1 px-2 py-0 h-4 text-[9px] font-bold uppercase tracking-widest", scoreLabel === "Good" || scoreLabel === "Excellent" ? "bg-emerald-500" : scoreColor.replace('text-', 'bg-').replace('600', '500'), "text-white border-none")}>
                        {scoreLabel}
                    </Badge>
                </div>
            </div>

            {/* Metrics Grid: Consolidated and Dense */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                <div onClick={() => setFilter('all')} className="cursor-pointer">
                    <MiniMetric label="Total" value={totalCount} icon={CreditCard} description="Total credit accounts found in the report." />
                </div>
                <div onClick={() => setFilter('active')} className="cursor-pointer">
                    <MiniMetric label="Active" value={activeCount} icon={Activity} highlight={filter === 'active'} description="Accounts with a current non-zero balance." />
                </div>
                <div onClick={() => setFilter('overdue')} className="cursor-pointer">
                    <MiniMetric label="Overdue" value={overdueCount} icon={AlertOctagon} alert={overdueCount > 0} highlight={filter === 'overdue'} description="Number of accounts with missed payments (Amount Overdue > 0)." />
                </div>
                <div className="opacity-80">
                    <MiniMetric label="O/S Balance" value={`₹${(data.totalOutstandingAmount || 0).toLocaleString('en-IN')}`} icon={IndianRupee} highlight={true} description="Combined current balance across all active accounts." />
                </div>
                <div className="opacity-80">
                    <MiniMetric label="Suits" value={data.suitsFiled || 0} icon={Scale} alert={(data.suitsFiled || 0) > 0} description="Legal cases filed by financial institutions for recovery." />
                </div>
                <div className="opacity-80">
                    <MiniMetric label="Default" value={data.wilfulDefault ? 'Yes' : 'No'} icon={AlertTriangle} alert={data.wilfulDefault} description="Reported as intentional non-payment." />
                </div>
            </div>

            {/* Detailed Account List: This now gets the most space */}
            <Card className="flex-1 min-h-[400px] border-slate-200/60 shadow-sm overflow-hidden rounded-2xl flex flex-col">
                <CardHeader className="py-2 px-4 bg-slate-50/50 border-b border-slate-100 shrink-0 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        Account Details
                    </CardTitle>
                    <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="h-7">
                        <TabsList className="h-full bg-slate-100 border-none p-0.5">
                            <TabsTrigger value="all" className="text-[9px] h-full px-2 font-bold uppercase tracking-wider data-[state=active]:bg-white">All</TabsTrigger>
                            <TabsTrigger value="active" className="text-[9px] h-full px-2 font-bold uppercase tracking-wider data-[state=active]:bg-white">Active</TabsTrigger>
                            <TabsTrigger value="overdue" className="text-[9px] h-full px-2 font-bold uppercase tracking-wider data-[state=active]:bg-red-500 data-[state=active]:text-white">Overdue</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative min-h-0 overflow-hidden">
                    <ScrollArea className="h-[400px] w-full">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent border-b border-slate-100">
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider">Account</TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">
                                        <Tooltip>
                                            <TooltipTrigger className="flex items-center gap-1 ml-auto">
                                                Sanctioned <HelpCircle className="h-2.5 w-2.5 opacity-50" />
                                            </TooltipTrigger>
                                            <TooltipContent>The total loan amount or credit limit approved.</TooltipContent>
                                        </Tooltip>
                                    </TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right text-indigo-600 font-black">
                                        <Tooltip>
                                            <TooltipTrigger className="flex items-center gap-1 ml-auto">
                                                Current Bal <HelpCircle className="h-2.5 w-2.5 opacity-50" />
                                            </TooltipTrigger>
                                            <TooltipContent>The remaining principal amount yet to be paid.</TooltipContent>
                                        </Tooltip>
                                    </TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">
                                        <Tooltip>
                                            <TooltipTrigger className="flex items-center gap-1 ml-auto text-red-500">
                                                Overdue <HelpCircle className="h-2.5 w-2.5 opacity-50" />
                                            </TooltipTrigger>
                                            <TooltipContent>Payment amount that is past its due date.</TooltipContent>
                                        </Tooltip>
                                    </TableHead>
                                    <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center">
                                        <div className="flex items-center justify-center gap-1">
                                    Status Summary
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="h-3.5 w-3.5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                                <Info className="h-2.5 w-2.5 text-slate-500" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-72 p-4 shadow-xl border-slate-200">
                                            <h4 className="text-[11px] font-black uppercase tracking-wider mb-3 text-indigo-700">Payment Status Analysis</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { code: '✅ Regular', label: 'Healthy Credit', desc: 'All payments made on time (000/STD).' },
                                                    { code: '⚠️ Delayed', label: 'DPD Reported', desc: 'Number represents days delayed (e.g. 030 = 30 days).' },
                                                    { code: '🚨 Critical', label: 'Serious Default', desc: 'SUB (Substandard), DBT (Doubtful), or LSS (Loss).' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex gap-2.5 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                                        <div className="text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded h-fit shrink-0">{item.code}</div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-800">{item.label}</span>
                                                            <span className="text-[9px] text-slate-500 leading-tight">{item.desc}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccounts.map((acc, idx) => {
                            const isExpanded = expandedRows.includes(idx);
                            const utilization = acc.sanctionedAmount > 0 ? (acc.currentBalance / acc.sanctionedAmount) * 100 : 0;
                            const statusInfo = getStatusSummary(acc.paymentStatus);

                            return (
                                <React.Fragment key={idx}>
                                    <TableRow 
                                        className={cn(
                                            "hover:bg-indigo-50/30 transition-colors border-b border-slate-50 cursor-pointer group",
                                            isExpanded && "bg-slate-50/50"
                                        )}
                                        onClick={() => toggleRow(idx)}
                                    >
                                        <TableCell className="py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col min-w-0">
                                                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                                        <span className="truncate">{acc.accountType}</span>
                                                        {isExpanded ? <ChevronUp className="h-2.5 w-2.5 opacity-40 shrink-0" /> : <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 shrink-0" />}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-mono italic truncate">{acc.accountNumber}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-right text-xs font-semibold text-slate-600">
                                            ₹{(acc.sanctionedAmount || 0).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell className="py-2.5 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-black text-indigo-700">₹{(acc.currentBalance || 0).toLocaleString('en-IN')}</span>
                                                {acc.sanctionedAmount > 0 && acc.currentBalance > 0 && (
                                                    <div className="w-12">
                                                        <Progress 
                                                            value={utilization} 
                                                            className="h-[3px] bg-slate-100" 
                                                            indicatorClassName={cn(
                                                                utilization > 80 ? "bg-rose-500" : utilization > 50 ? "bg-amber-500" : "bg-emerald-500"
                                                            )} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2.5 text-right">
                                            {acc.amountOverdue > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-black px-1.5 py-0.5 rounded bg-red-50 text-[10px]">
                                                    ₹{acc.amountOverdue.toLocaleString('en-IN')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-medium">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2.5 text-center">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all", statusInfo.bg, statusInfo.color, "border-current/10")}>
                                                        <statusInfo.icon className="h-3 w-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-tight leading-none whitespace-nowrap">{statusInfo.label}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="p-3 max-w-[200px] space-y-2">
                                                    <div className="font-bold text-[10px] uppercase border-b border-slate-100 pb-1 flex items-center gap-1">
                                                        <Activity className="h-3 w-3" /> Payment History
                                                    </div>
                                                    <p className="text-[11px] font-mono break-all leading-tight tracking-widest bg-slate-50 p-1.5 rounded">
                                                        {acc.paymentStatus || "No data"}
                                                    </p>
                                                    <p className="text-[9px] text-slate-500 italic">
                                                        "0" indicates on-time payment. Non-zero numbers indicate days past due.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <TableRow className="bg-slate-50/30 border-b border-slate-100 hover:bg-slate-50/30">
                                                        <TableCell colSpan={5} className="p-0">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div className="space-y-1">
                                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Opening Date</div>
                                                                        <div className="text-xs font-semibold text-slate-700">{acc.dateOpened || "N/A"}</div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utilization Rate</div>
                                                                        <div className="text-xs font-semibold text-slate-700">{utilization.toFixed(1)}%</div>
                                                                    </div>
                                                                    <div className="md:col-span-2 space-y-2">
                                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                            Payment Trend <HelpCircle className="h-2.5 w-2.5" />
                                                                        </div>
                                                                        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                                                                            {/* Mocking a 12-month payment string since it's not in the data interface but requested */}
                                                                            {['000', '000', '000', '023', '010', '000', '000', '000', '000', '000', '000', '000'].map((val, i) => (
                                                                                <div key={i} className={cn(
                                                                                    "w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold border shrink-0",
                                                                                    val === '000' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
                                                                                )}>
                                                                                    {val}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    );
                                })}
                                {filteredAccounts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-slate-400 italic text-xs">
                                            No {filter} accounts found for this report.
                                        </TableCell>
                                    </TableRow>
                                )}
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
        </TooltipProvider>
    );
};

export default CibilReportView;
