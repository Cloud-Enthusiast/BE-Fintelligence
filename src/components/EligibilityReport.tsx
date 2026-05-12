import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useDocumentEligibility, EligibilityParams } from '@/hooks/useDocumentEligibility';
import { cn } from '@/lib/utils';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Info,
  AlertCircle,
} from 'lucide-react';

interface EligibilityReportProps {
  onOpenFullAssessment?: (params: EligibilityParams & { creditScore: number; annualRevenue: number }) => void;
}

const BUSINESS_TYPES = [
  'Technology', 'Services', 'Manufacturing', 'Trading', 'Retail',
  'Agriculture', 'Construction', 'Food & Beverage', 'Health & Beauty',
  'Logistics', 'Real Estate', 'Marketing',
];

const LOAN_TERM_OPTIONS = [
  { label: '12 months (1 yr)', value: 12 },
  { label: '24 months (2 yr)', value: 24 },
  { label: '36 months (3 yr)', value: 36 },
  { label: '48 months (4 yr)', value: 48 },
  { label: '60 months (5 yr)', value: 60 },
  { label: '84 months (7 yr)', value: 84 },
  { label: '120 months (10 yr)', value: 120 },
  { label: '180 months (15 yr)', value: 180 },
  { label: '240 months (20 yr)', value: 240 },
];

function formatINR(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function cibilColor(score: number) {
  if (score >= 750) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excellent' };
  if (score >= 700) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Good' };
  if (score >= 650) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Fair' };
  if (score >= 600) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Below Average' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Poor' };
}

