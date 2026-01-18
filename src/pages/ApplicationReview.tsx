
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoanApplicationReview from '@/components/LoanApplicationReview';
import { toast } from '@/hooks/use-toast';
import { useUpdateAssessmentStatus } from '@/hooks/useUpdateAssessmentStatus'; // Import the hook
import { useTour } from '@/components/Tour/TourContext';
import { APPLICATION_REVIEW_TOUR } from '@/components/Tour/tours';

const ApplicationReview = () => {
  const { id: applicationId } = useParams<{ id: string }>(); // Ensure id is treated as string | undefined
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { mutate: updateStatusMutation, isPending: isUpdatingStatus } = useUpdateAssessmentStatus(); // Get mutate function, use isPending
  const { startTour, isTourSeen } = useTour();

  useEffect(() => {
    if (!isTourSeen('application_review')) {
      const timer = setTimeout(() => {
        startTour(APPLICATION_REVIEW_TOUR);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTourSeen, startTour]);

  // Check if user is a loan officer
  useEffect(() => {
    if (profile && profile.role !== 'loan_officer') {
      navigate('/dashboard');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view this page",
      });
    }
  }, [profile, navigate]);

  const handleApprove = () => {
    if (!applicationId) return;
    updateStatusMutation(
      { id: applicationId, status: 'approved' },
      {
        onSuccess: () => {
          toast({
            title: "Application Approved",
            description: "The loan application has been approved.",
          });
          navigate('/applications'); // Navigate back to the list
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Approval Failed",
            description: error.message || "Could not approve the application.",
          });
        }
      }
    );
  };

  const handleReject = () => {
    if (!applicationId) return;
    updateStatusMutation(
      { id: applicationId, status: 'rejected' },
      {
        onSuccess: () => {
          toast({
            variant: "default", // Or keep destructive if preferred for rejection confirmation
            title: "Application Rejected",
            description: "The loan application has been rejected.",
          });
          navigate('/applications'); // Navigate back to the list
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Rejection Failed",
            description: error.message || "Could not reject the application.",
          });
        }
      }
    );
  };

  const handleRequestInfo = () => {
    // TODO: Implement actual logic for requesting more information
    // This might involve setting a different status, e.g., 'pending_information'
    // or triggering a notification/modal.
    if (!applicationId) return;
    toast({
      title: "Information Requested",
      description: `Additional information has been requested for application ${applicationId}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/applications')} // Navigate back to the list
            className="text-finance-600 hover:text-finance-800 font-medium flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Applications
          </button>
        </div>

        <LoanApplicationReview
          applicationId={applicationId}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestInfo={handleRequestInfo}
        // Consider passing isUpdatingStatus to disable buttons during mutation
        />
      </div>
    </div>
  );
};

export default ApplicationReview;
