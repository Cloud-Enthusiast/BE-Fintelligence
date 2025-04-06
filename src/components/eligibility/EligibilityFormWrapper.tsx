
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEligibilityForm } from '@/hooks/useEligibilityForm';
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
  } = useEligibilityForm(onComplete);

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
              onSubmit={handleSaveToDatabase}
            />
          )}
        </form>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 bg-gray-50 p-6">
        <FormFooter 
          currentStep={currentStep} 
          isSubmitting={isSubmitting}
          isSavingToDatabase={isSavingToDatabase}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default EligibilityFormWrapper;
