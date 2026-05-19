
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ShieldCheck,
    AlertTriangle,
    FileText,
    CreditCard,
    User,
    MapPin,
    IndianRupee,
    Activity,
    AlertOctagon,
    Scale,
    Info,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    TrendingDown
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';

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

// Parses a raw CIBIL payment status string into 3-char monthly segments.
// CIBIL strings are sequences like "000000030060SUBSTD000" where each 3-char block = one month.
// Returns most-recent-first if the string is aligned to 3 chars.
function parsePaymentHistory(status: string): string[] {
    if (!status) return [];
    const chunks: string[] = [];
    for (let i = 0; i + 3 <= status.length; i += 3) {
        chunks.push(status.slice(i, i + 3));
    }
    // If there's a trailing 1-2 char remainder, pad and include it
    const remainder = status.length % 3;
    if (remainder > 0) {
        chunks.push(status.slice(-remainder).padEnd(3, '0'));
    }
    return chunks;
}

function getSegmentStyle(seg: string): { bg: string; border: string; text: string; label: string } {
    if (!seg || seg === 'XXX' || seg === '   ') return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-400', label: 'No Data' };
    if (/^(000|STD)$/i.test(seg)) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'On Time' };
    if (/SUB/i.test(seg)) return { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800', label: 'Substandard' };
    if (/DBT/i.test(seg)) return { bg: 'bg-rose-200', border: 'border-rose-400', text: 'text-rose-900', label: 'Doubtful' };
    if (/LSS/i.test(seg)) return { bg: 'bg-rose-300', border: 'border-rose-500', text: 'text-rose-950', label: 'Loss' };
    // Numeric DPD: e.g. "030", "060", "090"
    const dpd = parseInt(seg, 10);
    if (!isNaN(dpd) && dpd > 0) {
        if (dpd <= 30) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: `${dpd}d late` };
        if (dpd <= 60) return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', label: `${dpd}d late` };
        return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', label: `${dpd}d late` };
    }
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-500', label: seg };
}

const MiniMetric = ({ label, value, icon: Icon, alert = false, highlight = false, description, active = false }: {
    label: string; value: string | number; icon: any; alert?: boolean; highlight?: boolean; description?: string; active?: boolean;
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className={cn(
                "flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.02]",
                active ? "ring-2 ring-offset-1" : "",
                alert && active ? "bg-red-100 border-red-300 ring-red-300" :
                alert ? "bg-red-50 border-red-100 hover:border-red-200" :
                highlight && active ? "bg-indigo-100 border-indigo-300 ring-indigo-300" :
                highlight ? "bg-indigo-50 border-indigo-100 hover:border-indigo-200" :
                active ? "bg-slate-100 border-slate-300 ring-slate-300" :
                "bg-slate-50/50 border-slate-100 hover:border-slate-200"
            )}>
                <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("h-3.5 w-3.5", alert ? "text-red-500" : highlight ? "text-indigo-500" : "text-slate-400")} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                    {description && <Info className="h-2.5 w-2.5 text-slate-300 ml-auto" />}
                </div>
                <p className={cn("text-sm font-black tracking-tight", alert ? "text-red-700" : highlight ? "text-indigo-700" : "text-slate-800")}>{value}</p>
                {active && (
                    <div className="mt-1 h-0.5 w-full rounded-full bg-current opacity-30" />
                )}
            </div>
        </TooltipTrigger>
        {description && (
            <TooltipContent className="max-w-[200px] text-[11px] leading-tight">
                {description}
            </TooltipContent>
        )}
    </Tooltip>
);

