
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';

interface FormFooterProps {
  currentStep: number;
  isSubmitting: boolean;
  isSavingToDatabase: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FormFooter = ({
  currentStep,
  isSubmitting,
  isSavingToDatabase,
  onPrevious,
  onNext,
  onSubmit
}: FormFooterProps) => {
  return (
    <div className="flex justify-between w-full">
      {currentStep > 1 && currentStep < 4 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious} 
          className="border-finance-200 text-finance-700 hover:bg-finance-50"
        >
          Previous
        </Button>
      )}
      
      {currentStep < 3 && (
        <Button 
          type="button" 
          onClick={onNext} 
          className="ml-auto bg-finance-600 hover:bg-finance-700 text-white"
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      )}
      
      {currentStep === 3 && (
        <Button 
          type="submit" 
          onClick={onSubmit} 
          className={`ml-auto ${isSubmitting ? 'bg-finance-400 cursor-not-allowed' : 'bg-finance-600 hover:bg-finance-700'} text-white`} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Check Eligibility'}
          {!isSubmitting && <ChevronRightIcon className="ml-2 h-4 w-4" />}
        </Button>
      )}
      
      {currentStep === 4 && isSavingToDatabase && (
        <div className="ml-auto text-finance-600">
          Submitting application...
        </div>
      )}
    </div>
  );
};

export default FormFooter;
