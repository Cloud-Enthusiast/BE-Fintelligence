import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { MSMEApplicationForm, MSMEApplicationFormValues } from '@/components/MSMEApplicationForm';
import { useCreateAssessment } from '@/hooks/useCreateAssessment';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/contexts/DocumentContext';
import { calculateEligibility } from '@/utils/MSMEEligibilityCalculator';
import { useTour } from '@/components/Tour/TourContext';
import { ELIGIBILITY_TOUR } from '@/components/Tour/tours';
import { useEffect, useState } from 'react';

const CreateApplication = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { documents } = useDocuments();
    const { mutate: createAssessment, isPending } = useCreateAssessment();
    const { startTour, isTourSeen } = useTour();

    useEffect(() => {
        if (!isTourSeen('eligibility_features')) {
            const timer = setTimeout(() => {
                startTour(ELIGIBILITY_TOUR);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isTourSeen, startTour]);

    const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

    const handleSubmit = (values: MSMEApplicationFormValues) => {
        const eligibilityScore = Math.min(95, Math.max(40, (values.annualRevenue / 100000) * 5 + 50));
        const isEligible = eligibilityScore >= 60;

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
            creditScore: values.creditScore || 700,
            eligibilityScore: Math.round(eligibilityScore),
            isEligible,
            rejectionReason: isEligible ? undefined : 'Did not meet minimum revenue/score criteria'
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
        <div className="min-h-screen bg-gray-50 flex">
            <DashboardSidebar isOpen={sidebarOpen} />

            <div className="flex-1 flex flex-col">
                <DashboardHeader onSidebarToggle={handleSidebarToggle} />

                <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
                            <p className="text-gray-600">Create a new application for MSME loan assessment</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <MSMEApplicationForm onSubmit={handleSubmit} isSubmitting={isPending} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateApplication;