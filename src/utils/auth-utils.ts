
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole, UserProfile } from '@/types/auth';

// Load user profile from database
export const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading user profile:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        role: data.role as UserRole,
        full_name: data.full_name || '',
        avatar: '/avatar-placeholder.png',
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
};

// Register new user
export const registerUser = async (
  email: string, 
  password: string, 
  fullName: string, 
  role: UserRole
): Promise<{ success: boolean; error?: string }> => {
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
      return { success: false, error: error.message };
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

      // After registration, automatically log the user in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auto-login after registration failed:', signInError);
        toast({
          variant: "destructive",
          title: "Login failed after registration",
          description: signInError.message,
        });
        return { success: false, error: signInError.message };
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created and you're now logged in",
      });
      return { success: true };
    }

    return { success: false, error: "Unknown error during registration" };
  } catch (error) {
    console.error('Registration error:', error);
    toast({
      variant: "destructive",
      title: "Registration failed",
      description: "An unexpected error occurred",
    });
    return { success: false, error: "Unexpected error during registration" };
  }
};

// Login with email and password
export const loginWithPassword = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // For demo accounts, handle them separately
    if (email === 'admin@example.com' && password === 'admin123') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        toast({
          title: "Login successful",
          description: "Welcome back, Admin",
        });
        return { success: true };
      }
    } else if (email === 'user@example.com' && password === 'user123') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        toast({
          title: "Login successful",
          description: "Welcome back, User",
        });
        return { success: true };
      }
    }

    // Regular login for other users
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
      return { success: false, error: error.message };
    }

    if (data?.user) {
      toast({
        title: "Login successful",
        description: "Welcome back",
      });
      return { success: true };
    }

    return { success: false, error: "Unknown error during login" };
  } catch (error) {
    console.error('Login error:', error);
    toast({
      variant: "destructive",
      title: "Login failed",
      description: "An unexpected error occurred",
    });
    return { success: false, error: "Unexpected error during login" };
  }
};

// Login with OTP (one-time password)
export const loginWithOneTimePassword = async (
  email: string, 
  otp: string
): Promise<{ success: boolean; error?: string }> => {
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
        return { success: true };
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
        return { success: true };
      }
    }
    
    toast({
      variant: "destructive",
      title: "Login failed",
      description: "Invalid OTP code",
    });
    return { success: false, error: "Invalid OTP code" };
  } catch (error) {
    console.error('OTP login error:', error);
    toast({
      variant: "destructive",
      title: "Login failed",
      description: "An unexpected error occurred",
    });
    return { success: false, error: "Unexpected error during OTP login" };
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
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
