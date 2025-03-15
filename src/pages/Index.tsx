
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import EligibilityForm from '@/components/EligibilityForm';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-end mb-4">
          <Link to="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <UserIcon className="h-4 w-4" />
              Officer Login
            </Button>
          </Link>
        </div>
        
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
            Check if your business qualifies for our commercial loan products by completing the assessment below.
          </p>
        </motion.div>
        
        <EligibilityForm />
      </div>
    </Layout>
  );
};

export default Index;
