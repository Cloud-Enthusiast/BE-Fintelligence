import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
/*
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
*/
import { useAuth } from './AuthContext';

export interface LoanApplication {
  id: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
  annualRevenue: number;
  monthlyIncome: number;
  existingLoanAmount: number;
  loanAmount: number;
  loanTerm: number;
  creditScore: number;
  eligibilityScore: number;
  isEligible: boolean;
  rejectionReason?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApplicationContextType {
  applications: LoanApplication[];
  addApplication: (application: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const { user } = useAuth();

  // Load from localStorage for mock mode
  useEffect(() => {
    const stored = localStorage.getItem('mock_loan_applications');
    if (stored) {
      setApplications(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage for mock mode
  useEffect(() => {
    localStorage.setItem('mock_loan_applications', JSON.stringify(applications));
  }, [applications]);

  /*
  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }

    const q = query(
      collection(db, 'loan_applications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // ...
    });

    return () => unsubscribe();
  }, [user]);
  */

  const addApplication = async (application: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>) => {
    /*
    try {
      await addDoc(collection(db, 'loan_applications'), {
        ...application,
        createdAt: Timestamp.now(),
        // ...
      });
    } catch (error) {
      console.error('Error adding application:', error);
    }
    */

    // Mock add
    const newApp: LoanApplication = {
      ...application,
      id: 'app-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setApplications(prev => [newApp, ...prev]);
  };

  const updateApplicationStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    /*
    try {
      const docRef = doc(db, 'loan_applications', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
    */

    // Mock update
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, status } : app
    ));
  };

  return (
    <ApplicationContext.Provider value={{ applications, addApplication, updateApplicationStatus }}>
      {children}
    </ApplicationContext.Provider>
  );
};
