import { useQuery } from '@tanstack/react-query';
import { useApplications } from '@/contexts/ApplicationContext';

// Define the assessment type based on the application structure
export interface MappedAssessment {
  id: string;
  business_name: string;
  full_name: string;
  email: string;
  phone: string;
  business_type: string;
  annual_revenue: number;
  monthly_income: number;
  existing_loan_amount: number;
  loan_amount: number;
  loan_term: number;
  credit_score: number;
  eligibility_score: number;
  is_eligible: boolean;
  rejection_reason?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const useFetchAssessments = () => {
  const { applications } = useApplications();

  return useQuery({
    queryKey: ['assessments'],
    queryFn: async (): Promise<MappedAssessment[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Map applications to assessment format
      return applications.map(app => ({
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
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};