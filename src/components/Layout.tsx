
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ScaleIcon, BarChart3Icon, DollarSignIcon, BuildingIcon } from 'lucide-react';
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  return <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <header className="sticky top-0 z-50">
        <div className="glass-effect border-b border-gray-200/50 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div className="flex items-center gap-2" initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }}>
                <div className="bg-finance-600 rounded-lg p-1.5">
                  <BuildingIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-finance-950">BE Finance</span>
              </motion.div>
              
              <motion.nav className="hidden md:flex space-x-1" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.3,
              delay: 0.1
            }}>
                <NavItem icon={<ScaleIcon className="h-4 w-4" />} label="Eligibility" active />
                <NavItem icon={<BarChart3Icon className="h-4 w-4" />} label="Analytics" />
                <NavItem icon={<DollarSignIcon className="h-4 w-4" />} label="Products" />
              </motion.nav>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 relative">
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4
      }} className="w-full">
          {children}
        </motion.div>
      </main>

      <footer className="py-6 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BE Finance. All rights reserved.
        </div>
      </footer>
    </div>;
};
interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
}
const NavItem = ({
  icon,
  label,
  active = false
}: NavItemProps) => {
  return <div className={`flex items-center gap-1.5 px-4 py-2 rounded-md cursor-pointer transition-all ${active ? 'bg-finance-100 text-finance-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
      <span>{label}</span>
    </div>;
};
export default Layout;
