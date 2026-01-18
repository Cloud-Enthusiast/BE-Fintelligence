import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Demo user for testing without backend
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@befinance.com',
  user_metadata: { full_name: 'Demo Loan Officer' }
};

const DEMO_PROFILE = {
  id: 'demo-profile-001',
  user_id: 'demo-user-001',
  full_name: 'Demo Loan Officer',
  email: 'demo@befinance.com',
  phone: '+91 98765 43210',
  role: 'loan_officer' as const
};

const DEMO_SESSION_KEY = 'be_finance_demo_session';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'loan_officer';
}

interface DemoUser {
  id: string;
  email: string;
  user_metadata: { full_name: string };
}

interface AuthContextType {
  user: DemoUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const storedSession = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        // Restore session regardless of whether it was demo or "real" (mocked)
        setUser(session.user || DEMO_USER);
        setProfile(session.profile || DEMO_PROFILE);
        setIsAuthenticated(true);
        setIsDemoMode(!!session.isDemo);
      } catch (e) {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Demo login - works without any backend
  const loginDemo = async (): Promise<boolean> => {
    try {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsAuthenticated(true);
      setIsDemoMode(true);

      // Persist demo session
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
        isDemo: true,
        user: DEMO_USER,
        profile: DEMO_PROFILE,
        timestamp: Date.now()
      }));

      toast({
        title: "Demo Mode Active",
        description: "Welcome! You're using BE Finance in demo mode.",
      });
      return true;
    } catch (error) {
      console.error('Demo login error:', error);
      return false;
    }
  };

  // Regular login - Mocked for frontend-only
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      user_metadata: { full_name: email.split('@')[0] }
    };

    const mockProfile: UserProfile = {
      id: 'profile-' + Math.random().toString(36).substr(2, 9),
      user_id: mockUser.id,
      full_name: email.split('@')[0],
      email: email,
      phone: null,
      role: 'loan_officer'
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setIsAuthenticated(true);
    setIsDemoMode(false); // It's a "real" login in this context

    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      isDemo: false,
      user: mockUser,
      profile: mockProfile,
      timestamp: Date.now()
    }));

    toast({
      title: "Welcome back!",
      description: "Successfully logged in.",
    });
    return true;
  };

  // Signup - Mocked for frontend-only
  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      user_metadata: { full_name: fullName }
    };

    const mockProfile: UserProfile = {
      id: 'profile-' + Math.random().toString(36).substr(2, 9),
      user_id: mockUser.id,
      full_name: fullName,
      email: email,
      phone: null,
      role: 'loan_officer'
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setIsAuthenticated(true);
    setIsDemoMode(false);

    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
      isDemo: false,
      user: mockUser,
      profile: mockProfile,
      timestamp: Date.now()
    }));

    toast({
      title: "Account created!",
      description: "Welcome to BE Finance.",
    });
    return true;
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
    sessionStorage.removeItem(DEMO_SESSION_KEY);

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoading,
      isDemoMode,
      login,
      loginDemo,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
