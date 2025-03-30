
import { createContext, useState, useContext, ReactNode } from 'react';

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
  // Load from localStorage if available
  const storedApplications = localStorage.getItem('loanApplications');
  const initialApplications: LoanApplication[] = storedApplications 
    ? JSON.parse(storedApplications) 
    : [
        // Sample data
        {
          id: '1',
          businessName: 'Tech Innovations Inc.',
          fullName: 'John Smith',
          email: 'john@techinnovations.com',
          phone: '555-123-4567',
          businessType: 'Technology',
          annualRevenue: 1200000,
          monthlyIncome: 100000,
          existingLoanAmount: 250000,
          loanAmount: 500000,
          loanTerm: 36,
          creditScore: 720,
          eligibilityScore: 85,
          isEligible: true,
          createdAt: '2023-05-15T09:30:00Z',
          status: 'pending'
        },
        {
          id: '2',
          businessName: 'Green Valley Farms',
          fullName: 'Sarah Johnson',
          email: 'sarah@greenvalley.com',
          phone: '555-987-6543',
          businessType: 'Agriculture',
          annualRevenue: 750000,
          monthlyIncome: 62500,
          existingLoanAmount: 100000,
          loanAmount: 350000,
          loanTerm: 60,
          creditScore: 680,
          eligibilityScore: 72,
          isEligible: true,
          createdAt: '2023-05-20T14:15:00Z',
          status: 'approved'
        },
        {
          id: '3',
          businessName: 'Downtown Cafe',
          fullName: 'Michael Brown',
          email: 'michael@downtowncafe.com',
          phone: '555-456-7890',
          businessType: 'Food & Beverage',
          annualRevenue: 450000,
          monthlyIncome: 37500,
          existingLoanAmount: 75000,
          loanAmount: 200000,
          loanTerm: 24,
          creditScore: 640,
          eligibilityScore: 65,
          isEligible: true,
          createdAt: '2023-06-02T11:45:00Z',
          status: 'rejected',
          rejectionReason: 'Insufficient cash flow'
        },
        {
          id: '4',
          businessName: 'Elite Construction LLC',
          fullName: 'Robert Williams',
          email: 'robert@eliteconstruction.com',
          phone: '555-222-3333',
          businessType: 'Construction',
          annualRevenue: 3500000,
          monthlyIncome: 291667,
          existingLoanAmount: 1200000,
          loanAmount: 1500000,
          loanTerm: 48,
          creditScore: 750,
          eligibilityScore: 88,
          isEligible: true,
          createdAt: '2023-06-10T16:20:00Z',
          status: 'pending'
        },
        {
          id: '5',
          businessName: 'Wellness Spa & Salon',
          fullName: 'Jennifer Davis',
          email: 'jennifer@wellnessspa.com',
          phone: '555-888-9999',
          businessType: 'Health & Beauty',
          annualRevenue: 600000,
          monthlyIncome: 50000,
          existingLoanAmount: 150000,
          loanAmount: 300000,
          loanTerm: 36,
          creditScore: 710,
          eligibilityScore: 79,
          isEligible: true,
          createdAt: '2023-06-15T13:10:00Z',
          status: 'pending'
        },
        {
          id: '6',
          businessName: 'Global Shipping Co.',
          fullName: 'David Wilson',
          email: 'david@globalshipping.com',
          phone: '555-444-5555',
          businessType: 'Logistics',
          annualRevenue: 5200000,
          monthlyIncome: 433333,
          existingLoanAmount: 2000000,
          loanAmount: 2500000,
          loanTerm: 60,
          creditScore: 780,
          eligibilityScore: 92,
          isEligible: true,
          createdAt: '2023-06-18T10:05:00Z',
          status: 'approved'
        },
        {
          id: '7',
          businessName: 'Modern Retail Outlet',
          fullName: 'Lisa Taylor',
          email: 'lisa@modernretail.com',
          phone: '555-777-8888',
          businessType: 'Retail',
          annualRevenue: 950000,
          monthlyIncome: 79167,
          existingLoanAmount: 300000,
          loanAmount: 450000,
          loanTerm: 36,
          creditScore: 660,
          eligibilityScore: 68,
          isEligible: true,
          createdAt: '2023-06-20T15:30:00Z',
          status: 'pending'
        },
        {
          id: '8',
          businessName: 'Creative Media Agency',
          fullName: 'Kevin Martin',
          email: 'kevin@creativemedia.com',
          phone: '555-333-2222',
          businessType: 'Marketing',
          annualRevenue: 800000,
          monthlyIncome: 66667,
          existingLoanAmount: 180000,
          loanAmount: 400000,
          loanTerm: 48,
          creditScore: 700,
          eligibilityScore: 76,
          isEligible: true,
          createdAt: '2023-06-22T09:45:00Z',
          status: 'pending'
        },
        {
          id: '9',
          businessName: 'Urban Property Management',
          fullName: 'Amanda Harris',
          email: 'amanda@urbanproperty.com',
          phone: '555-111-0000',
          businessType: 'Real Estate',
          annualRevenue: 2800000,
          monthlyIncome: 233333,
          existingLoanAmount: 1500000,
          loanAmount: 1200000,
          loanTerm: 60,
          creditScore: 740,
          eligibilityScore: 85,
          isEligible: true,
          createdAt: '2023-06-25T14:20:00Z',
          status: 'approved'
        },
        {
          id: '10',
          businessName: 'Fresh Food Delivery',
          fullName: 'Thomas Clark',
          email: 'thomas@freshfood.com',
          phone: '555-666-7777',
          businessType: 'Food & Beverage',
          annualRevenue: 520000,
          monthlyIncome: 43333,
          existingLoanAmount: 100000,
          loanAmount: 250000,
          loanTerm: 24,
          creditScore: 630,
          eligibilityScore: 55,
          isEligible: false,
          rejectionReason: 'Low credit score and high debt ratio',
          createdAt: '2023-06-28T11:15:00Z',
          status: 'rejected'
        }
      ];

  const [applications, setApplications] = useState<LoanApplication[]>(initialApplications);

  // Save to localStorage whenever applications change
  const updateAndSave = (newApplications: LoanApplication[]) => {
    setApplications(newApplications);
    localStorage.setItem('loanApplications', JSON.stringify(newApplications));
  };

  const addApplication = (application: Omit<LoanApplication, 'id' | 'createdAt' | 'status'>) => {
    const newApplication: LoanApplication = {
      ...application,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    updateAndSave([newApplication, ...applications]);
  };

  const updateApplicationStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedApplications = applications.map(app => 
      app.id === id ? { ...app, status } : app
    );
    updateAndSave(updatedApplications);
  };

  return (
    <ApplicationContext.Provider value={{ applications, addApplication, updateApplicationStatus }}>
      {children}
    </ApplicationContext.Provider>
  );
};
