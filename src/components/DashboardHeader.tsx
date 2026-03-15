import { useState } from 'react';
import {
  BellIcon,
  MenuIcon,
  SearchIcon,
  UserCircleIcon,
  ChevronDownIcon,
  InboxIcon,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  ShieldAlert,
  Settings,
  HelpCircle,
  FileSearch,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  X
} from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { documents } = useDocuments();
  const navigate = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const displayName = user?.displayName || user?.email || 'User';

  const PAGES = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Pages & Tools' },
    { name: 'Document Processor', path: '/document-processor', icon: FileSearch, category: 'Pages & Tools' },
    { name: 'Applications', path: '/applications', icon: FileText, category: 'Pages & Tools' },
    { name: 'Create Application', path: '/create-application', icon: FileText, category: 'Pages & Tools' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, category: 'Pages & Tools' },
    { name: 'Customers', path: '/customers', icon: Users, category: 'Pages & Tools' },
    { name: 'Risk Management', path: '/risk-management', icon: ShieldAlert, category: 'Pages & Tools' },
    { name: 'Eligibility Checker', path: '/eligibility-checker', icon: CheckCircle2, category: 'Pages & Tools' },
    { name: 'Settings', path: '/settings', icon: Settings, category: 'Pages' },
    { name: 'Help & Support', path: '/help-support', icon: HelpCircle, category: 'Pages' },
  ];

  const filteredPages = searchQuery 
    ? PAGES.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : PAGES.slice(0, 4);

  const filteredDocs = searchQuery
    ? documents.filter(d => d.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    : documents.slice(0, 3);

  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

  const handleSearchSelect = (item: any) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.fileName) {
      // Logic for document select if needed, e.g. navigate to processor with doc selected
      navigate('/document-processor');
    }
    
    // Save to recent
    const newRecent = [searchQuery || item.name || item.fileName, ...recentSearches.filter((s: string) => s !== (searchQuery || item.name || item.fileName))].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleClearRecent = (e: React.MouseEvent, search: string) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter((s: string) => s !== search);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    // Force re-render if needed or just let the next render catch it
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-effect border-b border-border overflow-hidden" data-tour="dashboard-header">
      <div className="flex px-4 h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1 justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0"
            onClick={onSidebarToggle}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          <div className={`${showMobileSearch ? 'flex absolute inset-x-0 top-16 p-4 bg-background border-b border-border shadow-md z-40' : 'hidden'} md:flex md:relative md:top-0 md:bg-transparent md:border-none md:shadow-none md:p-0 flex-1 min-w-0 max-w-md lg:max-w-xl mx-auto z-50`}>
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors pointer-events-none" />
              <Input
                type="search"
                placeholder="Search resources, clients, or loans..."
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-9 rounded-full transition-all input-transition text-center"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />

              <AnimatePresence>
                {isSearchFocused && searchQuery.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-11 left-0 w-full bg-background border border-border shadow-xl rounded-xl overflow-hidden z-[60] py-2 max-h-[300px] overflow-y-auto custom-scrollbar"
                  >
                    {filteredPages.length > 0 && (
                      <div className="px-2 pb-2">
                        <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages & Tools</div>
                        {filteredPages.map((page) => (
                          <div
                            key={page.name}
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors group"
                            onClick={() => handleSearchSelect(page)}
                          >
                            <page.icon className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
                            <span className="text-sm font-medium">{page.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredDocs.length > 0 && (
                      <div className="px-2 pt-2 border-t border-border">
                        <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Documents</div>
                        {filteredDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors group"
                            onClick={() => handleSearchSelect(doc)}
                          >
                            <FileText className="h-4 w-4 text-muted-foreground opacity-70 group-hover:opacity-100" />
                            <span className="text-sm font-medium truncate">{doc.fileName}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredPages.length === 0 && filteredDocs.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
