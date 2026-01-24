import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
/*
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
*/
import { toast } from '@/hooks/use-toast';

// Temporary mock user type since Firebase User is commented out
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const SESSION_KEY = 'be_finance_session';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'loan_officer';
}

interface AuthContextType {
  user: FirebaseUser | null;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    /*
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        console.error('No such profile!');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    */
  };

  useEffect(() => {
    /*
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
    */

    // Simple mock initialization
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      const storedProfile = localStorage.getItem('mock_profile');
      if (storedProfile) setProfile(JSON.parse(storedProfile));
    }
    setIsLoading(false);
  }, []);


  const login = async (email: string, password: string): Promise<boolean> => {
    /*
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ... toast
      return true;
    } catch (error: any) {
      // ... toast
      return false;
    }
    */

    // Mock login
    await new Promise(r => setTimeout(r, 800));
    const mockUser = { uid: 'mock-123', email, displayName: email.split('@')[0] };
    const mockProfile: UserProfile = {
      id: 'prof-123',
      user_id: 'mock-123',
      full_name: email.split('@')[0],
      email: email,
      phone: null,
      role: 'loan_officer'
    };

    setUser(mockUser as any);
    setProfile(mockProfile);
    setIsAuthenticated(true);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mock_profile', JSON.stringify(mockProfile));

    toast({ title: "Welcome back!", description: "Log in successful (Mock Mode)" });
    return true;
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    /*
    try {
      // Firebase signup logic...
    } catch (error: any) {
      // ...
    }
    */

    // Mock signup
    await new Promise(r => setTimeout(r, 800));
    const mockUser = { uid: 'mock-' + Date.now(), email, displayName: fullName };
    const mockProfile: UserProfile = {
      id: 'prof-' + Date.now(),
      user_id: mockUser.uid,
      full_name: fullName,
      email: email,
      phone: null,
      role: 'loan_officer'
    };

    setUser(mockUser as any);
    setProfile(mockProfile);
    setIsAuthenticated(true);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mock_profile', JSON.stringify(mockProfile));

    toast({ title: "Account created!", description: "Welcome (Mock Mode)" });
    return true;
  };

  const logout = async () => {
    /*
    try {
      await signOut(auth);
      // ... toast
    } catch (error) {
      console.error('Logout error:', error);
    }
    */

    // Mock logout
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_profile');
    toast({ title: "Logged out", description: "Successful (Mock Mode)" });
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
