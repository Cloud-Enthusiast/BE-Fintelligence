import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { mockAuth, User } from '@/lib/mockAuth';

type UserRole = 'Loan Officer' | 'Applicant';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, loginType?: 'officer' | 'applicant') => Promise<boolean>;
  loginWithOTP: (username: string, otp: string) => Promise<boolean>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing user session on mount
  useEffect(() => {
    const checkSession = () => {
      setIsLoading(true);
      try {
        const session = mockAuth.getSession();
        if (session.data.session?.user) {
          setUser(session.data.session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = mockAuth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string, loginType: 'officer' | 'applicant' = 'officer'): Promise<boolean> => {
    try {
      const { user: authUser, error } = await mockAuth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        throw new Error(error);
      }

      if (authUser) {
        // Check if the user role matches the selected login type
        if (
          (loginType === 'officer' && authUser.role !== 'Loan Officer') ||
          (loginType === 'applicant' && authUser.role !== 'Applicant')
        ) {
          throw new Error('Incorrect login type selected for this user role.');
        }

        setUser(authUser);
        setIsAuthenticated(true);

        toast({
          title: "Login successful",
          description: `Welcome back, ${authUser.name}`,
        });

        return true;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials or incorrect login type selected.",
      });
    }

    return false;
  };

  const loginWithOTP = async (username: string, otp: string): Promise<boolean> => {
    // For demo purposes, accept any OTP that's "123456"
    if (otp === '123456') {
      return login(username, 'password'); // Use regular login with default password
    }

    toast({
      variant: "destructive",
      title: "OTP Login failed",
      description: "Invalid OTP. Use '123456' for demo.",
    });

    return false;
  };

  const logout = async () => {
    try {
      await mockAuth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginWithOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};