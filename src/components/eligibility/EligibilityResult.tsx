
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EligibilityResultProps {
  result: {
    eligible: boolean;
    score: number;
    reason?: string;
  };
  onComplete?: () => void;
  onGoBack?: () => void;
  onSubmit?: () => void;
}

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const EligibilityResult = ({ result, onComplete, onGoBack, onSubmit }: EligibilityResultProps) => {
  const minEligibleScore = 70; // Minimum eligible score is 70

  return (
    <motion.div className="space-y-8 py-4 relative" variants={containerVariants} initial="hidden" animate="visible">
      {/* Gold decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-[2px] bg-gradient-to-l from-gold-300 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-24 h-[2px] bg-gradient-to-r from-gold-300 to-transparent"></div>
      
      <motion.div 
        variants={itemVariants} 
        className={`text-center p-6 rounded-lg relative overflow-hidden ${result.eligible ? 'bg-green-50 border-2 border-green-100' : 'bg-red-50 border-2 border-red-100'}`}
      >
        {/* Gold corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className={`absolute top-0 right-0 w-8 h-8 bg-gold-300 rotate-45 transform origin-bottom-left opacity-80`}></div>
        </div>
        
        <h3 className={`text-2xl font-semibold mb-2 ${result.eligible ? 'text-green-700' : 'text-red-700'}`}>
          {result.eligible ? 'Congratulations!' : 'We apologize'}
        </h3>
        <p className={`text-lg ${result.eligible ? 'text-green-600' : 'text-red-600'}`}>
          {result.eligible 
            ? 'Your business is eligible for the loan!' 
            : 'Your business does not meet the eligibility criteria at this time.'
          }
        </p>
        {!result.eligible && result.reason && <p className="mt-2 text-red-500">{result.reason}</p>}
      </motion.div>
      
      <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Eligibility Score</h4>
          <div className="text-sm flex items-center">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-gold-300 rounded-full mr-2"></span>
              Min. Eligible Score: {minEligibleScore}
            </span>
          </div>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`absolute top-0 left-0 h-full rounded-full ${
              result.score >= 70 
                ? 'bg-gradient-to-r from-green-500 to-gold-300' 
                : result.score >= 50 
                  ? 'bg-gradient-to-r from-yellow-500 to-gold-300' 
                  : 'bg-gradient-to-r from-red-500 to-gold-300'
            }`} 
            initial={{ width: '0%' }} 
            animate={{ width: `${result.score}%` }} 
            transition={{ duration: 1, ease: 'easeOut' }} 
          />
        </div>
        <div className="mt-2 text-right font-medium text-gray-700">
          {result.score}/100
        </div>
        
        {/* Gold decorative dots */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gold-300 opacity-70"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gold-300 opacity-50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gold-300 opacity-30"></div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          className="border-finance-200 text-finance-700 hover:bg-finance-50 hover:border-gold-300"
          onClick={onGoBack}
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        
        {result.eligible && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                type="button" 
                className="bg-finance-600 hover:bg-finance-700 text-white border-b-2 border-gold-300"
              >
                Continue to Application
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-gold-200">
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-gold-300 rotate-45 transform origin-bottom-left opacity-50"></div>
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle className="relative inline-block">
                  Confirm Submission
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-300 to-transparent"></span>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure the details entered by you are correct and want to proceed to submit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                  No, go back and edit
                </AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-finance-600 hover:bg-finance-700 text-white border-b-2 border-gold-300"
                  onClick={onSubmit}
                >
                  Confirm submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EligibilityResult;
