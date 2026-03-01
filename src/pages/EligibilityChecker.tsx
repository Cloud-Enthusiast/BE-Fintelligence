
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoanEligibilityForm } from '@/components/LoanEligibilityForm';

const EligibilityChecker = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eligibility Checker</h1>
                <p className="text-slate-500 mt-2">
                    Assess applicant eligibility in real-time by entering their business and financial details.
                </p>
            </div>

            <LoanEligibilityForm />
        </motion.div>
    );
};

export default EligibilityChecker;
