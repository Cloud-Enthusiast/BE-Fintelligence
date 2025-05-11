
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import EligibilityForm from '@/components/EligibilityForm';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 golden-dots opacity-20 rounded-full -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 golden-dots opacity-20 rounded-full -z-10"></div>
        
        {/* Gold corner accents */}
        <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-gold-300 rounded-tl-xl opacity-60"></div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-2 border-r-2 border-gold-300 rounded-br-xl opacity-60"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-finance-900 relative inline-block">
            Commercial Loan Eligibility
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
          </h1>
          <p className="text-lg text-finance-600 max-w-2xl mx-auto">
            Welcome, {user?.name}! Check if your business qualifies for our commercial loan products by completing the assessment below.
          </p>
        </motion.div>
        
        <div className="relative">
          <EligibilityForm />
          
          {/* Subtle gold accent lines */}
          <div className="absolute -top-2 right-0 w-32 h-[1px] bg-gold-300 opacity-60"></div>
          <div className="absolute -bottom-2 left-0 w-32 h-[1px] bg-gold-300 opacity-60"></div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
