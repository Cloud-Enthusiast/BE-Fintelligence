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
                {isSearchFocused && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-background/20 backdrop-blur-[2px] z-[-1]"
                      onClick={() => setIsSearchFocused(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute top-11 left-0 w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-[60] flex flex-col max-h-[80vh]"
                    >
                      <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-2">Quick Search</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full" onClick={() => setIsSearchFocused(false)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="overflow-y-auto custom-scrollbar p-2 space-y-4">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && !searchQuery && (
                          <div className="space-y-1">
                            {recentSearches.map((s: string) => (
                              <div 
                                key={s} 
                                className="flex items-center justify-between group/row px-3 py-2 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors"
                                onClick={() => { setSearchQuery(s); }}
                              >
                                <div className="flex items-center gap-3">
                                  <History className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-300 font-medium">{s}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 opacity-0 group-hover/row:opacity-100 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded"
                                  onClick={(e) => handleClearRecent(e, s)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pages & Tools */}
                        <div className="space-y-1">
                          <h4 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter text-indigo-400/80 flex items-center justify-between">
                            Products & Pages
                            <ChevronDownIcon className="h-3 w-3 opacity-50" />
                          </h4>
                          <div className="grid grid-cols-1 gap-0.5">
                            {filteredPages.map((page) => (
                              <div 
                                key={page.name} 
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-all group/item overflow-hidden relative"
                                onClick={() => handleSearchSelect(page)}
                              >
                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-colors shrink-0">
                                  <page.icon className="h-4 w-4 text-indigo-400 group-hover/item:text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-200 group-hover/item:text-white truncate">{page.name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium group-hover/item:text-indigo-200">System Page • Tool</p>
                                </div>
                                <ExternalLink className="h-3 w-3 text-slate-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/item:animate-[shimmer_2s_infinite] pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Extracted Resources */}
                        <div className="space-y-1">
                          <h4 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter text-emerald-400/80 flex items-center justify-between">
                            Extracted Resources
                            <span className="text-[9px] lowercase font-medium opacity-50 px-1.5 py-0.5 rounded-full bg-emerald-500/10">{documents.length} items</span>
                          </h4>
                          <div className="grid grid-cols-1 gap-0.5">
                            {filteredDocs.length > 0 ? (
                              filteredDocs.map((doc) => (
                                <div 
                                  key={doc.id} 
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-all group/item"
                                  onClick={() => handleSearchSelect(doc)}
                                >
                                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                                    <FileSearch className="h-4 w-4 text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-200 truncate">{doc.fileName}</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{doc.documentType.replace('_', ' ')}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-8 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                                <p className="text-xs text-slate-500 italic">No resources matched "{searchQuery}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-950/50 border-t border-slate-800 flex items-center justify-center">
                        <p className="text-[10px] text-slate-500 font-medium">Tip: Find CIBIL, MSME, or Risk Reports instantly</p>
                      </div>
                    </motion.div>
                  </>
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
