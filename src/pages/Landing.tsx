
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BuildingIcon, UserIcon } from 'lucide-react';
import LoanOfficerRegister from '@/components/LoanOfficerRegister';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredOption, setHoveredOption] = useState<'officer' | 'applicant' | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-app diagonal-stripes">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-finance-500 rounded-lg p-2 shadow-md relative">
              <BuildingIcon className="h-6 w-6 text-white" />
              {/* Gold accent */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold-300 border border-white animate-pulse"></span>
            </div>
            <h1 className="text-2xl font-bold text-finance-900 relative">
              BE Finance
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gold-300 rounded-full"></span>
            </h1>
          </div>
        </div>
        
        {/* Gold accent diagonal line */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute transform rotate-45 right-0 h-[2px] w-40 bg-gradient-to-r from-gold-200 via-gold-400 to-transparent"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl font-bold text-finance-900 mb-4 relative inline-block">
            Welcome to BE Finance
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
          </h1>
          <p className="text-xl text-finance-600">Your trusted partner in business funding solutions</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative">
          {/* Gold accent decorations */}
          <div className="absolute -top-10 -left-10 w-20 h-20">
            <div className="w-full h-full border-t-2 border-l-2 border-gold-300 rounded-tl-xl opacity-60"></div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-20 h-20">
            <div className="w-full h-full border-b-2 border-r-2 border-gold-300 rounded-br-xl opacity-60"></div>
          </div>

          {/* Loan Officer Option */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setHoveredOption('officer')}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <Card className={`h-full border-2 transition-colors hover-lift card-shine ${
              hoveredOption === 'officer' ? 'border-gold-400 shadow-lg' : 'border-transparent'
            } bg-white/90 backdrop-blur-sm relative overflow-hidden`}>
              {/* Gold accent corner */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-6 h-6 bg-gold-300 rotate-45 transform origin-bottom-left"></div>
              </div>
              
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="bg-finance-100 p-4 rounded-full mb-6 border-2 border-finance-200 relative">
                  <BuildingIcon className="h-12 w-12 text-finance-500" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-300 border-2 border-white"></span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-finance-900">Loan Officer</h2>
                <p className="text-gray-600 mb-6">Access the dashboard to review and manage loan applications</p>
                <div className="w-full mt-auto grid gap-4">
                  <Button 
                    className="w-full mt-auto bg-finance-500 hover:bg-finance-600 text-white border-b-4 border-gold-300" 
                    size="lg"
                    onClick={() => navigate('/login', { state: { defaultTab: 'officer' }})}
                  >
                    Login as Loan Officer
                  </Button>
                  <LoanOfficerRegister />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Loan Applicant Option */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setHoveredOption('applicant')}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <Card className={`h-full border-2 transition-colors hover-lift card-shine ${
              hoveredOption === 'applicant' ? 'border-gold-400 shadow-lg' : 'border-transparent'
            } bg-white/90 backdrop-blur-sm relative overflow-hidden`}>
              {/* Gold accent corner */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-6 h-6 bg-gold-300 rotate-45 transform origin-bottom-left"></div>
              </div>
              
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="bg-finance-100 p-4 rounded-full mb-6 border-2 border-finance-200 relative">
                  <UserIcon className="h-12 w-12 text-finance-500" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-300 border-2 border-white"></span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-finance-900">Loan Applicant</h2>
                <p className="text-gray-600 mb-6">Apply for business funding or check your application status</p>
                <div className="w-full mt-auto grid gap-4">
                  <Button 
                    className="w-full bg-finance-500 hover:bg-finance-600 text-white border-b-4 border-gold-300" 
                    size="lg"
                    onClick={() => navigate('/login', { state: { defaultTab: 'applicant' }})}
                  >
                    Login as Applicant
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-finance-300 hover:bg-gold-50 text-finance-600 hover:border-gold-300" 
                    onClick={() => navigate('/register')}
                  >
                    Register New Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 bg-white/80 backdrop-blur-sm border-t border-finance-100 relative">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BE Finance. All rights reserved.
        </div>
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
      </footer>
      
      {/* Background decorations */}
      <div className="absolute top-40 right-10 w-80 h-80 golden-dots opacity-30 -z-10 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-40 left-10 w-96 h-96 golden-dots opacity-30 -z-10 rounded-full pointer-events-none"></div>
    </div>
  );
};

export default Landing;