function verdictConfig(isEligible: boolean, score: number) {
  if (!isEligible) return {
    label: 'Reject',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-200',
    badgeVariant: 'destructive' as const,
  };
  if (score >= 75) return {
    label: 'Approve',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'ring-emerald-200',
    badgeVariant: 'default' as const,
  };
  return {
    label: 'Manual Review',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-200',
    badgeVariant: 'secondary' as const,
  };
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className="text-sm font-semibold tabular-nums">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

const EligibilityReport = ({ onOpenFullAssessment }: EligibilityReportProps) => {
  const [params, setParams] = useState<EligibilityParams>({
    loanAmount: 2_500_000,
    loanType: 'working_capital',
    businessType: 'Trading',
    loanTerm: 36,
  });

  const [loanAmountInput, setLoanAmountInput] = useState('25');

  const { eligibility, riskScore, isReady, missingDocs, extractedInputs } = useDocumentEligibility(params);

  const updateLoanAmount = (lakhs: string) => {
    setLoanAmountInput(lakhs);
    const val = parseFloat(lakhs);
    if (!isNaN(val) && val > 0) {
      setParams(p => ({ ...p, loanAmount: val * 100_000 }));
    }
  };

  if (!isReady) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="py-8 text-center space-y-2">
          <Zap className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-medium text-slate-500">Eligibility Assessment</p>
          <p className="text-sm text-muted-foreground">
            Upload{' '}
            {missingDocs.length === 2
              ? 'a CIBIL Report and Bank Statement'
              : missingDocs[0]}
            {' '}to auto-generate the loan eligibility verdict.
          </p>
        </CardContent>
      </Card>
    );
  }

  const verdict = verdictConfig(eligibility!.isEligible, eligibility!.overallScore);
  const VerdictIcon = verdict.icon;
  const cibil = cibilColor(extractedInputs.creditScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              Loan Eligibility Assessment
            </CardTitle>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
              AI-Powered
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Auto-calculated from extracted documents
            {missingDocs.length > 0 && (
              <span className="text-amber-600">
                {' '}· Missing: {missingDocs.join(', ')} (using defaults)
              </span>
            )}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ── Parameters ─────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Loan Amount (₹ Lakhs)</Label>
              <Input
                type="number"
                min={1}
                value={loanAmountInput}
                onChange={e => updateLoanAmount(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Loan Type</Label>
              <Select
                value={params.loanType}
                onValueChange={v => setParams(p => ({ ...p, loanType: v as EligibilityParams['loanType'] }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working_capital">Working Capital</SelectItem>
                  <SelectItem value="business_loan">Business Loan</SelectItem>
                  <SelectItem value="home_loan">Home Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Business Type</Label>
              <Select
                value={params.businessType}
                onValueChange={v => setParams(p => ({ ...p, businessType: v }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Loan Term</Label>
              <Select
                value={String(params.loanTerm)}
                onValueChange={v => setParams(p => ({ ...p, loanTerm: parseInt(v) }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TERM_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Main verdict + CIBIL ────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Verdict */}
            <div className={cn(
              'col-span-1 rounded-xl border-2 p-5 flex flex-col items-center justify-center gap-3 text-center',
              verdict.border, verdict.bg,
            )}>
              <VerdictIcon className={cn('h-10 w-10', verdict.color)} />
              <div>
                <p className={cn('text-2xl font-bold', verdict.color)}>{verdict.label}</p>
                <p className="text-sm text-muted-foreground mt-1">Recommendation</p>
              </div>
              <div className={cn(
                'text-4xl font-black tabular-nums ring-4 rounded-full h-20 w-20 flex items-center justify-center',
                verdict.color, verdict.ring, verdict.bg,
              )}>
                {eligibility!.overallScore}
              </div>
              <p className="text-xs text-muted-foreground">Overall Score / 100</p>
            </div>

            {/* CIBIL + bank snapshot */}
            <div className="col-span-2 space-y-3">
              {/* CIBIL score */}
              <div className={cn('flex items-center justify-between rounded-lg border p-3', cibil.border, cibil.bg)}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className={cn('h-5 w-5', cibil.text)} />
                  <div>
                    <p className="text-sm font-medium">CIBIL Score</p>
                    {extractedInputs.creditScore === 0 && (
                      <p className="text-xs text-muted-foreground">Not extracted — using default 700</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('text-2xl font-black tabular-nums', cibil.text)}>
                    {extractedInputs.creditScore || '—'}
                  </p>
                  <Badge className={cn('text-xs', cibil.text, cibil.bg, cibil.border)} variant="outline">
                    {cibil.label}
                  </Badge>
                </div>
              </div>

              {/* Bank health */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <Landmark className="h-4 w-4 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Avg Monthly Balance</p>
                    <p className="text-sm font-semibold truncate">
                      {extractedInputs.avgMonthlyBalance > 0
                        ? formatINR(extractedInputs.avgMonthlyBalance)
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  extractedInputs.chequeBounces > 3
                    ? 'border-red-200 bg-red-50'
                    : extractedInputs.chequeBounces > 0
                      ? 'border-amber-100 bg-amber-50'
                      : 'border-slate-100 bg-slate-50',
                )}>
                  <AlertCircle className={cn(
                    'h-4 w-4 shrink-0',
                    extractedInputs.chequeBounces > 3 ? 'text-red-500'
                      : extractedInputs.chequeBounces > 0 ? 'text-amber-500'
                      : 'text-slate-400',
                  )} />
                  <div>
                    <p className="text-xs text-muted-foreground">Bounces / Returns</p>
                    <p className="text-sm font-semibold">{extractedInputs.chequeBounces}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <TrendingUp className="h-4 w-4 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Cash Flow</p>
                    <p className={cn(
                      'text-sm font-semibold capitalize',
                      extractedInputs.cashFlowPattern === 'positive' ? 'text-emerald-600'
                        : extractedInputs.cashFlowPattern === 'negative' ? 'text-red-600'
                        : 'text-amber-600',
                    )}>
                      {extractedInputs.cashFlowPattern}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <Info className="h-4 w-4 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Annual Revenue (est.)</p>
                    <p className="text-sm font-semibold truncate">
                      {extractedInputs.annualRevenue > 0 ? formatINR(extractedInputs.annualRevenue) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Max eligible / note */}
              {eligibility!.eligibilityNote && (
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-primary/80">{eligibility!.eligibilityNote}</p>
                </div>
              )}
              {eligibility!.rejectionReason && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-700">{eligibility!.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Score breakdown ─────────────────────────── */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Score Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ScoreBar label="Debt Service Coverage (DSCR)" score={eligibility!.breakdown.dscrScore} icon={TrendingUp} />
              <ScoreBar label="Current Ratio" score={eligibility!.breakdown.currentRatioScore} icon={Info} />
              <ScoreBar label="Revenue Growth" score={eligibility!.breakdown.revenueGrowthScore} icon={TrendingUp} />
              <ScoreBar label="GST Compliance" score={eligibility!.breakdown.gstComplianceScore} icon={CheckCircle2} />
              <ScoreBar label="Banking Relationship" score={eligibility!.breakdown.bankingRelationshipScore} icon={Landmark} />
              <ScoreBar label="Industry Risk" score={eligibility!.breakdown.industryRiskScore} icon={ShieldCheck} />
            </div>
          </div>

          {/* ── Risk flags ──────────────────────────────── */}
          {riskScore && riskScore.flags.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Risk Flags
                  <Badge variant="outline" className="ml-2 text-xs">{riskScore.flags.length}</Badge>
                </h4>
                <div className="space-y-2">
                  {riskScore.flags.map(flag => (
                    <div
                      key={flag.id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 text-sm',
                        flag.type === 'critical' ? 'border-red-200 bg-red-50' :
                        flag.type === 'warning' ? 'border-amber-100 bg-amber-50' :
                        'border-blue-100 bg-blue-50',
                      )}
                    >
                      {flag.type === 'critical' ? (
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      ) : flag.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className={cn(
                          'font-medium',
                          flag.type === 'critical' ? 'text-red-700' :
                          flag.type === 'warning' ? 'text-amber-700' :
                          'text-blue-700',
                        )}>
                          {flag.title}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">{flag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── CTA ─────────────────────────────────────── */}
          {onOpenFullAssessment && (
            <Button
              className="w-full"
              onClick={() => onOpenFullAssessment({
                ...params,
                creditScore: extractedInputs.creditScore,
                annualRevenue: extractedInputs.annualRevenue,
              })}
            >
              Open Full Assessment Form
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EligibilityReport;
