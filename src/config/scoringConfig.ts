/**
 * Centralised scoring configuration.
 *
 * All threshold values used across risk assessment, eligibility scoring,
 * analytics and UI colour-coding live here — never inline in components.
 * Import what you need; the object is `as const` so values are narrowed.
 */

export const SCORING_CONFIG = {
  /** CIBIL credit score colour bands */
  cibil: {
    /** Score ≥ excellent → green  */
    excellent: 720,
    /** Score ≥ good → amber       */
    good: 650,
    /** Score < good → red         */
  },

  /** Eligibility / financial risk score bands (0–100 scale) */
  risk: {
    /** Score ≥ low → green (low risk) */
    low: 80,
    /** Score ≥ medium → amber          */
    medium: 60,
    /** Score < medium → red (high risk) */
  },

  /** Loan amount distribution buckets (INR) used in Analytics charts */
  loanAmountBuckets: [
    { label: '<₹10L',      max: 100_000 },
    { label: '₹10L-₹25L', max: 250_000 },
    { label: '₹25L-₹50L', max: 500_000 },
    { label: '₹50L-₹1Cr', max: 1_000_000 },
    { label: '>₹1Cr',     max: Infinity },
  ] as const,

  /** Debt-to-income ratio thresholds (percentage) */
  debtToIncome: {
    /** Below ideal → green */
    ideal: 40,
    /** Below warning → amber */
    warning: 45,
  },

  /**
   * Loan amounts above this figure (INR) trigger an extra scrutiny flag
   * in the risk engine.  ₹50 lakhs.
   */
  largeLoanThreshold: 5_000_000,

  /** Eligibility score bands used by LoanEligibilityForm UI labels */
  eligibility: {
    /** Score ≥ high → "High Eligibility" badge */
    high: 70,
    /** Score ≥ medium → "Medium Eligibility" badge */
    medium: 40,
  },
} as const;

// ─── Derived helpers ─────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

/** Map an eligibility/risk score (0–100) to a RiskLevel using the config */
export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= SCORING_CONFIG.risk.low) return 'low';
  if (score >= SCORING_CONFIG.risk.medium) return 'medium';
  return 'high';
};

/** CSS class string for a CIBIL score badge */
export const getCibilColorClass = (score: number): string => {
  if (score >= SCORING_CONFIG.cibil.excellent)
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= SCORING_CONFIG.cibil.good)
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-destructive/10 text-destructive border-destructive/20';
};

/** Tailwind text colour class for a risk/eligibility score */
export const getRiskTextColor = (score: number): string => {
  if (score >= SCORING_CONFIG.risk.low) return 'text-green-600';
  if (score >= SCORING_CONFIG.risk.medium) return 'text-yellow-600';
  return 'text-red-600';
};

/** Tailwind bg colour class for a progress bar */
export const getRiskBgColor = (score: number): string => {
  if (score >= SCORING_CONFIG.risk.low) return 'bg-green-500';
  if (score >= SCORING_CONFIG.risk.medium) return 'bg-yellow-500';
  return 'bg-red-500';
};
