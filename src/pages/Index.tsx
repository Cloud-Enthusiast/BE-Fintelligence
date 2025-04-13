
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import EligibilityForm from '@/components/EligibilityForm';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-finance-900">
            Commercial Loan Eligibility
          </h1>
          <p className="text-lg text-finance-600 max-w-2xl mx-auto">
            Welcome, {user?.name}! Check if your business qualifies for our commercial loan products by completing the assessment below.
          </p>
        </motion.div>
        
        <EligibilityForm />
      </div>
    </Layout>
  );
};

export default Index;