// Summarizes a payment status string with richer severity info
const getStatusSummary = (status: string) => {
    if (!status) return { label: "Unknown", color: "text-slate-400", bg: "bg-slate-50", icon: HelpCircle, severity: 0 };

    const segments = parsePaymentHistory(status);
    const hasLoss = segments.some(s => /LSS/i.test(s));
    const hasDoubtful = segments.some(s => /DBT/i.test(s));
    const hasSubstandard = segments.some(s => /SUB/i.test(s));
    const severeDpd = segments.some(s => { const n = parseInt(s, 10); return !isNaN(n) && n > 60; });
    const anyDpd = segments.some(s => { const n = parseInt(s, 10); return !isNaN(n) && n > 0; });

    if (hasLoss) return { label: "Loss Account", color: "text-rose-900", bg: "bg-rose-100", icon: AlertOctagon, severity: 5 };
    if (hasDoubtful) return { label: "Doubtful", color: "text-rose-700", bg: "bg-rose-50", icon: AlertOctagon, severity: 4 };
    if (hasSubstandard) return { label: "Substandard", color: "text-rose-700", bg: "bg-rose-50", icon: AlertOctagon, severity: 3 };
    if (severeDpd) return { label: "Severe Delay", color: "text-orange-700", bg: "bg-orange-50", icon: TrendingDown, severity: 2 };
    if (anyDpd) return { label: "Delayed Pmts", color: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle, severity: 1 };

    return { label: "On Schedule", color: "text-emerald-700", bg: "bg-emerald-50", icon: ShieldCheck, severity: 0 };
};

