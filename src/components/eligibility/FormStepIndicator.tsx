
import React from 'react';

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const FormStepIndicator = ({ currentStep, totalSteps = 3 }: FormStepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        return (
          <div 
            key={step} 
            className={`flex items-center ${step < currentStep ? 'text-finance-600' : step === currentStep ? 'text-finance-800' : 'text-gray-300'}`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step < currentStep ? 'bg-finance-600 border-finance-600 text-white' : step === currentStep ? 'border-finance-600 text-finance-800' : 'border-gray-300 text-gray-400'}`}
            >
              {step}
            </div>
            {step < totalSteps && <div className={`w-10 h-0.5 ml-2 ${step < currentStep ? 'bg-finance-600' : 'bg-gray-300'}`} />}
          </div>
        );
      })}
    </div>
  );
};

export default FormStepIndicator;
