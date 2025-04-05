
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'Loan Officer' | 'Applicant';

type AuthUser = {
  username: string;
  role: UserRole;
  name: string;
  avatar?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, loginType?: 'officer' | 'applicant') => Promise<boolean>;
  loginWithOTP: (username: string, otp: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch the user profile when session changes
          setTimeout(() => {
            fetchUserProfile(currentSession.user);
          }, 0);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch user profile
  const fetchUserProfile = async (currentUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        const authUser: AuthUser = {
          username: currentUser.email || '',
          role: profile.role as UserRole,
          name: profile.full_name || currentUser.email?.split('@')[0] || 'User',
          avatar: '/avatar-placeholder.png',
        };
        
        setUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(authUser));
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // For backward compatibility - the demo login still works
  const login = async (username: string, password: string, loginType: 'officer' | 'applicant' = 'officer'): Promise<boolean> => {
    // Try Supabase login first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        // If Supabase login fails, try the mock login
        return mockLogin(username, password, loginType);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return mockLogin(username, password, loginType);
    }
  };

  // Mock login for backward compatibility
  const mockLogin = async (username: string, password: string, loginType: 'officer' | 'applicant'): Promise<boolean> => {
    // For officer login
    if (loginType === 'officer' && username === 'admin' && password === 'admin') {
      const mockUser = {
        username: 'admin',
        role: 'Loan Officer' as UserRole,
        name: 'Alex Johnson',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast({
        title: "Login successful",
        description: "Welcome back, Alex Johnson",
      });
      
      return true;
    } 
    // For applicant login
    else if (loginType === 'applicant' && username === 'user' && password === 'user') {
      const mockUser = {
        username: 'user',
        role: 'Applicant' as UserRole,
        name: 'John Smith',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast({
        title: "Login successful",
        description: "Welcome back, John Smith",
      });
      
      return true;
    } else if (username === 'Garry' && password === 'Thedevguy') {
      // Special case for the requested user
      const mockUser = {
        username: 'Garry',
        role: 'Loan Officer' as UserRole,
        name: 'Garry',
        avatar: '/avatar-placeholder.png',
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      toast({
        title: "Login successful",
        description: "Welcome back, Garry",
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

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
        return false;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser, 
      session, 
      isAuthenticated, 
      login, 
      loginWithOTP, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
