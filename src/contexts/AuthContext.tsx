
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
          // Fetch profile based on login type
          let profileData = null;
          let profileError = null;

          // Check if the authenticated user exists in Officer_profile
          const { data: officerProfile, error: officerError } = await supabase
            .from('Officer_profile')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (officerError && officerError.code !== 'PGRST116') {
            console.error('Error fetching officer profile during session check:', officerError);
            // Decide if you want to throw or handle gracefully
          }

          if (officerProfile) {
            profileData = officerProfile;
            // Assuming 'role' is stored in Officer_profile now
          } else {
             // If not in Officer_profile, check user_profiles (for applicants)
             const { data: applicantProfile, error: applicantError } = await supabase
               .from('user_profiles')
               .select('*')
               .eq('id', session.user.id)
               .single();

             if (applicantError && applicantError.code !== 'PGRST116') {
                console.error('Error fetching applicant profile during session check:', applicantError);
                // Decide if you want to throw or handle gracefully
             }
             if (applicantProfile) {
                profileData = applicantProfile;
             }
          }


          if (profileData) {
            const userData: User = {
              username: session.user.email || '',
              // Fetch role from the appropriate profile data
              role: (profileData as any).role as UserRole, // Cast to any to access role property dynamically
              name: (profileData as any).full_name || (profileData as any).first_name + ' ' + (profileData as any).last_name || '', // Adjust name fetching based on table
              avatar: '/avatar-placeholder.png',
              id: profileData.id
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
    // Attempt to login with Supabase using email/password
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username, // Use username input as email
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile based on login type
        let profileData = null;
        let profileError = null;

        if (loginType === 'officer') {
          const { data: officerProfile, error: officerError } = await supabase
            .from('Officer_profile')
            .select('*')
            .eq('id', data.user.id)
            .single();
          profileData = officerProfile;
          profileError = officerError;
        } else { // loginType === 'applicant'
          const { data: applicantProfile, error: applicantError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          profileData = applicantProfile;
          profileError = applicantError;
        }

        // Handle profile not found error specifically
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile during login:', profileError);
          throw new Error('Could not retrieve user profile after login.');
        }
        // If profileData is null/undefined (PGRST116 or other issue), handle it
        if (!profileData) {
           console.error('User profile not found for id:', data.user.id);
           throw new Error('User profile not found.');
        }

        // Check if the fetched role matches the loginType selected in the UI
        const fetchedRole = (profileData as any)?.role as UserRole; // Cast to any to access role property
        if ((loginType === 'officer' && fetchedRole !== 'Loan Officer') || (loginType === 'applicant' && fetchedRole !== 'Applicant')) {
           throw new Error(`Incorrect login type selected for this user role.`);
        }

        const userData: User = {
          username: data.user.email || '',
          role: fetchedRole,
          name: (profileData as any)?.full_name || (profileData as any)?.first_name + ' ' + (profileData as any)?.last_name || '', // Adjust name fetching based on table
          avatar: '/avatar-placeholder.png', // Keep placeholder or fetch from profile if available
          id: profileData.id // Use the fetched profile ID
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data locally

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
        description: error.message || "Invalid email or password, or incorrect login type selected.",
      });
    }

    return false;
  };

  const loginWithOTP = async (username: string, otp: string): Promise<boolean> => {
    // Attempt to verify OTP with Supabase
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: username, // Use username input as email
        token: otp,
        type: 'email', // Specify 'email' type for OTP verification
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile based on which table contains the user's profile
        let profileData = null;
        let profileError = null;

        // Check Officer_profile first
        const { data: officerProfile, error: officerError } = await supabase
          .from('Officer_profile')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (officerError && officerError.code !== 'PGRST116') {
           console.error('Error fetching officer profile after OTP login:', officerError);
           // Decide how to handle this error
        }

        if (officerProfile) {
           profileData = officerProfile;
        } else {
           // If not in Officer_profile, check user_profiles
           const { data: applicantProfile, error: applicantError } = await supabase
             .from('user_profiles')
             .select('*')
             .eq('id', data.user.id)
             .single();

           if (applicantError && applicantError.code !== 'PGRST116') {
              console.error('Error fetching applicant profile after OTP login:', applicantError);
              // Decide how to handle this error
           }
           if (applicantProfile) {
              profileData = applicantProfile;
           }
        }


        // Handle profile not found error specifically
        if (!profileData) {
           console.error('User profile not found for id:', data.user.id);
           throw new Error('User profile not found.');
        }

        // Note: OTP login doesn't typically involve selecting a role type in the UI,
        // so we don't need the role check here like in password login.
        // We just use the role fetched from the profile.
        const fetchedRole = (profileData as any).role as UserRole; // Cast to any to access role property

        const userData: User = {
          username: data.user.email || '',
          role: fetchedRole,
          name: (profileData as any).full_name || (profileData as any).first_name + ' ' + (profileData as any).last_name || '', // Adjust name fetching based on table
          avatar: '/avatar-placeholder.png',
          id: profileData.id
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
      console.error('OTP Login error:', error);
      toast({
        variant: "destructive",
        title: "OTP Login failed",
        description: error.message || "Invalid email or OTP.",
      });
    }

    return false;
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
