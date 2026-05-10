import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { LoanEligibilityForm } from '@/components/LoanEligibilityForm';

const EligibilityChecker = () => {
    const { state } = useLocation();
    const prefill = state?.prefill;

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
                {prefill && (
                    <p className="text-sm text-primary mt-1">
                        Pre-filled from Document Hub — review and adjust as needed.
                    </p>
                )}
            </div>

            <LoanEligibilityForm prefill={prefill} />
        </motion.div>
    );
};

export default EligibilityChecker;
