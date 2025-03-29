
interface LoanDetails {
  annualRevenue: number;
  monthlyIncome: number;
  existingLoanAmount: number;
  loanAmount: number;
  loanTerm: number;
  creditScore: number;
}

interface EligibilityResult {
  eligible: boolean;
  score: number;
  reason?: string;
}

/**
 * Calculate loan eligibility based on the provided details
 */
export const calculateEligibility = (formData: LoanDetails): EligibilityResult => {
  const monthlyRevenue = formData.annualRevenue / 12;
  const monthlyLoanPayment = formData.loanAmount / formData.loanTerm;
  const existingMonthlyPayment = formData.existingLoanAmount / 12; // Simple estimate
  const totalMonthlyPayment = monthlyLoanPayment + existingMonthlyPayment;
  const debtToIncomeRatio = totalMonthlyPayment / formData.monthlyIncome;
  const revenueCoverage = monthlyRevenue / monthlyLoanPayment;
  
  // Check if eligible - credit score >= 700, debt-to-income ratio <= 0.4, and revenue covers loan at least 2x
  const isEligible = formData.creditScore >= 700 && debtToIncomeRatio <= 0.4 && revenueCoverage >= 2;
  
  // Calculate score based on updated criteria (credit score out of 900)
  const score = Math.min(
    Math.round(
      formData.creditScore / 900 * 0.4 * 100 + 
      (1 - debtToIncomeRatio) * 0.3 * 100 + 
      Math.min(revenueCoverage / 5, 1) * 0.3 * 100
    ), 
    100
  );
  
  let reason;
  if (!isEligible) {
    if (formData.creditScore < 700) reason = "Credit score below required threshold of 700";
    else if (debtToIncomeRatio > 0.4) reason = "Debt-to-income ratio above 40%";
    else reason = "Insufficient revenue to support repayment";
  }
  
  return {
    eligible: isEligible,
    score,
    reason
  };
};
