
import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupeeIcon, ClockIcon, BuildingIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SliderWithInput from './SliderWithInput';
import { formatCurrency } from '@/utils/formatters';
import { Input } from '@/components/ui/input';

interface FormData {
  loanAmount: number;
  loanTerm: number;
  businessType: string;
}

interface TempInputValues {
  loanAmount: string;
  loanTerm: string;
}

interface FormStep3Props {
  formData: FormData;
  tempInputValues: TempInputValues;
  handleSliderChange: (name: string, value: number[]) => void;
  handleNumericInputChange: (name: string, value: string, min: number, max: number) => void;
  handleInputBlur: (name: string, min: number, max: number) => void;
  handleSelectChange: (name: string, value: string) => void;
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

const FormStep3 = ({
  formData,
  tempInputValues,
  handleSliderChange,
  handleNumericInputChange,
  handleInputBlur,
  handleSelectChange
}: FormStep3Props) => {
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-finance-900 mb-4">Customize your loan request</h3>
        <p className="text-finance-600 mb-6">Tell us what you're looking for and we'll assess if it's a good match</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="space-y-8">
        <SliderWithInput
          label="Loan Amount"
          icon={<IndianRupeeIcon className="h-5 w-5 text-finance-600" />}
          name="loanAmount"
          value={formData.loanAmount}
          tempValue={tempInputValues.loanAmount}
          min={500000}
          max={50000000}
          step={100000}
          formatValue={formatCurrency}
          onSliderChange={handleSliderChange}
          onInputChange={handleNumericInputChange}
          onBlur={handleInputBlur}
        />
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-3 items-center">
              <ClockIcon className="h-5 w-5 text-finance-600" />
              <Label className="text-sm font-medium">Loan Term (Months)</Label>
            </div>
            <span className="text-sm font-medium text-finance-800">
              {formData.loanTerm} months
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SliderWithInput
                label=""
                icon={<></>}
                name="loanTerm"
                value={formData.loanTerm}
                tempValue={tempInputValues.loanTerm}
                min={12}
                max={360}
                step={12}
                formatValue={(value) => `${value} months`}
                onSliderChange={handleSliderChange}
                onInputChange={handleNumericInputChange}
                onBlur={handleInputBlur}
                showCurrencyIcon={false}
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex gap-3 items-center mb-2">
            <BuildingIcon className="h-5 w-5 text-finance-600" />
            <Label className="text-sm font-medium">Business Type</Label>
          </div>
          <Select 
            value={formData.businessType} 
            onValueChange={value => handleSelectChange('businessType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormStep3;
