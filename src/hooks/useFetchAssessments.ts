
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Define the assessment type based on the database structure
export interface MappedAssessment {
  id: string;
  businessName: string;
  fullName: string;
  loanAmount: number;
  loanTerm: number | null;
  createdAt: string;
  status: string;
  eligibilityScore: number | null;
}

export const useFetchAssessments = () => {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Loan_applicants')
        .select('*, user_profiles(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map the database fields to the component-friendly format
      const mappedData: MappedAssessment[] = data.map(item => ({
        id: item.id,
        businessName: item.business_name || 'N/A',
        fullName: item.user_profiles ? 
          `${item.user_profiles.first_name || ''} ${item.user_profiles.last_name || ''}`.trim() : 
          'Unknown User',
        loanAmount: item.requested_loan_amount || 0,
        loanTerm: item.requested_loan_term_months,
        createdAt: item.created_at,
        status: item.assessment_status, // Map assessment_status to status
        eligibilityScore: item.eligibility_score
      }));

      return mappedData;
    }
  });
};
