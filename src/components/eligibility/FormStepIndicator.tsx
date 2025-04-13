
import React from 'react';

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const FormStepIndicator = ({ currentStep, totalSteps = 3 }: FormStepIndicatorProps) => {
  // Define stage names for each step
  const stageNames = [
    'Business Information',
    'Financial Details',
    'Loan Requirements'
  ];

  return (
    <div className="flex flex-col space-y-6 mb-8">
      <div className="flex items-center justify-between w-full px-2">
        {stageNames.map((stageName, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <div 
              key={step} 
              className={`flex flex-col items-center ${
                isCompleted ? 'text-finance-600' : 
                isActive ? 'text-finance-800' : 'text-gray-300'
              }`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2
                  ${
                    isCompleted ? 'bg-finance-600 border-finance-600 text-white' : 
                    isActive ? 'border-finance-600 text-finance-800' : 'border-gray-300 text-gray-400'
                  }`}
              >
                {/* Check mark for completed steps, stage number for others */}
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : step}
              </div>
              <span className={`text-sm font-medium text-center ${
                isActive ? 'text-finance-800' : 
                isCompleted ? 'text-finance-600' : 'text-gray-400'
              }`}>
                {`Stage ${step}: ${stageName}`}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar connecting the circles */}
      <div className="relative w-full h-1 bg-gray-200 rounded-full">
        <div 
          className="absolute top-0 left-0 h-1 bg-finance-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FormStepIndicator;
