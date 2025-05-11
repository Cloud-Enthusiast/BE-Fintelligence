
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
    <div className="min-h-screen flex flex-col bg-gradient-app">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-finance-500 rounded-lg p-2 shadow-md">
              <BuildingIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-finance-900">BE Finance</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl font-bold text-finance-900 mb-4">Welcome to BE Finance</h1>
          <p className="text-xl text-finance-600">Your trusted partner in business funding solutions</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Loan Officer Option */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onMouseEnter={() => setHoveredOption('officer')}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <Card className={`h-full border-2 transition-colors hover-lift card-shine ${
              hoveredOption === 'officer' ? 'border-finance-400 shadow-lg' : 'border-transparent'
            } bg-white/90 backdrop-blur-sm`}>
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="bg-finance-100 p-4 rounded-full mb-6">
                  <BuildingIcon className="h-12 w-12 text-finance-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-finance-900">Loan Officer</h2>
                <p className="text-gray-600 mb-6">Access the dashboard to review and manage loan applications</p>
                <div className="w-full mt-auto grid gap-4">
                  <Button 
                    className="w-full mt-auto bg-finance-500 hover:bg-finance-600 text-white" 
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
              hoveredOption === 'applicant' ? 'border-finance-400 shadow-lg' : 'border-transparent'
            } bg-white/90 backdrop-blur-sm`}>
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="bg-finance-100 p-4 rounded-full mb-6">
                  <UserIcon className="h-12 w-12 text-finance-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-finance-900">Loan Applicant</h2>
                <p className="text-gray-600 mb-6">Apply for business funding or check your application status</p>
                <div className="w-full mt-auto grid gap-4">
                  <Button 
                    className="w-full bg-finance-500 hover:bg-finance-600 text-white" 
                    size="lg"
                    onClick={() => navigate('/login', { state: { defaultTab: 'applicant' }})}
                  >
                    Login as Applicant
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-finance-300 hover:bg-finance-50 text-finance-600" 
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
      <footer className="py-6 px-4 bg-white/80 backdrop-blur-sm border-t border-finance-100">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BE Finance. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
