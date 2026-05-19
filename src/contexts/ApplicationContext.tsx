import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  panNumber?: string;
  loanPurpose?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested';
}

interface ApplicationContextType {
  applications: LoanApplication[];
  isLoading: boolean;
  addApplication: (application: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: LoanApplication['status']) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, 'loan_applications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const apps: LoanApplication[] = querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          const createdAt =
            d.createdAt instanceof Timestamp
              ? d.createdAt.toDate().toISOString()
              : typeof d.createdAt === 'string'
              ? d.createdAt
              : new Date().toISOString();

          return {
            id: docSnap.id,
            businessName: d.businessName ?? '',
            fullName: d.fullName ?? '',
            email: d.email ?? '',
            phone: d.phone ?? '',
            businessType: d.businessType ?? '',
            annualRevenue: d.annualRevenue ?? 0,
            monthlyIncome: d.monthlyIncome ?? d.monthlyProfit ?? 0,
            existingLoanAmount: d.existingLoanAmount ?? 0,
            loanAmount: d.loanAmount ?? 0,
            loanTerm: d.loanTerm ?? 0,
            creditScore: d.creditScore ?? 0,
            eligibilityScore:
              d.eligibilityScore ?? d.eligibilityResult?.overallScore ?? 0,
            isEligible: d.isEligible ?? d.eligibilityResult?.isEligible ?? false,
            rejectionReason: d.rejectionReason,
            panNumber: d.panNumber,
            loanPurpose: d.loanPurpose,
            createdAt,
            status: d.status ?? 'pending',
          };
        });
        setApplications(apps);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore snapshot error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addApplication = async (
    application: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>
  ) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'loan_applications'), {
        ...application,
        userId: user.uid,
        createdAt: Timestamp.now(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error adding application:', error);
      throw error;
    }
  };

  const updateApplicationStatus = async (
    id: string,
    status: LoanApplication['status']
  ) => {
    try {
      const docRef = doc(db, 'loan_applications', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  return (
    <ApplicationContext.Provider
      value={{ applications, isLoading, addApplication, updateApplicationStatus }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
