import { useState, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FormStepIndicator from './eligibility/FormStepIndicator';
import FormStep1 from './eligibility/FormStep1';
import FormStep2 from './eligibility/FormStep2';
import FormStep3 from './eligibility/FormStep3';
import EligibilityResult from './eligibility/EligibilityResult';
import { calculateEligibility } from '@/utils/eligibilityCalculator';

interface EligibilityFormProps {
  onComplete?: () => void;
}

const EligibilityForm = ({
  onComplete
}: EligibilityFormProps) => {
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    businessType: '',
    annualRevenue: 2500000,
    monthlyIncome: 200000,
    existingLoanAmount: 1000000,
    loanAmount: 2500000,
    loanTerm: 36,
    creditScore: 750
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    eligible: boolean;
    score: number;
    reason?: string;
  }>(null);
  
  // Store temporary input values as strings to avoid input issues
  const [tempInputValues, setTempInputValues] = useState({
    annualRevenue: formData.annualRevenue.toString(),
    monthlyIncome: formData.monthlyIncome.toString(),
    existingLoanAmount: formData.existingLoanAmount.toString(),
    loanAmount: formData.loanAmount.toString(),
    loanTerm: formData.loanTerm.toString(),
    creditScore: formData.creditScore.toString()
  });

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
      // Clamp the value only when user finishes typing and blurs the field
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
        
        <form onSubmit={handleSubmit}>
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
          
          {currentStep === 4 && result && (
            <EligibilityResult 
              result={result} 
              onComplete={onComplete}
              onGoBack={handleGoBack} 
            />
          )}
        </form>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 bg-gray-50 p-6">
        <div className="flex justify-between w-full">
          {currentStep > 1 && currentStep < 4 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              className="border-finance-200 text-finance-700 hover:bg-finance-50"
            >
              Previous
            </Button>
          )}
          {currentStep < 3 && (
            <Button 
              type="button" 
              onClick={nextStep} 
              className="ml-auto bg-finance-600 hover:bg-finance-700 text-white"
            >
              Next
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === 3 && (
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              className={`ml-auto ${isSubmitting ? 'bg-finance-400 cursor-not-allowed' : 'bg-finance-600 hover:bg-finance-700'} text-white`} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Check Eligibility'}
              {!isSubmitting && <ChevronRightIcon className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EligibilityForm;
