
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApplications, LoanApplication } from '@/contexts/ApplicationContext';

export const useCreateAssessment = () => {
    const queryClient = useQueryClient();
    const { addApplication } = useApplications();

    return useMutation({
        mutationFn: async (newAssessment: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>) => {
            // Writes to Firestore via ApplicationContext — awaited properly.
            await addApplication(newAssessment);
            return newAssessment;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        },
        onError: (error) => {
            console.error('Error creating assessment:', error);
        },
    });
};
