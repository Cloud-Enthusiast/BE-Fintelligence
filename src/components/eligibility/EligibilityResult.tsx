
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';

interface EligibilityResultProps {
  result: {
    eligible: boolean;
    score: number;
    reason?: string;
  };
  onComplete?: () => void;
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

const EligibilityResult = ({ result, onComplete }: EligibilityResultProps) => {
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
        <h4 className="text-lg font-medium text-gray-900 mb-4">Eligibility Score</h4>
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
      
      {result.eligible && (
        <motion.div variants={itemVariants} className="text-center">
          <Button 
            type="button" 
            className="bg-finance-600 hover:bg-finance-700 text-white" 
            onClick={() => {
              if (onComplete) {
                onComplete();
              }
            }}
          >
            Continue to Application
            <ChevronRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EligibilityResult;
