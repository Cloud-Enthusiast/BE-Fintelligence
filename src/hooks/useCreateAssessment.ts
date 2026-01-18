
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApplications, LoanApplication } from '@/contexts/ApplicationContext';

export const useCreateAssessment = () => {
    const queryClient = useQueryClient();
    const { addApplication } = useApplications();

    return useMutation({
        mutationFn: async (newAssessment: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>) => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Add the new application via context
            addApplication(newAssessment);

            return newAssessment;
        },
        onSuccess: () => {
            // Invalidate and refetch assessments list
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        },
        onError: (error) => {
            console.error('Error creating assessment:', error);
        },
    });
};
