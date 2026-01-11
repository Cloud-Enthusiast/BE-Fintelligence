import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEligibilityForm, EligibilityFormData } from '@/hooks/useEligibilityForm';
import FormStepIndicator from './FormStepIndicator';
import FormStep1 from './FormStep1';
import FormStep2 from './FormStep2';
import FormStep3 from './FormStep3';
import EligibilityResult from './EligibilityResult';
import FormFooter from './FormFooter';

interface EligibilityFormProps {
  onComplete?: () => void;
}

const EligibilityFormWrapper = ({
  onComplete
}: EligibilityFormProps) => {
  const {
    formData,
    currentStep,
    isSubmitting,
    eligibilityResult,
    updateFormData,
    nextStep,
    prevStep,
    handleSubmit,
    resetForm,
  } = useEligibilityForm();

  // Temp input values for text inputs (strings for display)
  const [tempInputValues, setTempInputValues] = React.useState({
    annualRevenue: String(formData.annualRevenue),
    monthlyIncome: String(formData.monthlyIncome),
    existingLoanAmount: String(formData.existingLoanAmount),
    creditScore: String(formData.creditScore),
    loanAmount: String(formData.loanAmount),
    loanTerm: String(formData.loanTerm),
  });

  // Sync temp values when formData changes
  React.useEffect(() => {
    setTempInputValues({
      annualRevenue: String(formData.annualRevenue),
      monthlyIncome: String(formData.monthlyIncome),
      existingLoanAmount: String(formData.existingLoanAmount),
      creditScore: String(formData.creditScore),
      loanAmount: String(formData.loanAmount),
      loanTerm: String(formData.loanTerm),
    });
  }, [formData]);

  // Handler for FormStep1 (text inputs with ChangeEvent)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData(name as keyof EligibilityFormData, value);
  };

  // Handler for slider changes
  const handleSliderChange = (name: string, values: number[]) => {
    updateFormData(name as keyof EligibilityFormData, values[0]);
  };

  // Handler for numeric input changes (string value)
  const handleNumericInputChange = (name: string, value: string, min: number, max: number) => {
    setTempInputValues(prev => ({ ...prev, [name]: value }));
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      updateFormData(name as keyof EligibilityFormData, numValue);
    }
  };

  // Handler for input blur (commit value)
  const handleInputBlur = (name: string, min: number, max: number) => {
    const value = tempInputValues[name as keyof typeof tempInputValues];
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min) {
      updateFormData(name as keyof EligibilityFormData, min);
    } else if (numValue > max) {
      updateFormData(name as keyof EligibilityFormData, max);
    }
  };

  // Handler for select changes
  const handleSelectChange = (name: string, value: string) => {
    updateFormData(name as keyof EligibilityFormData, value);
  };

  const handleGoBack = () => {
    resetForm();
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = await handleSubmit();
    if (result && onComplete) {
      onComplete();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
      <CardHeader className="bg-finance-50 border-b border-gray-200">
        <CardTitle className="text-2xl text-finance-800">Commercial Loan Eligibility Assessment</CardTitle>
        <CardDescription className="text-finance-600">
          Complete the form to check your business loan eligibility
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {currentStep < 4 && <FormStepIndicator currentStep={currentStep} />}
        
        <form onSubmit={handleFormSubmit}>
          {currentStep === 1 && (
            <FormStep1 
              formData={formData}
              onChange={handleChange}
            />
          )}
          
          {currentStep === 2 && (
            <FormStep2 
              formData={formData}
              tempInputValues={tempInputValues}
              handleSliderChange={handleSliderChange}
              handleNumericInputChange={handleNumericInputChange}
              handleInputBlur={handleInputBlur}
            />
          )}
          
          {currentStep === 3 && (
            <FormStep3 
              formData={formData}
              tempInputValues={tempInputValues}
              handleSliderChange={handleSliderChange}
              handleNumericInputChange={handleNumericInputChange}
              handleInputBlur={handleInputBlur}
              handleSelectChange={handleSelectChange}
            />
          )}
          
          {currentStep === 4 && eligibilityResult && (
            <EligibilityResult 
              result={eligibilityResult} 
              onComplete={onComplete}
              onGoBack={handleGoBack}
              onSubmit={handleFormSubmit}
            />
          )}
        </form>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 bg-gray-50 p-6">
        <FormFooter 
          currentStep={currentStep} 
          isSubmitting={isSubmitting}
          isSavingToDatabase={false}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={handleFormSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default EligibilityFormWrapper;
