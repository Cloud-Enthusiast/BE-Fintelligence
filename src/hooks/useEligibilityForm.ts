import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';

export interface EligibilityFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  
  // Business Information
  businessName: string;
  businessType: string;
  annualRevenue: number;
  monthlyIncome: number;
  existingLoanAmount: number;
  
  // Loan Information
  loanAmount: number;
  loanTerm: number;
  creditScore: number;
}

export const useEligibilityForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addApplication } = useApplications();
  
  const [formData, setFormData] = useState<EligibilityFormData>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    annualRevenue: 0,
    monthlyIncome: 0,
    existingLoanAmount: 0,
    loanAmount: 0,
    loanTerm: 12,
    creditScore: 600,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.username || '',
      }));
    }
  }, [user]);

  const updateFormData = (field: keyof EligibilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateEligibility = (data: EligibilityFormData) => {
    // Simple eligibility calculation
    let score = 0;
    let reasons: string[] = [];

    // Credit score factor (40% weight)
    if (data.creditScore >= 750) {
      score += 40;
    } else if (data.creditScore >= 700) {
      score += 35;
    } else if (data.creditScore >= 650) {
      score += 25;
    } else if (data.creditScore >= 600) {
      score += 15;
    } else {
      score += 5;
      reasons.push('Low credit score');
    }

    // Debt-to-income ratio (30% weight)
    const monthlyLoanPayment = data.loanAmount / data.loanTerm;
    const existingMonthlyPayment = data.existingLoanAmount / 60; // Assume 5-year term for existing loans
    const totalMonthlyDebt = monthlyLoanPayment + existingMonthlyPayment;
    const debtToIncomeRatio = totalMonthlyDebt / data.monthlyIncome;

    if (debtToIncomeRatio <= 0.3) {
      score += 30;
    } else if (debtToIncomeRatio <= 0.4) {
      score += 25;
    } else if (debtToIncomeRatio <= 0.5) {
      score += 15;
    } else {
      score += 5;
      reasons.push('High debt-to-income ratio');
    }

    // Revenue factor (20% weight)
    if (data.annualRevenue >= 1000000) {
      score += 20;
    } else if (data.annualRevenue >= 500000) {
      score += 15;
    } else if (data.annualRevenue >= 250000) {
      score += 10;
    } else {
      score += 5;
      reasons.push('Low annual revenue');
    }

    // Loan amount factor (10% weight)
    const loanToRevenueRatio = data.loanAmount / data.annualRevenue;
    if (loanToRevenueRatio <= 0.5) {
      score += 10;
    } else if (loanToRevenueRatio <= 0.75) {
      score += 7;
    } else if (loanToRevenueRatio <= 1.0) {
      score += 5;
    } else {
      score += 2;
      reasons.push('High loan-to-revenue ratio');
    }

    const isEligible = score >= 70;
    const rejectionReason = !isEligible ? reasons.join(', ') : undefined;

    return {
      eligibilityScore: Math.round(score),
      isEligible,
      rejectionReason,
      recommendations: isEligible 
        ? ['Consider our premium loan products', 'Fast-track approval available']
        : ['Improve credit score', 'Reduce existing debt', 'Increase revenue']
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate eligibility
      const result = calculateEligibility(formData);
      setEligibilityResult(result);

      // Add to applications
      addApplication({
        ...formData,
        eligibilityScore: result.eligibilityScore,
        isEligible: result.isEligible,
        rejectionReason: result.rejectionReason,
      });

      toast({
        title: "Application submitted successfully",
        description: `Your eligibility score is ${result.eligibilityScore}%`,
      });

      return result;
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.username || '',
      phone: '',
      businessName: '',
      businessType: '',
      annualRevenue: 0,
      monthlyIncome: 0,
      existingLoanAmount: 0,
      loanAmount: 0,
      loanTerm: 12,
      creditScore: 600,
    });
    setCurrentStep(1);
    setEligibilityResult(null);
  };

  return {
    formData,
    currentStep,
    isSubmitting,
    eligibilityResult,
    updateFormData,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
  };
};