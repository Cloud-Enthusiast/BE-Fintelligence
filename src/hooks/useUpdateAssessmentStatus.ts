import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UpdateStatusPayload {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Function to update the status in Supabase
const updateAssessmentStatusInDb = async ({ id, status }: UpdateStatusPayload) => {
  const { error } = await supabase
    .from('loan_eligibility_assessments')
    .update({ assessment_status: status })
    .eq('id', id);

  if (error) {
    console.error('Error updating assessment status:', error);
    throw new Error('Failed to update assessment status');
  }
};

// Custom hook using React Query's useMutation
export const useUpdateAssessmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, UpdateStatusPayload>({
    mutationFn: updateAssessmentStatusInDb, // Function that performs the update
    onSuccess: () => {
      // Invalidate the 'assessments' query cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast({
        title: "Status Updated",
        description: "The application status has been successfully updated.",
      });
    },
    onError: (error) => {
      // Show an error toast on failure
      toast({
        title: "Update Failed",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
