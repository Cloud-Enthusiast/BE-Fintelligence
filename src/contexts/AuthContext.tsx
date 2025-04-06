
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type UserRole = 'Loan Officer' | 'Applicant';

type User = {
  username: string;
  role: UserRole;
  name: string;
  avatar?: string;
  id?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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

  // Check for existing user session in localStorage and Supabase on mount
  useEffect(() => {
    const checkSession = async () => {
      // First check localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        return;
      }

      // Then check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (error) throw error;

          if (data) {
            const userData: User = {
              username: session.user.email || '',
              role: data.role as UserRole,
              name: data.full_name || '',
              avatar: '/avatar-placeholder.png',
              id: data.id
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string, loginType: 'officer' | 'applicant' = 'officer'): Promise<boolean> => {
    // For demo purposes - local authentication
    if (loginType === 'officer' && username === 'admin' && password === 'admin') {
      const user = {
        username: 'admin',
        role: 'Loan Officer' as UserRole,
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
    } 
    // For applicant login
    else if (loginType === 'applicant' && username === 'user' && password === 'user') {
      const user = {
        username: 'user',
        role: 'Applicant' as UserRole,
        name: 'John Smith',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: "Welcome back, John Smith",
      });
      
      return true;
    } 
    // Attempt to login with Supabase
    else {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });

        if (error) throw error;

        if (data.user) {
          // Fetch user profile from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', data.user.id)
            .single();

          if (profileError) throw profileError;

          const userData: User = {
            username: data.user.email || '',
            role: (profileData?.role || 'Applicant') as UserRole,
            name: profileData?.full_name || '',
            avatar: '/avatar-placeholder.png',
            id: profileData?.id
          };

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));

          toast({
            title: "Login successful",
            description: `Welcome back, ${userData.name}`,
          });

          return true;
        }
      } catch (error: any) {
        console.error('Login error:', error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid username or password",
        });
      }
    }
    
    return false;
  };

  const loginWithOTP = async (username: string, otp: string): Promise<boolean> => {
    // For demo purposes, any 6-digit OTP will succeed for the admin user
    if (username === 'admin' && otp.length === 6 && /^\d+$/.test(otp)) {
      const user = {
        username: 'admin',
        role: 'Loan Officer' as UserRole,
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
    } else if (username === 'user' && otp.length === 6 && /^\d+$/.test(otp)) {
      const user = {
        username: 'user',
        role: 'Applicant' as UserRole,
        name: 'John Smith',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: "Login successful",
        description: "Welcome back, John Smith",
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

  const logout = async () => {
    // Clear local storage
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    
    // Also sign out from Supabase
    await supabase.auth.signOut();
    
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
