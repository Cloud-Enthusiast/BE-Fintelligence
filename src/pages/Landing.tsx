import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookUser } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-app">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BridgeEasy Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-slate-900">
              BridgeEasy
            </h1>
          </div>
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4 relative inline-block">
            Welcome to BridgeEasy
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </h1>
          <p className="text-xl text-slate-600">MSME Loan Qualification Platform for Loan Officers</p>
        </motion.div>

        <div className="max-w-md w-full relative">
          {/* Clean accent decorations */}
          <div className="absolute -top-10 -left-10 w-20 h-20">
            <div className="w-full h-full border-t-2 border-l-2 border-primary/50 rounded-tl-xl opacity-60"></div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-20 h-20">
            <div className="w-full h-full border-b-2 border-r-2 border-primary/50 rounded-br-xl opacity-60"></div>
          </div>

          {/* Loan Officer Portal */}
          <motion.div
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full transition-colors hover-lift card-shine border-2 border-transparent hover:border-secondary hover:shadow-lg bg-white/90 backdrop-blur-sm relative overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="bg-primary/5 p-4 rounded-full mb-6 border-2 border-primary/10 relative">
                  <BookUser className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900">Loan Officer Portal</h2>
                <p className="text-slate-600 mb-6">Access the dashboard to assess MSME loan eligibility and manage applications</p>
                <div className="w-full mt-auto grid gap-4">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-b-4 border-primary/20"
                    size="lg"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 bg-white/80 backdrop-blur-sm border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          © {new Date().getFullYear()} BridgeEasy Consultant LLP. All rights reserved.
        </div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </footer>
    </div>
  );
};

export default Landing;
