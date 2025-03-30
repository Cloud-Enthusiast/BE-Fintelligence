
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
    <motion.div className="space-y-8 py-4" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div 
        variants={itemVariants} 
        className={`text-center p-6 rounded-lg ${result.eligible ? 'bg-green-50 border-2 border-green-100' : 'bg-red-50 border-2 border-red-100'}`}
      >
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
      
      <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-900">Eligibility Score</h4>
          <div className="text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-finance-600 rounded-full mr-2"></span>
              Min. Eligible Score: {minEligibleScore}
            </span>
          </div>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`absolute top-0 left-0 h-full rounded-full ${result.score >= 70 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
            initial={{ width: '0%' }} 
            animate={{ width: `${result.score}%` }} 
            transition={{ duration: 1, ease: 'easeOut' }} 
          />
        </div>
        <div className="mt-2 text-right font-medium text-gray-700">
          {result.score}/100
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          className="border-finance-200 text-finance-700 hover:bg-finance-50"
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
                className="bg-finance-600 hover:bg-finance-700 text-white"
              >
                Continue to Application
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure the details entered by you are correct and want to proceed to submit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                  No, go back and edit
                </AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-finance-600 hover:bg-finance-700 text-white"
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
