
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboardIcon, 
  FileTextIcon, 
  BarChart3Icon, 
  UsersIcon, 
  AlertTriangleIcon, 
  SettingsIcon, 
  HelpCircleIcon,
  BuildingIcon
} from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
}

const DashboardSidebar = ({ isOpen }: DashboardSidebarProps) => {
  const location = useLocation();
  
  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-16'
    }`}>
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-finance-600 rounded-lg p-1.5">
              <BuildingIcon className={`text-white ${isOpen ? 'h-5 w-5' : 'h-6 w-6'}`} />
            </div>
            {isOpen && <span className="text-xl font-semibold text-finance-950">BE Finance</span>}
          </Link>
        </div>
        
        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-2">
            <SidebarItem 
              icon={<LayoutDashboardIcon />} 
              title="Dashboard" 
              path="/dashboard" 
              isOpen={isOpen}
              active={location.pathname === '/dashboard'}
            />
            <SidebarItem 
              icon={<FileTextIcon />} 
              title="Applications" 
              path="/applications" 
              isOpen={isOpen}
              active={location.pathname === '/applications'}
            />
            <SidebarItem 
              icon={<BarChart3Icon />} 
              title="Analytics" 
              path="/analytics" 
              isOpen={isOpen}
              active={location.pathname === '/analytics'}
            />
            <SidebarItem 
              icon={<UsersIcon />} 
              title="Customers" 
              path="/customers" 
              isOpen={isOpen}
              active={location.pathname === '/customers'}
            />
            <SidebarItem 
              icon={<AlertTriangleIcon />} 
              title="Risk Management" 
              path="/risk-management" 
              isOpen={isOpen} 
              active={location.pathname === '/risk-management'}
            />
            
            <li className="pt-4 mt-4 border-t border-gray-200">
              <span className={`px-2 text-xs font-semibold text-gray-500 uppercase ${!isOpen && 'hidden'}`}>
                Settings
              </span>
            </li>
            
            <SidebarItem 
              icon={<SettingsIcon />} 
              title="Settings" 
              path="/settings" 
              isOpen={isOpen}
              active={location.pathname === '/settings'} 
            />
            <SidebarItem 
              icon={<HelpCircleIcon />} 
              title="Help & Support" 
              path="/help-support" 
              isOpen={isOpen}
              active={location.pathname === '/help-support'}
            />
          </ul>
        </div>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  isOpen: boolean;
  active?: boolean;
}

const SidebarItem = ({ icon, title, path, isOpen, active = false }: SidebarItemProps) => (
  <li>
    <Link
      to={path}
      className={`flex items-center p-2 rounded-lg transition-colors ${
        active 
          ? 'bg-finance-50 text-finance-700' 
          : 'text-gray-500 hover:bg-gray-100'
      } ${!isOpen && 'justify-center'}`}
    >
      <span className="text-lg">{icon}</span>
      {isOpen && <span className="ml-3">{title}</span>}
    </Link>
  </li>
);

export default DashboardSidebar;
