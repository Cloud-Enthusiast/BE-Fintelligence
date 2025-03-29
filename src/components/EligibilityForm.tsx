
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BuildingIcon, UserIcon, MailIcon, PhoneIcon, BarChart3Icon, ClockIcon, CalendarIcon, ChevronRightIcon, IndianRupeeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    annualRevenue: 5000000,
    monthlyIncome: 400000,
    existingLoanAmount: 1000000, // New field for existing loan amount
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, name: string, min: number, max: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: 0 }));
      return;
    }

    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      setFormData(prev => ({ ...prev, [name]: clampedValue }));
    }
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value[0]
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
      // Updated eligibility calculation with new rules
      const monthlyRevenue = formData.annualRevenue / 12;
      const monthlyLoanPayment = formData.loanAmount / formData.loanTerm;
      const existingMonthlyPayment = formData.existingLoanAmount / 12; // Simple estimate
      const totalMonthlyPayment = monthlyLoanPayment + existingMonthlyPayment;
      const debtToIncomeRatio = totalMonthlyPayment / formData.monthlyIncome;
      const revenueCoverage = monthlyRevenue / monthlyLoanPayment;
      
      // Updated threshold to 0.4 (40%) for debt-to-income ratio and 700 for credit score
      const isEligible = formData.creditScore >= 700 && debtToIncomeRatio <= 0.4 && revenueCoverage >= 2;
      
      // Calculate score based on updated criteria (credit score out of 900)
      const score = Math.min(
        Math.round(
          formData.creditScore / 900 * 0.4 * 100 + 
          (1 - debtToIncomeRatio) * 0.3 * 100 + 
          Math.min(revenueCoverage / 5, 1) * 0.3 * 100
        ), 
        100
      );
      
      let reason;
      if (!isEligible) {
        if (formData.creditScore < 700) reason = "Credit score below required threshold of 700";
        else if (debtToIncomeRatio > 0.4) reason = "Debt-to-income ratio above 40%";
        else reason = "Insufficient revenue to support repayment";
      }
      
      setResult({
        eligible: isEligible,
        score,
        reason
      });
      
      setIsSubmitting(false);
      setCurrentStep(4);
    }, 1500);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3].map(step => (
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
          {step < 3 && <div className={`w-10 h-0.5 ml-2 ${step < currentStep ? 'bg-finance-600' : 'bg-gray-300'}`} />}
        </div>
      ))}
    </div>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  // Helper for rendering slider with input box
  const renderSliderWithInput = (
    label: string, 
    icon: React.ReactNode, 
    name: string, 
    value: number, 
    min: number, 
    max: number, 
    step: number,
    formatValue: (val: number) => string
  ) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-3 items-center">
          {icon}
          <Label className="text-sm font-medium">{label}</Label>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider 
            value={[value]} 
            min={min} 
            max={max} 
            step={step} 
            onValueChange={value => handleSliderChange(name, value)} 
            className="w-full" 
          />
          <div className="flex justify-between mt-1 text-sm text-gray-500">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        </div>
        <div className="relative w-32">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {name !== 'creditScore' && <IndianRupeeIcon className="h-4 w-4 text-gray-500" />}
          </div>
          <Input
            type="text"
            value={value}
            onChange={(e) => handleNumericChange(e, name, min, max)}
            className={`${name !== 'creditScore' ? 'pl-8' : 'pl-3'}`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
      <CardHeader className="bg-finance-50 border-b border-gray-200">
        <CardTitle className="text-2xl text-finance-800">Commercial Loan Eligibility Assessment</CardTitle>
        <CardDescription className="text-finance-600">
          Complete the form to check your business loan eligibility
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {currentStep < 4 && renderStepIndicator()}
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-medium text-finance-900 mb-4">Business Information</h3>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="flex gap-3 items-center">
                  <BuildingIcon className="h-5 w-5 text-finance-600" />
                  <Label htmlFor="businessName" className="text-sm font-medium">
                    Business Name
                  </Label>
                </div>
                <Input 
                  id="businessName" 
                  name="businessName" 
                  value={formData.businessName} 
                  onChange={handleChange} 
                  className="mt-1.5" 
                  placeholder="Enter your business name" 
                  required 
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="flex gap-3 items-center">
                  <UserIcon className="h-5 w-5 text-finance-600" />
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                </div>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  className="mt-1.5" 
                  placeholder="Enter your full name" 
                  required 
                />
              </motion.div>
              
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex gap-3 items-center">
                    <MailIcon className="h-5 w-5 text-finance-600" />
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                  </div>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="mt-1.5" 
                    placeholder="Enter your email" 
                    required 
                  />
                </div>
                
                <div>
                  <div className="flex gap-3 items-center">
                    <PhoneIcon className="h-5 w-5 text-finance-600" />
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                  </div>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="mt-1.5" 
                    placeholder="Enter your phone number" 
                    required 
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {currentStep === 2 && (
            <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-medium text-finance-900 mb-4">Financial Information</h3>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-8">
                {renderSliderWithInput(
                  "Annual Revenue", 
                  <BarChart3Icon className="h-5 w-5 text-finance-600" />, 
                  "annualRevenue", 
                  formData.annualRevenue, 
                  1000000, 
                  100000000, 
                  500000, 
                  formatCurrency
                )}
                
                {renderSliderWithInput(
                  "Monthly Income", 
                  <IndianRupeeIcon className="h-5 w-5 text-finance-600" />, 
                  "monthlyIncome", 
                  formData.monthlyIncome, 
                  50000, 
                  5000000, 
                  10000, 
                  formatCurrency
                )}
                
                {renderSliderWithInput(
                  "Existing Loan Amount", 
                  <IndianRupeeIcon className="h-5 w-5 text-finance-600" />, 
                  "existingLoanAmount", 
                  formData.existingLoanAmount, 
                  0, 
                  50000000, 
                  100000, 
                  formatCurrency
                )}
                
                {renderSliderWithInput(
                  "Credit Score", 
                  <CalendarIcon className="h-5 w-5 text-finance-600" />, 
                  "creditScore", 
                  formData.creditScore, 
                  300, 
                  900, 
                  1, 
                  (value) => `${value}`
                )}
              </motion.div>
            </motion.div>
          )}
          
          {currentStep === 3 && (
            <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-medium text-finance-900 mb-4">Loan Requirements</h3>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-8">
                {renderSliderWithInput(
                  "Loan Amount", 
                  <IndianRupeeIcon className="h-5 w-5 text-finance-600" />, 
                  "loanAmount", 
                  formData.loanAmount, 
                  500000, 
                  50000000, 
                  100000, 
                  formatCurrency
                )}
                
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
                      <Slider 
                        value={[formData.loanTerm]} 
                        min={12} 
                        max={120} 
                        step={12} 
                        onValueChange={value => handleSliderChange('loanTerm', value)} 
                        className="w-full" 
                      />
                      <div className="flex justify-between mt-1 text-sm text-gray-500">
                        <span>12 months</span>
                        <span>120 months</span>
                      </div>
                    </div>
                    <div className="w-32">
                      <Input
                        type="text"
                        value={formData.loanTerm}
                        onChange={(e) => handleNumericChange(e, 'loanTerm', 12, 120)}
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
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {currentStep === 4 && result && (
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
