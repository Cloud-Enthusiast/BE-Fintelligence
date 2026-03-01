import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  BarChart3Icon,
  UsersIcon,
  AlertTriangleIcon,
  SettingsIcon,
  HelpCircleIcon,
  BuildingIcon,
  ScanTextIcon,
  CheckCircle2Icon
} from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
}

const DashboardSidebar = ({ isOpen }: DashboardSidebarProps) => {
  const location = useLocation();

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-border bg-sidebar shrink-0 ${isOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-16'}`}>
      <div className="h-full flex flex-col">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-border bg-sidebar/50">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 bg-primary rounded-lg p-2 shadow-sm">
              <BuildingIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="text-xl font-bold tracking-tight text-sidebar-foreground truncate whitespace-nowrap">
                BridgeEasy
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboardIcon size={20} />}
              title="Overview"
              path="/dashboard"
              isOpen={isOpen}
              active={location.pathname === '/dashboard'}
            />
            <SidebarItem
              icon={<FileTextIcon size={20} />}
              title="Applications"
              path="/applications"
              isOpen={isOpen}
              active={location.pathname.startsWith('/application')}
              dataTour="sidebar-applications"
            />
            <SidebarItem
              icon={<BarChart3Icon size={20} />}
              title="Analytics"
              path="/analytics"
              isOpen={isOpen}
              active={location.pathname === '/analytics'}
            />
            <SidebarItem
              icon={<UsersIcon size={20} />}
              title="Customers"
              path="/customers"
              isOpen={isOpen}
              active={location.pathname === '/customers'}
            />
          </div>

          <div className="mt-8 mb-4">
            {isOpen && (
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tools
              </span>
            )}
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={<ScanTextIcon size={20} />}
              title="Doc Processor"
              path="/document-processor"
              isOpen={isOpen}
              active={location.pathname === '/document-processor'}
              dataTour="sidebar-document-processor"
            />
            <SidebarItem
              icon={<CheckCircle2Icon size={20} />}
              title="Eligibility Check"
              path="/eligibility-checker"
              isOpen={isOpen}
              active={location.pathname === '/eligibility-checker'}
            />
            <SidebarItem
              icon={<AlertTriangleIcon size={20} />}
              title="Risk Engine"
              path="/risk-management"
              isOpen={isOpen}
              active={location.pathname === '/risk-management'}
            />
          </div>

          <div className="mt-8 mb-4">
            {isOpen && (
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
              </span>
            )}
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={<SettingsIcon size={20} />}
              title="Settings"
              path="/settings"
              isOpen={isOpen}
              active={location.pathname === '/settings'}
            />
            <SidebarItem
              icon={<HelpCircleIcon size={20} />}
              title="Help & Support"
              path="/help-support"
              isOpen={isOpen}
              active={location.pathname === '/help-support'}
            />
          </div>
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
  dataTour?: string;
}

const SidebarItem = ({ icon, title, path, isOpen, active = false, dataTour }: SidebarItemProps) => (
  <div data-tour={dataTour}>
    <Link
      to={path}
      className={`group flex items-center p-2.5 rounded-lg transition-all duration-200 relative overflow-hidden ${active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
        } ${!isOpen && 'justify-center'}`}
      title={!isOpen ? title : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
      )}
      <span className={`shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      {isOpen && (
        <span className="ml-3 truncate">
          {title}
        </span>
      )}
    </Link>
  </div>
);

export default DashboardSidebar;
