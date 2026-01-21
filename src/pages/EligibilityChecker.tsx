
import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { LoanEligibilityForm } from '@/components/LoanEligibilityForm';

const EligibilityChecker = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <DashboardSidebar isOpen={sidebarOpen} />

            <div className="flex-1 flex flex-col">
                <DashboardHeader onSidebarToggle={handleSidebarToggle} />

                <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Loan Eligibility Checker</h1>
                            <p className="text-gray-600 mt-2">
                                Assess applicant eligibility in real-time by entering their business and financial details.
                            </p>
                        </div>

                        <LoanEligibilityForm />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EligibilityChecker;
