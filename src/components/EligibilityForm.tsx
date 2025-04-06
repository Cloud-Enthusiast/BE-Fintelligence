
import EligibilityFormWrapper from './eligibility/EligibilityFormWrapper';

interface EligibilityFormProps {
  onComplete?: () => void;
}

const EligibilityForm = ({ onComplete }: EligibilityFormProps) => {
  return <EligibilityFormWrapper onComplete={onComplete} />;
};

export default EligibilityForm;
