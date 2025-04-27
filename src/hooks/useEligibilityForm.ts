
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
    if (!result || !user?.id) {
      toast({
        title: "Error",
        description: "User not logged in or eligibility not calculated.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingToDatabase(true);
    let applicantIdForAssessment: string | null = null;

    try {
      // Step 1: Check if applicant exists in 'loan_applicants' table
      const { data: existingApplicant, error: fetchError } = await supabase
        .from('customer_information')
        .select('id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is okay here
        console.error("Error fetching applicant:", fetchError);
        throw new Error("Failed to check for existing applicant.");
      }

      // Step 2: If applicant doesn't exist, create them
      if (!existingApplicant) {
        console.log(`Applicant with ID ${user.id} not found in customer_information. Creating...`);
        // Extract first/last name if possible from formData.fullName
        const nameParts = formData.fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newApplicant, error: createError } = await supabase
          .from('customer_information')
          .insert({
            id: user.id, // Use the auth user ID
            first_name: firstName,
            last_name: lastName,
            email: formData.email || user.username, // Use form email or auth email
            phone_number: formData.phone || null,
            // Add other relevant fields from formData if needed and available in loan_applicants table
          })
          .select('id') // Select the ID to confirm creation
          .single(); // Expect a single result after creation

        if (createError) {
          console.error("Error creating applicant:", createError);
          throw new Error("Failed to create applicant record.");
        }
        
        if (!newApplicant) {
           throw new Error("Applicant record creation did not return expected data.");
        }
        
        console.log(`Applicant created successfully with ID: ${newApplicant.id}`);
        applicantIdForAssessment = newApplicant.id;
      } else {
        console.log(`Existing applicant found with ID: ${existingApplicant.id}`);
        applicantIdForAssessment = existingApplicant.id;
      }

      // Ensure we have an applicant ID before proceeding
      if (!applicantIdForAssessment) {
        throw new Error("Could not determine applicant ID for assessment.");
      }

      // Step 3: Insert the assessment data into 'Loan_applicants' table
      const assessmentData = {
        applicant_id: applicantIdForAssessment, // Use the verified/created ID
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
        assessment_status: 'completed'
      };

      const { error: insertAssessmentError } = await supabase
        .from('Loan_applicants') // Uppercase L
        .insert(assessmentData);

      if (insertAssessmentError) {
        console.error("Supabase error saving assessment:", insertAssessmentError);
        // Provide more specific feedback based on the error if possible
        if (insertAssessmentError.code === '23503') { // Foreign key violation (shouldn't happen now but good to check)
           throw new Error(`Foreign key violation: ${insertAssessmentError.details || insertAssessmentError.message}`);
        }
        throw new Error(`Failed to save assessment: ${insertAssessmentError.message}`);
      }

      toast({
        title: "Assessment Saved",
        description: "Your eligibility assessment has been saved.",
      });

      if (onComplete) {
        onComplete();
      }

    } catch (error: any) {
      console.error("Error during save process:", error);
      toast({
        title: "Save Failed",
        description: error.message || "There was a problem saving your assessment. Please try again.",
        variant: "destructive",
      });
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
