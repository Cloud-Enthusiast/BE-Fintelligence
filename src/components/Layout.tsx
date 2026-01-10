import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Building, LogOut, ShieldCheck, TrendingUp, Sparkles, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = profile?.full_name || profile?.email || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Premium background patterns */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 purple-gold-pattern"></div>
        <div className="absolute inset-0" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(155,135,245,0.08) 0%, transparent 25%), 
                             radial-gradient(circle at 85% 30%, rgba(255,198,88,0.08) 0%, transparent 25%)` 
          }}
        ></div>
        {/* Diagonal stripes */}
        <div className="absolute inset-0 diagonal-stripes opacity-40"></div>
        
        {/* Gold & Purple border accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-300/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
        
        {/* Purple & Gold dots */}
        <div className="absolute top-40 right-10 w-96 h-96 purple-dots opacity-20 -z-10 rounded-full"></div>
        <div className="absolute bottom-40 left-10 w-80 h-80 golden-dots opacity-20 -z-10 rounded-full"></div>
      </div>
      
      <header className="sticky top-0 z-50">
        <div className="glass-effect bg-white/80 border-b border-purple-200/50 backdrop-blur-lg shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2" 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-1.5 shadow-md relative">
                  <Building className="h-5 w-5 text-white" />
                  <motion.span 
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold-300 border border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  ></motion.span>
                </div>
                <span className="text-xl font-semibold flex items-center gap-1">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900">Premium Finance</span>
                  <span className="text-gold-400 ml-1">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                </span>
              </motion.div>
              
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
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-900">
                      More <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-purple-100 bg-white/95 backdrop-blur-sm">
                    <DropdownMenuItem className="hover:bg-purple-50">Customer Management</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-purple-50">Loan Products</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-purple-100" />
                    <DropdownMenuItem className="hover:bg-purple-50">Settings</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.nav>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 flex gap-1.5 items-center py-1.5">
                  <span className="h-2 w-2 rounded-full bg-gold-300"></span>
                  Loan Officer
                </Badge>
                
                <Avatar className="h-8 w-8 border-2 border-gold-200">
                  <AvatarFallback className="bg-purple-100 text-purple-800">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-900 hover:border-gold-300 border border-transparent transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
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
        <div className="absolute top-1/2 right-0 w-1 h-48 bg-gradient-to-b from-transparent via-gold-300/30 to-transparent -z-10"></div>
        <div className="absolute top-1/4 left-0 w-1 h-48 bg-gradient-to-b from-transparent via-purple-300/30 to-transparent -z-10"></div>
      </main>

      <footer className="py-8 border-t border-purple-100 bg-white/60 backdrop-blur-md relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-purple-100 rounded-full p-1.5 mr-2">
              <Building className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-md font-semibold text-purple-800">Premium Finance</span>
          </div>
          <p className="text-sm text-purple-600">
            © {new Date().getFullYear()} Premium Finance. All rights reserved.
          </p>
          <div className="flex justify-center gap-10 mt-4 text-xs text-purple-500">
            <a href="#" className="hover-purple-gold hover:text-purple-700 transition-colors">Privacy Policy</a>
            <a href="#" className="hover-purple-gold hover:text-purple-700 transition-colors">Terms of Service</a>
            <a href="#" className="hover-purple-gold hover:text-purple-700 transition-colors">Contact Us</a>
          </div>
        </div>
        
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-300/70 to-transparent"></div>
        
        {/* Corner accents */}
        <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden -z-10">
          <div className="absolute bottom-0 right-0 w-48 h-48 border-t border-l border-purple-200/30 rounded-tl-full"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-32 h-32 overflow-hidden -z-10">
          <div className="absolute bottom-0 left-0 w-48 h-48 border-r border-b border-gold-200/30 rounded-tr-full"></div>
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
        ? 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 font-medium border-b-2 border-gold-300' 
        : 'text-purple-600 hover:bg-purple-50'
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
