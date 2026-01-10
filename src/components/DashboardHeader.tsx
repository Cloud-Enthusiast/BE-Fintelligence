import { useState } from 'react';
import { 
  BellIcon, 
  MenuIcon, 
  SearchIcon, 
  UserCircleIcon 
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
import { UserProfile } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  onSidebarToggle: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
}

const DashboardHeader = ({ onSidebarToggle, profile, onLogout }: DashboardHeaderProps) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const displayName = profile?.full_name || profile?.email || 'User';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onSidebarToggle}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex"
            onClick={onSidebarToggle}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          <div className={`${showMobileSearch ? 'flex' : 'hidden'} md:flex relative w-full md:w-64 lg:w-80`}>
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-auto">
                <NotificationItem 
                  title="New Loan Application" 
                  description="Tech Innovations Inc. has submitted a new loan application"
                  time="5 minutes ago"
                />
                <NotificationItem 
                  title="Risk Alert" 
                  description="AI detected potential risk issues with Oceanview Resorts"
                  time="1 hour ago"
                  isAlert
                />
                <NotificationItem 
                  title="Loan Approved" 
                  description="Green Valley Farms loan application was approved"
                  time="3 hours ago"
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2 pl-2 pr-4">
                <UserCircleIcon className="h-8 w-8" />
                <span className="hidden md:inline font-medium">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
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
}

const NotificationItem = ({ title, description, time, isAlert }: NotificationItemProps) => (
  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
    <div className="flex gap-3">
      <div className={`rounded-full p-2 h-fit ${isAlert ? 'bg-red-100' : 'bg-blue-100'}`}>
        {isAlert ? (
          <div className="h-4 w-4 text-red-600">⚠️</div>
        ) : (
          <div className="h-4 w-4 text-blue-600">📋</div>
        )}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
        <div className="text-xs text-gray-500 mt-1">{time}</div>
      </div>
    </div>
  </div>
);

export default DashboardHeader;
