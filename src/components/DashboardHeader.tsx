import { useState } from 'react';
import {
  BellIcon,
  MenuIcon,
  SearchIcon,
  UserCircleIcon,
  ChevronDownIcon,
  InboxIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onSidebarToggle: () => void;
}

const DashboardHeader = ({ onSidebarToggle }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const displayName = user?.displayName || user?.email || 'User';

  return (
    <header className="sticky top-0 z-30 w-full glass-effect border-b border-border overflow-hidden" data-tour="dashboard-header">
      <div className="flex px-4 h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0"
            onClick={onSidebarToggle}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          <div className={`${showMobileSearch ? 'flex absolute inset-x-0 top-16 p-4 bg-background border-b border-border shadow-md z-40' : 'hidden'} md:flex md:relative md:top-0 md:bg-transparent md:border-none md:shadow-none md:p-0 flex-1 min-w-0 max-w-xs lg:max-w-md`}>
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search resources, clients, or loans..."
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-9 rounded-full transition-all input-transition"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border-[1.5px] border-background"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-border/50 shadow-lg">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-[300px] overflow-auto custom-scrollbar">
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <InboxIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No new notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">We'll notify you when something happens</p>
                </div>
              </div>
              <div className="p-2 border-t border-border bg-muted/30">
                <Button variant="ghost" size="sm" className="w-full text-xs font-medium text-primary">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border hidden md:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 hover:bg-muted/50 h-9 rounded-full border border-transparent hover:border-border transition-all">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <UserCircleIcon className="h-5 w-5" />
                </div>
                <span className="hidden md:inline-flex text-sm font-medium text-foreground truncate max-w-[120px]">
                  {displayName}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground hidden md:block opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-lg border-border/50">
              <div className="px-2 py-2.5">
                <p className="text-sm font-medium leading-none mb-1">{displayName}</p>
                <p className="text-xs text-muted-foreground leading-none">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/help-support" className="cursor-pointer">Help & Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  isAlert?: boolean;
  isSuccess?: boolean;
}

const NotificationItem = ({ title, description, time, isAlert, isSuccess }: NotificationItemProps) => {
  const getIconColor = () => {
    if (isAlert) return 'text-destructive bg-destructive/10 border-destructive/20';
    if (isSuccess) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  return (
    <div className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/30 last:border-0">
      <div className="flex gap-3">
        <div className={`mt-0.5 rounded-full p-1.5 h-8 w-8 flex items-center justify-center shrink-0 border ${getIconColor()}`}>
          {isAlert ? (
            <span className="text-xs">⚠️</span>
          ) : isSuccess ? (
            <span className="text-xs">✓</span>
          ) : (
            <span className="text-xs">📄</span>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          <p className="text-[10px] text-muted-foreground/70 font-medium">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
