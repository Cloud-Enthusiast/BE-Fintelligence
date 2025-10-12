import { useQuery } from '@tanstack/react-query';
import { useApplications } from '@/contexts/ApplicationContext';
import type { MappedAssessment } from './useFetchAssessments';

export const useFetchSingleBasicAssessment = (id: string) => {
  const { applications } = useApplications();

  return useQuery({
    queryKey: ['assessment', id],
    queryFn: async (): Promise<MappedAssessment | null> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const app = applications.find(application => application.id === id);
      
      if (!app) {
        return null;
      }

      // Map application to assessment format
      return {
        id: app.id,
        business_name: app.businessName,
        full_name: app.fullName,
        email: app.email,
        phone: app.phone,
        business_type: app.businessType,
        annual_revenue: app.annualRevenue,
        monthly_income: app.monthlyIncome,
        existing_loan_amount: app.existingLoanAmount,
        loan_amount: app.loanAmount,
        loan_term: app.loanTerm,
        credit_score: app.creditScore,
        eligibility_score: app.eligibilityScore,
        is_eligible: app.isEligible,
        rejection_reason: app.rejectionReason,
        created_at: app.createdAt,
        status: app.status,
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};