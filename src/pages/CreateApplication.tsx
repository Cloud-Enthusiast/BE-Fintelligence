import { useNavigate, useLocation } from 'react-router-dom';
import { MSMEApplicationForm, MSMEApplicationFormValues } from '@/components/MSMEApplicationForm';
import { useCreateAssessment } from '@/hooks/useCreateAssessment';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/contexts/DocumentContext';
import { calculateEligibility } from '@/utils/MSMEEligibilityCalculator';
import { useTour } from '@/components/Tour/TourContext';
import { ELIGIBILITY_TOUR } from '@/components/Tour/tours';
import { useEffect } from 'react';
import type { Customer } from '@/services/customerService';

const CreateApplication = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { documents } = useDocuments();
    const { mutate: createAssessment, isPending } = useCreateAssessment();
    const { startTour, isTourSeen } = useTour();

    // Accept prefilledCustomer passed from the Customers page "Apply" button
    const prefilledCustomer = (location.state as { prefilledCustomer?: Customer } | null)?.prefilledCustomer;

    useEffect(() => {
        if (!isTourSeen('eligibility_features')) {
            const timer = setTimeout(() => {
                startTour(ELIGIBILITY_TOUR);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isTourSeen, startTour]);

    const handleSubmit = (values: MSMEApplicationFormValues) => {
        // Build a proper EligibilityInput — pass any docs already extracted in this session.
        // MSMEEligibilityCalculator uses them for DSCR, current ratio, GST compliance, banking flags.
        const extractedDocs = documents.map(d => d.extractedData);

        const eligibilityResult = calculateEligibility({
            annualRevenue: values.annualRevenue,
            monthlyIncome: values.monthlyIncome,
            existingLoanAmount: values.existingLoanAmount,
            loanAmount: values.loanAmount,
            loanTerm: values.loanTerm,
            creditScore: values.creditScore,
            businessType: values.businessType,
            loanType: 'business_loan',
            extractedDocuments: extractedDocs.length > 0 ? extractedDocs : undefined,
        });

        const payload = {
            businessName: values.businessName,
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            businessType: values.businessType,
            annualRevenue: values.annualRevenue,
            monthlyIncome: values.monthlyIncome,
            existingLoanAmount: values.existingLoanAmount,
            loanAmount: values.loanAmount,
            loanTerm: values.loanTerm,
            creditScore: values.creditScore,
            eligibilityScore: eligibilityResult.overallScore,
            isEligible: eligibilityResult.isEligible,
            rejectionReason: eligibilityResult.rejectionReason,
            // Full breakdown persisted so reviewers can see exactly how the score was reached
            eligibilityBreakdown: eligibilityResult,
        };

        createAssessment(payload, {
            onSuccess: () => {
                toast({
                    title: "Application Created",
                    description: `${values.businessName}'s application has been successfully created.`,
                });
                navigate('/applications');
            },
            onError: () => {
                toast({
                    variant: "destructive",
                    title: "Creation Failed",
                    description: "There was an error creating the application.",
                });
            }
        });
    };

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
                    <p className="text-gray-600">Create a new application for MSME loan assessment</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <MSMEApplicationForm
                        onSubmit={handleSubmit}
                        isSubmitting={isPending}
                        prefilledCustomer={prefilledCustomer}
                    />
                </div>
            </div>
        </>
    );
};

export default CreateApplication;
