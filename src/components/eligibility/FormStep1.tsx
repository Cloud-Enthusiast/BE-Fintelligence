
import React from 'react';
import { motion } from 'framer-motion';
import { BuildingIcon, UserIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormData {
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
}

interface FormStep1Props {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

const FormStep1 = ({ formData, onChange }: FormStep1Props) => {
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-finance-900 mb-4">Tell us about your business</h3>
        <p className="text-finance-600 mb-6">We'll use this information to personalize your eligibility assessment</p>
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
          onChange={onChange} 
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
          onChange={onChange} 
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
            onChange={onChange} 
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
            onChange={onChange} 
            className="mt-1.5" 
            placeholder="Enter your phone number" 
            required 
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormStep1;
