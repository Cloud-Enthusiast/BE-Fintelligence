
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type UserRole = 'Loan Officer' | 'Applicant';

type UserProfile = {
  id: string;
  role: UserRole;
  full_name: string;
  avatar?: string;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string) => Promise<boolean>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize auth state
  useEffect(() => {
    setIsLoading(true);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          role: data.role as UserRole,
          full_name: data.full_name || '',
          avatar: '/avatar-placeholder.png',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Register new user
  const register = async (email: string, password: string, fullName: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Sign up with email and password
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
        setIsLoading(false);
        return false;
      }

      if (data?.user) {
        // Update the role if needed (by default trigger creates as Applicant)
        if (role === 'Loan Officer') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'Loan Officer' })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Error updating role:', updateError);
          }
        }

        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An unexpected error occurred",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        setIsLoading(false);
        return false;
      }

      if (data?.user) {
        toast({
          title: "Login successful",
          description: `Welcome back${profile?.full_name ? ', ' + profile.full_name : ''}`,
        });
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Login with OTP (one-time password)
  const loginWithOTP = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    // In a real implementation, this would use Supabase's OTP functionality
    // For demo purposes, we'll use a simulated OTP verification
    try {
      // This is a placeholder for actual OTP verification
      // In a production environment, you would verify the OTP with Supabase
      // For demo, we'll allow any 6-digit OTP to work with our demo emails
      if (email && otp.length === 6 && /^\d+$/.test(otp)) {
        // For demo purposes only - in real app, use supabase.auth.verifyOtp
        if (email === 'admin@example.com') {
          // Mock login as an officer for demo
          const { error } = await supabase.auth.signInWithPassword({
            email: 'admin@example.com',
            password: 'admin123',
          });
          
          if (error) throw error;
          
          toast({
            title: "Login successful",
            description: "Welcome back, Admin",
          });
          setIsLoading(false);
          return true;
        } else if (email === 'user@example.com') {
          // Mock login as an applicant for demo
          const { error } = await supabase.auth.signInWithPassword({
            email: 'user@example.com',
            password: 'user123',
          });
          
          if (error) throw error;
          
          toast({
            title: "Login successful",
            description: "Welcome back, User",
          });
          setIsLoading(false);
          return true;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid OTP code",
      });
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('OTP login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred",
      });
      setIsLoading(false);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAuthenticated, 
      isLoading,
      login, 
      register,
      loginWithOTP, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
