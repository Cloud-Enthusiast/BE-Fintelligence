
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'Loan Officer' | 'Applicant';

export type UserProfile = {
  id: string;
  role: UserRole;
  full_name: string;
  avatar?: string;
};

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
}
