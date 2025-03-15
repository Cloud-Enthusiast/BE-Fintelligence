
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

type User = {
  username: string;
  role: string;
  name: string;
  avatar?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
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

  // Check for existing user session in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Normally would call an API, but for demo purposes we'll use a hardcoded check
    if (username === 'admin' && password === 'admin') {
      const user = {
        username: 'admin',
        role: 'Loan Officer',
        name: 'Alex Johnson',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: "Welcome back, Alex Johnson",
      });
      
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or password",
      });
      return false;
    }
  };

  const loginWithOTP = async (username: string, otp: string): Promise<boolean> => {
    // For demo purposes, any 6-digit OTP will succeed for the admin user
    if (username === 'admin' && otp.length === 6 && /^\d+$/.test(otp)) {
      const user = {
        username: 'admin',
        role: 'Loan Officer',
        name: 'Alex Johnson',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: "Welcome back, Alex Johnson",
      });
      
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or OTP",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginWithOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
