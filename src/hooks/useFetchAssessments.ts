import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Define the structure of the data we expect after fetching and mapping
export interface MappedAssessment {
  id: string;
  businessName: string | null;
  fullName: string | null; // From joined loan_applicants
  email: string | null; // From joined loan_applicants
  loanAmount: number | null; // Renamed from requested_loan_amount
  loanTerm: number | null; // Renamed from requested_loan_term_months
  createdAt: string; // Renamed from created_at
  status: string | null; // Renamed from assessment_status
  eligibilityScore: number | null;
}

// Define the structure of the raw data fetched from Supabase
interface RawAssessment {
  id: string;
  business_name: string | null;
  requested_loan_amount: number | null;
  requested_loan_term_months: number | null;
  created_at: string;
  assessment_status: string | null;
  eligibility_score: number | null;
  loan_applicants: {
    full_name: string | null;
    email: string | null;
  } | null;
}

// Function to fetch assessments from Supabase
const fetchAssessments = async (): Promise<MappedAssessment[]> => {
  const { data, error } = await supabase
    .from('loan_eligibility_assessments')
    .select(`
      id,
      business_name,
      requested_loan_amount,
      requested_loan_term_months,
      created_at,
      assessment_status,
      eligibility_score,
      loan_applicants ( full_name, email ) 
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assessments:', error);
    throw new Error('Failed to fetch assessments');
  }

  // Map the raw data to the structure expected by the UI components
  // Use 'as any[]' to bypass strict type checking issues with Supabase join results
  const mappedData: MappedAssessment[] = (data as any[] || []).map(assessment => ({
    id: assessment.id,
    businessName: assessment.business_name,
    fullName: assessment.loan_applicants?.full_name ?? 'N/A', // Handle potential null applicant
    email: assessment.loan_applicants?.email ?? 'N/A',
    loanAmount: assessment.requested_loan_amount,
    loanTerm: assessment.requested_loan_term_months,
    createdAt: assessment.created_at,
    status: assessment.assessment_status,
    eligibilityScore: assessment.eligibility_score,
  }));

  return mappedData;
};

// Custom hook using React Query
export const useFetchAssessments = () => {
  return useQuery<MappedAssessment[], Error>({
    queryKey: ['assessments'], // Unique key for this query
    queryFn: fetchAssessments, // Function to fetch the data
  });
};
