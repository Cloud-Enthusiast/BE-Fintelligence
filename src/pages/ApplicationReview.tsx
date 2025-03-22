import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import LoanApplicationReview from '@/components/LoanApplicationReview';
import { toast } from '@/hooks/use-toast';

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.role !== 'Loan Officer') {
      navigate('/dashboard');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view this page",
      });
    }
  }, [user, navigate]);
  
  const handleApprove = () => {
    toast({
      title: "Application Approved",
      description: "The loan application has been approved.",
    });
    navigate('/dashboard');
  };
  
  const handleReject = () => {
    toast({
      variant: "destructive",
      title: "Application Rejected",
      description: "The loan application has been rejected.",
    });
    navigate('/dashboard');
  };
  
  const handleRequestInfo = () => {
    toast({
      title: "Information Requested",
      description: "Additional information has been requested from the applicant.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-finance-600 hover:text-finance-800 font-medium flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <LoanApplicationReview
          applicationId={id}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestInfo={handleRequestInfo}
        />
      </div>
    </div>
  );
};

export default ApplicationReview;
