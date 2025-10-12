import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApplications } from '@/contexts/ApplicationContext';

export const useUpdateAssessmentStatus = () => {
  const queryClient = useQueryClient();
  const { updateApplicationStatus } = useApplications();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: 'pending' | 'approved' | 'rejected' 
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update the application status
      updateApplicationStatus(id, status);
      
      return { id, status };
    },
    onSuccess: () => {
      // Invalidate and refetch assessments
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    onError: (error) => {
      console.error('Error updating assessment status:', error);
    },
  });
};