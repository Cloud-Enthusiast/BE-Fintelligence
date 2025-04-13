
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { calculateEligibility } from '@/utils/eligibilityCalculator';

interface FormData {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
  annualRevenue: number;
  monthlyIncome: number;
  existingLoanAmount: number;
  loanAmount: number;
  loanTerm: number;
  creditScore: number;
}

interface TempInputValues {
  annualRevenue: string;
  monthlyIncome: string;
  existingLoanAmount: string;
  loanAmount: string;
  loanTerm: string;
  creditScore: string;
}

interface EligibilityResult {
  eligible: boolean;
  score: number;
  reason?: string;
}

export const useEligibilityForm = (onComplete?: () => void) => {
  const { toast } = useToast();
  const { addApplication } = useApplications();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    businessType: '',
    annualRevenue: 2400000, // 12 * monthly income
    monthlyIncome: 200000,
    existingLoanAmount: 1000000,
    loanAmount: 2500000,
    loanTerm: 36,
    creditScore: 750
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  
  // Store temporary input values as strings to avoid input issues
  const [tempInputValues, setTempInputValues] = useState<TempInputValues>({
    annualRevenue: formData.annualRevenue.toString(),
    monthlyIncome: formData.monthlyIncome.toString(),
    existingLoanAmount: formData.existingLoanAmount.toString(),
    loanAmount: formData.loanAmount.toString(),
    loanTerm: formData.loanTerm.toString(),
    creditScore: formData.creditScore.toString()
  });

  // Update annual revenue when monthly income changes
  useEffect(() => {
    const annualRevenue = formData.monthlyIncome * 12;
    setFormData(prev => ({
      ...prev,
      annualRevenue
    }));
    setTempInputValues(prev => ({
      ...prev,
      annualRevenue: annualRevenue.toString()
    }));
  }, [formData.monthlyIncome]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Improved numeric input handler that works with the tempInputValues
  const handleNumericInputChange = (name: string, value: string, min: number, max: number) => {
    // Store the raw string value for display
    setTempInputValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only update the formData with numeric value when it's a valid number
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: 0 }));
      return;
    }
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };
  
  // Handle blur event to apply min/max constraints
  const handleInputBlur = (name: string, min: number, max: number) => {
    const value = tempInputValues[name as keyof typeof tempInputValues];
    if (value === '') {
      // If empty on blur, reset to minimum value
      setTempInputValues(prev => ({
        ...prev,
        [name]: min.toString()
      }));
      setFormData(prev => ({
        ...prev,
        [name]: min
      }));
      return;
    }
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      setTempInputValues(prev => ({
        ...prev,
        [name]: clampedValue.toString()
      }));
      setFormData(prev => ({
        ...prev,
        [name]: clampedValue
      }));
    }
  };

  const handleSliderChange = (name: string, value: number[]) => {
    const newValue = value[0];
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Update the temp input value to match the slider
    setTempInputValues(prev => ({
      ...prev,
      [name]: newValue.toString()
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const eligibilityResult = calculateEligibility(formData);
      setResult(eligibilityResult);
      setIsSubmitting(false);
      setCurrentStep(4);
    }, 1500);
  };
  
  const handleGoBack = () => {
    setCurrentStep(3);
    setResult(null);
  };

  const handleSaveToDatabase = async () => {
    if (!result) return;
    
    setIsSavingToDatabase(true);
    
    try {
      // Save the assessment data to Supabase
      try {
        const assessmentData = {
          applicant_id: user?.id || null, // Link to the logged-in user if available
          business_name: formData.businessName,
          monthly_income: formData.monthlyIncome,
          annual_revenue: formData.annualRevenue,
          existing_loan_amount: formData.existingLoanAmount,
          credit_score: formData.creditScore,
          requested_loan_amount: formData.loanAmount,
          requested_loan_term_months: formData.loanTerm,
          business_type: formData.businessType,
          eligibility_score: result.score,
          is_eligible: result.eligible,
          ineligibility_reason: result.reason || null,
          assessment_status: 'completed' // Mark assessment as completed
        };

        // Insert the data into the loan_eligibility_assessments table
        const { error } = await supabase
          .from('loan_eligibility_assessments')
          .insert(assessmentData);

        if (error) {
          console.error("Supabase error saving assessment:", error);
          throw error; // Re-throw the error to be caught by the outer catch block
        }

        toast({
          title: "Assessment Saved",
          description: "Your eligibility assessment has been saved.",
        });

        // Call onComplete if provided (e.g., to navigate)
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        // Log the error and show a generic failure message
        console.error("Error saving assessment:", error);
        toast({
          title: "Save Failed",
          description: "There was a problem saving your assessment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // This catch block is now primarily for handling errors from the try block above
      // or potential future logic outside the Supabase call.
      // The specific Supabase error handling is inside the inner try/catch.
      console.error("Error during save process:", error);
      // Ensure isSavingToDatabase is reset even if outer logic fails
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  return {
    formData,
    tempInputValues,
    currentStep,
    isSubmitting,
    isSavingToDatabase,
    result,
    handleChange,
    handleNumericInputChange,
    handleInputBlur,
    handleSliderChange,
    handleSelectChange,
    nextStep,
    prevStep,
    handleSubmit,
    handleGoBack,
    handleSaveToDatabase
  };
};
