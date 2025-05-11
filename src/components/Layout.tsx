
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Building, LogOut, ShieldCheck, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

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
    <div className="flex flex-col min-h-screen bg-gradient-app">
      {/* Premium background patterns */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 diagonal-stripes"></div>
        <div className="absolute inset-0" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(255,198,88,0.08) 0%, transparent 25%), 
                             radial-gradient(circle at 85% 30%, rgba(0,112,243,0.08) 0%, transparent 25%)` 
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-300/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-300/30 to-transparent"></div>
      </div>
      
      <header className="sticky top-0 z-50">
        <div className="glass-effect border-b border-finance-200/50 backdrop-blur-lg shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2" 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-br from-finance-500 to-finance-600 rounded-lg p-1.5 shadow-md relative">
                  <Building className="h-5 w-5 text-white" />
                  <motion.span 
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold-300 border border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  ></motion.span>
                </div>
                <span className="text-xl font-semibold text-finance-950 flex items-center gap-1">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-finance-800 to-finance-900">BE Finance</span>
                  <span className="text-gold-400 ml-1">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                </span>
              </motion.div>
              
              {isLoanOfficer ? (
                <motion.nav 
                  className="hidden md:flex space-x-2" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <NavItem icon={<ShieldCheck className="h-4 w-4" />} label="Eligibility" active />
                  <NavItem icon={<TrendingUp className="h-4 w-4" />} label="Reporting" />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        More <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>Customer Management</DropdownMenuItem>
                      <DropdownMenuItem>Loan Products</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.nav>
              ) : (
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8 border-2 border-gold-100">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-finance-100 text-finance-800">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:border-gold-300 border border-transparent transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
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
        
        {/* Enhanced decorative elements */}
        <div className="absolute top-20 right-10 w-96 h-96 golden-dots opacity-20 -z-10 blur-sm"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 golden-dots opacity-20 -z-10 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 right-0 w-1 h-48 bg-gradient-to-b from-transparent via-gold-300/30 to-transparent -z-10"></div>
        <div className="absolute top-1/4 left-0 w-1 h-48 bg-gradient-to-b from-transparent via-gold-300/30 to-transparent -z-10"></div>
      </main>

      <footer className="py-8 border-t border-gray-200 bg-white/50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-finance-100 rounded-full p-1.5 mr-2">
              <Building className="h-4 w-4 text-finance-600" />
            </div>
            <span className="text-md font-semibold text-finance-800">BE Finance</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BE Finance. All rights reserved.
          </p>
          <div className="flex justify-center gap-10 mt-4 text-xs text-gray-500">
            <a href="#" className="hover:text-finance-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-finance-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-finance-600 transition-colors">Contact Us</a>
          </div>
        </div>
        
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
        
        {/* Corner accents */}
        <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden -z-10">
          <div className="absolute bottom-0 right-0 w-48 h-48 border-t border-l border-gold-200/30 rounded-tl-full"></div>
        </div>
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
    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-md cursor-pointer transition-all ${
      active 
        ? 'bg-gradient-to-br from-finance-50 to-finance-100 text-finance-800 font-medium border-b-2 border-gold-300' 
        : 'text-gray-600 hover:bg-finance-50'
    }`}>
      {icon}
      <span>{label}</span>
      {active && (
        <span className="ml-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gold-300"></div>
        </span>
      )}
    </div>
  );
};

export default Layout;
