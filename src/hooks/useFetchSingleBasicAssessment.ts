import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MappedAssessment } from './useFetchAssessments'; // Re-use the type

// Define a slightly adjusted type if needed, or ensure MappedAssessment is suitable
// For now, MappedAssessment seems fine as it contains the core fields.

export const useFetchSingleBasicAssessment = (applicationId: string | undefined) => {
  return useQuery<MappedAssessment, Error>({
    queryKey: ['assessment', applicationId],
    queryFn: async () => {
      if (!applicationId) {
        throw new Error('Application ID is required to fetch assessment details.');
      }

      const { data, error } = await supabase
        .from('Loan_applicants')
        .select(`
          id,
          business_name,
          created_at,
          requested_loan_amount,
          requested_loan_term_months,
          assessment_status,
          eligibility_score,
          customer_information (
            first_name,
            last_name
          )
        `)
        .eq('id', applicationId)
        .single();

      if (error) {
        console.error('Error fetching single assessment:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Assessment not found.');
      }

      // Map the database fields to the MappedAssessment format
      // Ensure property names match MappedAssessment interface
      const customerInfo = Array.isArray(data.customer_information) 
        ? data.customer_information[0] 
        : data.customer_information;

      return {
        id: data.id,
        businessName: data.business_name || 'N/A',
        fullName: customerInfo ? 
          `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim() : 
          'Unknown User',
        loanAmount: data.requested_loan_amount || 0,
        loanTerm: data.requested_loan_term_months,
        createdAt: data.created_at,
        status: data.assessment_status,
        eligibilityScore: data.eligibility_score,
      };
    },
    enabled: !!applicationId, // Only run the query if applicationId is available
  });
};