const PaymentTrendBar: React.FC<{ status: string }> = ({ status }) => {
    const segments = parsePaymentHistory(status);
    if (segments.length === 0) {
        return <p className="text-[10px] text-slate-400 italic">No payment history available.</p>;
    }

    const maxVisible = 24; // show up to 24 months
    const visible = segments.slice(0, maxVisible);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
                {visible.map((seg, i) => {
                    const style = getSegmentStyle(seg);
                    const monthLabel = `M-${i + 1}`;
                    return (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "w-8 h-7 rounded flex items-center justify-center text-[8px] font-bold border shrink-0 cursor-default transition-transform hover:scale-110",
                                    style.bg, style.border, style.text
                                )}>
                                    {seg}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px] p-2 space-y-0.5">
                                <div className="font-bold">{monthLabel}</div>
                                <div className={style.text}>{style.label}</div>
                                <div className="text-slate-400 text-[9px]">Code: {seg}</div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
            <div className="flex items-center gap-3 text-[9px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-block" /> On Time (000/STD)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" /> Late (DPD)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 inline-block" /> Critical (SUB/DBT/LSS)</span>
                <span className="text-slate-300 ml-auto">{segments.length} months total</span>
            </div>
        </div>
    );
};

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

    return (
        <TooltipProvider>
        <div className="flex flex-col h-full space-y-4">

            {/* Risk Alert */}
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

            {/* Identity + Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        {data.addresses && data.addresses.length > 1 && (
                            <p className="text-[9px] text-slate-500 italic ml-4.5">+{data.addresses.length - 1} more address(es)</p>
                        )}
                    </div>
                </div>

                <div className={cn("relative overflow-hidden flex flex-col items-center justify-center p-3 bg-gradient-to-br rounded-2xl shadow-md ring-1 backdrop-blur-xl", scoreBg, scoreRing)}>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 text-slate-600">CIBIL Score</span>
                    <div className={cn("text-4xl font-black tabular-nums tracking-tighter", scoreColor)}>
                        {data.cibilScore || "–"}
                    </div>
                    <Badge className={cn(
                        "mt-1 px-2 py-0 h-4 text-[9px] font-bold uppercase tracking-widest text-white border-none",
                        scoreLabel === "Excellent" || scoreLabel === "Good" ? "bg-emerald-500" :
                        scoreLabel === "Fair" ? "bg-amber-500" :
                        scoreLabel === "Poor" ? "bg-rose-500" : "bg-slate-400"
                    )}>
                        {scoreLabel}
                    </Badge>
                    <div className="mt-2 w-full px-1">
                        <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                            <span>300</span><span>900</span>
                        </div>
                        <div className="w-full h-1.5 bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-300 rounded-full relative">
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white shadow"
                                style={{ left: `${Math.min(100, Math.max(0, ((numericScore - 300) / 600) * 100))}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Metrics — clearly labeled as clickable filters */}
            <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 ml-0.5">
                    Click a tile to filter the account list below
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <div onClick={() => setFilter('all')}>
                        <MiniMetric label="All Accounts" value={totalCount} icon={CreditCard} active={filter === 'all'} description="Click to show all credit accounts." />
                    </div>
                    <div onClick={() => setFilter('active')}>
                        <MiniMetric label="Active" value={activeCount} icon={Activity} highlight active={filter === 'active'} description="Click to show only accounts with a non-zero balance." />
                    </div>
                    <div onClick={() => setFilter('overdue')}>
                        <MiniMetric label="Overdue" value={overdueCount} icon={AlertOctagon} alert={overdueCount > 0} active={filter === 'overdue'} description="Click to show only accounts with missed payments." />
                    </div>
                    <div className="opacity-80 pointer-events-none">
                        <MiniMetric label="O/S Balance" value={`₹${(data.totalOutstandingAmount || 0).toLocaleString('en-IN')}`} icon={IndianRupee} highlight description="Combined outstanding balance across all active accounts." />
                    </div>
                    <div className="opacity-80 pointer-events-none">
                        <MiniMetric label="Suits Filed" value={data.suitsFiled || 0} icon={Scale} alert={(data.suitsFiled || 0) > 0} description="Legal recovery cases filed by lenders." />
                    </div>
                    <div className="opacity-80 pointer-events-none">
                        <MiniMetric label="Wilful Default" value={data.wilfulDefault ? 'Yes' : 'No'} icon={AlertTriangle} alert={data.wilfulDefault} description="Reported as intentional non-payment by lender." />
                    </div>
                </div>
            </div>

            {/* Account List */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-2xl flex flex-col">
                <CardHeader className="py-2 px-4 bg-slate-50/50 border-b border-slate-100 shrink-0 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        Account Details
                        <span className="text-[10px] font-normal text-slate-400">
                            {filteredAccounts.length} of {totalCount} shown · click any row to expand
                        </span>
                    </CardTitle>
                    <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="h-7">
                        <TabsList className="h-full bg-slate-100 border-none p-0.5">
                            <TabsTrigger value="all" className="text-[9px] h-full px-2 font-bold uppercase tracking-wider data-[state=active]:bg-white">All</TabsTrigger>
                            <TabsTrigger value="active" className="text-[9px] h-full px-2 font-bold uppercase tracking-wider data-[state=active]:bg-white">Active</TabsTrigger>
                            <TabsTrigger value="overdue" className="text-[9px] h-full px-2 font-bold uppercase tracking-wider data-[state=active]:bg-red-500 data-[state=active]:text-white">Overdue</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                {/* Using overflow-auto on a plain div avoids the ScrollArea viewport recalc issue during row expansion */}
                <div className="overflow-auto max-h-[520px] w-full relative">
                    <Table>
                        <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider">Account</TableHead>
                                <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                                            Sanctioned <HelpCircle className="h-2.5 w-2.5 opacity-50" />
                                        </TooltipTrigger>
                                        <TooltipContent>The total loan amount or credit limit approved by the lender.</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right text-indigo-600">
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                                            Current Bal <HelpCircle className="h-2.5 w-2.5 opacity-50" />
                                        </TooltipTrigger>
                                        <TooltipContent>Remaining principal still to be repaid. Progress bar shows utilization vs. sanctioned limit.</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead className="py-2 h-auto font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center gap-1 ml-auto text-red-500">
                                            Overdue <HelpCircle className="h-2.5 w-2.5 opacity-50" />
                                        </TooltipTrigger>
                                        <TooltipContent>Amount past its due date and not yet paid. A non-zero value signals a default risk.</TooltipContent>
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
                                            <PopoverContent className="w-80 p-4 shadow-xl border-slate-200">
                                                <h4 className="text-[11px] font-black uppercase tracking-wider mb-3 text-indigo-700">Payment Status Guide</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        { code: 'On Schedule', bg: 'bg-emerald-50 border-emerald-200', label: 'Regular Payments', desc: 'All payments on time. Status codes: 000 or STD.' },
                                                        { code: 'Delayed Pmts', bg: 'bg-amber-50 border-amber-200', label: 'DPD Reported', desc: 'Some payments delayed. e.g. "030" = 30 days past due, "060" = 60 days past due.' },
                                                        { code: 'Severe Delay', bg: 'bg-orange-100 border-orange-300', label: 'DPD > 60 Days', desc: 'Repeated or severe delays. High credit risk signal.' },
                                                        { code: 'Substandard', bg: 'bg-rose-50 border-rose-200', label: 'NPA — SUB', desc: 'Classified as Non-Performing Asset at Substandard stage.' },
                                                        { code: 'Doubtful', bg: 'bg-rose-100 border-rose-300', label: 'NPA — DBT', desc: 'Doubtful of recovery. Serious credit concern.' },
                                                        { code: 'Loss Account', bg: 'bg-rose-200 border-rose-400', label: 'NPA — LSS', desc: 'Written off as a loss. Highest risk classification.' },
                                                    ].map((item, i) => (
                                                        <div key={i} className={cn("flex gap-2.5 border rounded-lg p-2", item.bg)}>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-slate-800">{item.code} → {item.label}</span>
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
                                                <div className="flex flex-col min-w-0">
                                                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                                        <span className="truncate">{acc.accountType}</span>
                                                        {isExpanded
                                                            ? <ChevronUp className="h-2.5 w-2.5 opacity-40 shrink-0" />
                                                            : <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 shrink-0" />
                                                        }
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-mono italic truncate">{acc.accountNumber}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right text-xs font-semibold text-slate-600">
                                                ₹{(acc.sanctionedAmount || 0).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs font-black text-indigo-700">₹{(acc.currentBalance || 0).toLocaleString('en-IN')}</span>
                                                    {acc.sanctionedAmount > 0 && acc.currentBalance > 0 && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="w-12 cursor-help">
                                                                    <Progress
                                                                        value={utilization}
                                                                        className="h-[3px] bg-slate-100"
                                                                        indicatorClassName={cn(
                                                                            utilization > 80 ? "bg-rose-500" : utilization > 50 ? "bg-amber-500" : "bg-emerald-500"
                                                                        )}
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px]">
                                                                Utilization: {utilization.toFixed(1)}% of sanctioned limit used
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-right">
                                                {acc.amountOverdue > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-red-600 font-black px-1.5 py-0.5 rounded bg-red-50 text-[10px]">
                                                        ₹{acc.amountOverdue.toLocaleString('en-IN')}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-medium">–</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-2.5 text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all",
                                                    statusInfo.bg, statusInfo.color, "border-current/10"
                                                )}>
                                                    <statusInfo.icon className="h-3 w-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-tight leading-none whitespace-nowrap">{statusInfo.label}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded detail row */}
                                        {isExpanded && (
                                            <TableRow className="bg-slate-50/30 border-b border-slate-100 hover:bg-slate-50/30">
                                                <TableCell colSpan={5} className="px-4 py-3">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                    <CalendarDays className="h-3 w-3" /> Opened
                                                                </div>
                                                                <div className="text-xs font-semibold text-slate-700">{acc.dateOpened || "N/A"}</div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Utilization</div>
                                                                <div className={cn(
                                                                    "text-xs font-black",
                                                                    utilization > 80 ? "text-rose-600" : utilization > 50 ? "text-amber-600" : "text-emerald-600"
                                                                )}>
                                                                    {utilization.toFixed(1)}%
                                                                    <span className="text-[9px] font-normal text-slate-400 ml-1">
                                                                        {utilization > 80 ? "High" : utilization > 50 ? "Moderate" : "Healthy"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Risk Level</div>
                                                                <div className={cn("text-xs font-black", statusInfo.color)}>
                                                                    {['No Risk', 'Low Risk', 'Medium Risk', 'High Risk', 'Very High Risk', 'Critical'][statusInfo.severity] || statusInfo.label}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">History Length</div>
                                                                <div className="text-xs font-semibold text-slate-700">
                                                                    {parsePaymentHistory(acc.paymentStatus).length} months recorded
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Real payment history from paymentStatus */}
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Activity className="h-3 w-3" />
                                                                Monthly Payment History
                                                                <span className="text-slate-300 font-normal normal-case tracking-normal">(each block = 1 month, hover for details)</span>
                                                            </div>
                                                            <PaymentTrendBar status={acc.paymentStatus} />
                                                        </div>
                                                    </motion.div>
                                                </TableCell>
                                            </TableRow>
                                        )}
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
                </div>
            </Card>

            {/* AI Analysis Accordion */}
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
