
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3Icon, IndianRupeeIcon, CalendarIcon } from 'lucide-react';
import SliderWithInput from './SliderWithInput';
import { formatCurrency } from '@/utils/formatters';

interface FormData {
  annualRevenue: number;
  monthlyIncome: number;
  existingLoanAmount: number;
  creditScore: number;
}

interface TempInputValues {
  annualRevenue: string;
  monthlyIncome: string;
  existingLoanAmount: string;
  creditScore: string;
}

interface FormStep2Props {
  formData: FormData;
  tempInputValues: TempInputValues;
  handleSliderChange: (name: string, value: number[]) => void;
  handleNumericInputChange: (name: string, value: string, min: number, max: number) => void;
  handleInputBlur: (name: string, min: number, max: number) => void;
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

const FormStep2 = ({
  formData,
  tempInputValues,
  handleSliderChange,
  handleNumericInputChange,
  handleInputBlur
}: FormStep2Props) => {
  
  // Auto-calculate Annual Revenue when Monthly Income changes
  useEffect(() => {
    const annualRevenueValue = formData.monthlyIncome * 12;
    handleSliderChange('annualRevenue', [annualRevenueValue]);
  }, [formData.monthlyIncome]);
  
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-finance-900 mb-4">Share your financial details</h3>
        <p className="text-finance-600 mb-6">This helps us understand your business's financial health and capacity</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-8">
        <SliderWithInput
          label="Monthly Income"
          icon={<IndianRupeeIcon className="h-5 w-5 text-finance-600" />}
          name="monthlyIncome"
          value={formData.monthlyIncome}
          tempValue={tempInputValues.monthlyIncome}
          min={40000}
          max={2000000}
          step={10000}
          formatValue={formatCurrency}
          onSliderChange={handleSliderChange}
          onInputChange={handleNumericInputChange}
          onBlur={handleInputBlur}
        />
        
        <SliderWithInput
          label="Annual Revenue"
          icon={<BarChart3Icon className="h-5 w-5 text-finance-600" />}
          name="annualRevenue"
          value={formData.annualRevenue}
          tempValue={tempInputValues.annualRevenue}
          min={500000}
          max={20000000}
          step={100000}
          formatValue={formatCurrency}
          onSliderChange={handleSliderChange}
          onInputChange={handleNumericInputChange}
          onBlur={handleInputBlur}
          readOnly={true}
        />
        
        <SliderWithInput
          label="Existing Loan Amount"
          icon={<IndianRupeeIcon className="h-5 w-5 text-finance-600" />}
          name="existingLoanAmount"
          value={formData.existingLoanAmount}
          tempValue={tempInputValues.existingLoanAmount}
          min={0}
          max={15000000}
          step={100000}
          formatValue={formatCurrency}
          onSliderChange={handleSliderChange}
          onInputChange={handleNumericInputChange}
          onBlur={handleInputBlur}
        />
        
        <SliderWithInput
          label="Credit Score"
          icon={<CalendarIcon className="h-5 w-5 text-finance-600" />}
          name="creditScore"
          value={formData.creditScore}
          tempValue={tempInputValues.creditScore}
          min={300}
          max={900}
          step={1}
          formatValue={(value) => `${value}`}
          onSliderChange={handleSliderChange}
          onInputChange={handleNumericInputChange}
          onBlur={handleInputBlur}
          showCurrencyIcon={false}
        />
      </motion.div>
    </motion.div>
  );
};

export default FormStep2;
