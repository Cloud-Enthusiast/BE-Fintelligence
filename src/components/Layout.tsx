
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ScaleIcon, LogOutIcon, BuildingIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoanOfficer = user?.role === 'Loan Officer';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-app diagonal-stripes">
      <header className="sticky top-0 z-50">
        <div className="glass-effect border-b border-finance-200/50 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div className="flex items-center gap-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="bg-finance-500 rounded-lg p-1.5 shadow-md relative">
                  <BuildingIcon className="h-5 w-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-300 border border-white"></span>
                </div>
                <span className="text-xl font-semibold text-finance-950 gold-accent-line">BE Finance</span>
              </motion.div>
              
              {isLoanOfficer ? (
                <motion.nav className="hidden md:flex space-x-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <NavItem icon={<ScaleIcon className="h-4 w-4" />} label="Eligibility" active />
                </motion.nav>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:border-gold-300 border border-transparent transition-colors"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }} 
          className="w-full"
        >
          {children}
        </motion.div>
        
        {/* Decorative golden dots */}
        <div className="absolute top-10 right-10 w-64 h-64 golden-dots opacity-30 -z-10"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 golden-dots opacity-30 -z-10 rounded-full"></div>
      </main>

      <footer className="py-6 border-t border-gray-200 bg-white/50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BE Finance. All rights reserved.
        </div>
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
      </footer>
    </div>
  );
};

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ icon, label, active = false }: NavItemProps) => {
  return (
    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-md cursor-pointer transition-all ${active ? 'bg-finance-100 text-finance-800 font-medium border-b-2 border-gold-300' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default Layout;
