import { useState, useRef, useEffect, useCallback } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onSidebarToggle: () => void;
}

const PAGES = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Page' },
  { name: 'Document Processor', path: '/document-processor', icon: FileSearch, category: 'Tool' },
  { name: 'Applications', path: '/applications', icon: FileText, category: 'Page' },
  { name: 'Create Application', path: '/create-application', icon: FileText, category: 'Page' },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, category: 'Page' },
  { name: 'Customers', path: '/customers', icon: Users, category: 'Page' },
  { name: 'Risk Management', path: '/risk-management', icon: ShieldAlert, category: 'Tool' },
  { name: 'Eligibility Checker', path: '/eligibility-checker', icon: CheckCircle2, category: 'Tool' },
  { name: 'Settings', path: '/settings', icon: Settings, category: 'Page' },
  { name: 'Help & Support', path: '/help-support', icon: HelpCircle, category: 'Page' },
];

const DashboardHeader = ({ onSidebarToggle }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const { documents } = useDocuments();
  const navigate = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.displayName || user?.email || 'User';

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const matchedPages = q
    ? PAGES.filter(p => p.name.toLowerCase().includes(q))
    : PAGES.slice(0, 5);

  const matchedDocs = q
    ? documents.filter(d =>
        d.fileName.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q)
      )
    : documents.slice(0, 3);

  const hasResults = matchedPages.length > 0 || matchedDocs.length > 0;

  const handleSelect = useCallback((path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearchQuery('');
  }, [navigate]);

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
            <div ref={searchRef} className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none transition-colors peer-focus:text-primary" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search pages or documents..."
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-9 rounded-full transition-all"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
              />

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-11 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden z-[60]"
                  >
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">

                      {/* Pages section */}
                      {matchedPages.length > 0 && (
                        <div>
                          <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {q ? 'Pages' : 'Quick Navigation'}
                          </div>
                          {matchedPages.map((page) => (
                            <button
                              key={page.path}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors text-left group"
                              onMouseDown={() => handleSelect(page.path)}
                            >
                              <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                                <page.icon className="h-3.5 w-3.5 text-indigo-500 group-hover:text-white transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{page.name}</p>
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                {page.category}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Documents section */}
                      {matchedDocs.length > 0 && (
                        <div>
                          <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                            <span>Documents</span>
                            <span className="normal-case font-medium text-slate-300">{documents.length} total</span>
                          </div>
                          {matchedDocs.map((doc) => (
                            <button
                              key={doc.id}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-left group"
                              onMouseDown={() => handleSelect('/document-processor')}
                            >
                              <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                                <FileSearch className="h-3.5 w-3.5 text-emerald-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.fileName}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                                  {doc.documentType.replace(/_/g, ' ')}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results */}
                      {q && !hasResults && (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-slate-400">No results for <span className="font-semibold text-slate-600">"{searchQuery}"</span></p>
                          <p className="text-[11px] text-slate-300 mt-1">Try a page name or document filename</p>
                        </div>
                      )}
                    </div>

                    <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-[10px] text-slate-400">
                      <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">↵</kbd> to open</span>
                      <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">Esc</kbd> to close</span>
                    </div>
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
