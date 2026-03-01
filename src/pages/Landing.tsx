import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BuildingIcon, BookUser } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-app">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2 shadow-md relative">
              <BuildingIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 relative">
              BE Finance
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full"></span>
            </h1>
          </div>
        </div>

        {/* Purple accent diagonal line */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute transform rotate-45 right-0 h-[2px] w-40 bg-gradient-to-r from-primary/20 via-primary/60 to-transparent"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-12 relative">
        {/* Decorative Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Abstract spiral shape on the right */}
          <svg className="absolute right-10 top-40 h-64 w-64 text-primary/20" viewBox="0 0 100 100" fill="none">
            <motion.path
              d="M50,10 C70,10 85,25 85,50 C85,75 70,90 50,90 C30,90 15,75 15,50 C15,35 22.5,25 35,20 C42.5,17.5 47.5,22.5 45,30 C42.5,37.5 35,40 27.5,37.5 C20,35 17.5,27.5 20,20"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
            />
          </svg>

          {/* Abstract wave shape on the right bottom */}
          <svg className="absolute right-20 bottom-20 h-80 w-80 text-primary/20" viewBox="0 0 100 100" fill="none">
            <motion.path
              d="M10,50 Q25,25 40,50 T70,50 T100,50"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "loop", repeatDelay: 0.5 }}
            />
          </svg>

          {/* Hexagon pattern on the right */}
          <svg className="absolute right-40 top-20 h-40 w-40 text-secondary/30" viewBox="0 0 100 100" fill="none">
            <motion.path
              d="M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4 relative inline-block">
            Welcome to BE Finance
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
          © {new Date().getFullYear()} BE Finance. All rights reserved.
        </div>
        {/* Purple accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </footer>

      {/* Background decorations with SVG patterns instead of blobs */}
      <div className="fixed inset-0 -z-10 diagonal-stripes opacity-10 pointer-events-none"></div>
      <div className="fixed inset-0 -z-10 subtle-grid opacity-30 pointer-events-none"></div>
    </div>
  );
};

export default Landing;
