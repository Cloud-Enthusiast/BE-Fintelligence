
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole, AuthContextType } from '@/types/auth';
import { 
  loadUserProfile,
  registerUser,
  loginWithPassword,
  loginWithOneTimePassword,
  logoutUser
} from '@/utils/auth-utils';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          console.log('User profile loaded:', userProfile);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        loadUserProfile(session.user.id).then(profile => {
          console.log('Initial profile load:', profile);
          setProfile(profile);
        });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register new user
  const register = async (email: string, password: string, fullName: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    const result = await registerUser(email, password, fullName, role);
    setIsLoading(false);
    return result.success;
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await loginWithPassword(email, password);
    setIsLoading(false);
    return result.success;
  };

  // Login with OTP
  const loginWithOTP = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await loginWithOneTimePassword(email, otp);
    setIsLoading(false);
    return result.success;
  };

  // Logout
  const logout = async () => {
    await logoutUser();
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
