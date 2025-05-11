
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import EligibilityForm from '@/components/EligibilityForm';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-10 space-y-12 relative">
        {/* Premium decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 golden-dots opacity-20 rounded-full -z-10 blur-sm"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 golden-dots opacity-20 rounded-full -z-10"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-1 bg-gradient-to-r from-gold-300/40 to-transparent -z-10 rotate-45"></div>
        <div className="absolute bottom-1/3 -right-32 w-64 h-1 bg-gradient-to-l from-gold-300/40 to-transparent -z-10 rotate-45"></div>
        
        {/* Enhanced gold corner accents */}
        <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-gold-300 rounded-tl-xl opacity-80"></div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-gold-300 rounded-br-xl opacity-80"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="inline-block mb-2">
            <span className="bg-gradient-to-r from-finance-600 to-finance-800 px-4 py-1 rounded-full text-white text-sm font-medium">
              BE Finance Premium
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-finance-900 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-finance-900 via-finance-800 to-finance-900">
              Commercial Loan Eligibility
            </span>
            <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
            <span className="absolute -top-6 right-0 text-gold-400">
              <Sparkles className="h-5 w-5" />
            </span>
          </h1>
          
          <p className="text-xl text-finance-600 max-w-3xl mx-auto leading-relaxed">
            Welcome, <span className="font-semibold text-finance-800">{user?.name}!</span> Discover if your business qualifies for our premium commercial loan products by completing our streamlined assessment below.
          </p>
          
          <div className="flex justify-center gap-4 pt-2">
            <Button variant="ghost" className="group text-finance-700 hover:text-finance-800 hover:bg-finance-50 border border-finance-200">
              Learn More
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button className="bg-finance-600 hover:bg-finance-700 border-b-4 border-gold-300">
              Apply Now
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
        
        {/* Benefits section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-finance-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gold-300 rotate-45 transform origin-bottom-left opacity-60"></div>
            </div>
            <div className="bg-finance-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-finance-100 transition-colors">
              <TrendingUp className="h-6 w-6 text-finance-600" />
            </div>
            <h3 className="text-lg font-semibold text-finance-800 mb-2">Competitive Rates</h3>
            <p className="text-finance-600">Access industry-leading rates tailored to your business needs</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-finance-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gold-300 rotate-45 transform origin-bottom-left opacity-60"></div>
            </div>
            <div className="bg-finance-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-finance-100 transition-colors">
              <ShieldCheck className="h-6 w-6 text-finance-600" />
            </div>
            <h3 className="text-lg font-semibold text-finance-800 mb-2">Secure Process</h3>
            <p className="text-finance-600">Your information is protected with enterprise-grade security</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-finance-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gold-300 rotate-45 transform origin-bottom-left opacity-60"></div>
            </div>
            <div className="bg-finance-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-finance-100 transition-colors">
              <Sparkles className="h-6 w-6 text-finance-600" />
            </div>
            <h3 className="text-lg font-semibold text-finance-800 mb-2">Fast Approval</h3>
            <p className="text-finance-600">Streamlined process with decisions in as little as 48 hours</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute -top-12 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-finance-100 to-transparent"></div>
          
          {/* Gold embellished card frame */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-full border-2 border-gold-300 shadow-sm z-10">
            <span className="text-finance-900 font-semibold flex items-center">
              <span className="w-2 h-2 bg-gold-300 rounded-full mr-2"></span>
              Eligibility Check
              <span className="w-2 h-2 bg-gold-300 rounded-full ml-2"></span>
            </span>
          </div>
          
          <div className="pt-8 border-t-2 border-dashed border-finance-200">
            <div className="bg-gradient-to-b from-white to-finance-50/30 rounded-xl p-1 shadow-xl">
              <div className="bg-white rounded-lg p-8 border border-finance-100">
                <EligibilityForm />
              </div>
            </div>
            
            {/* Subtle gold accent lines */}
            <div className="absolute -top-2 right-0 w-48 h-[2px] bg-gradient-to-l from-gold-300 to-transparent opacity-80"></div>
            <div className="absolute -bottom-2 left-0 w-48 h-[2px] bg-gradient-to-r from-gold-300 to-transparent opacity-80"></div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
