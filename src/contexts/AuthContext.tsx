import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

const SESSION_KEY = 'be_finance_session';

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
  login: (email: string, password: string) => Promise<boolean>;
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

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const storedSession = sessionStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setUser(session.user);
        setProfile(session.profile);
        setIsAuthenticated(true);
      } catch (e) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);


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

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
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

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
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
    sessionStorage.removeItem(SESSION_KEY);

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
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
