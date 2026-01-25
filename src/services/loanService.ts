import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface LoanApplicationData {
    userId: string;
    // Personal Details
    fullName: string;
    email: string;
    phone: string;
    panNumber: string;
    address: string;

    // Business Details
    businessName: string;
    businessType: string;
    yearsInBusiness: number;
    gstNumber?: string;
    gstFilingRegularity: string;

    // Financial Metrics
    annualRevenue: number;
    monthlyProfit: number;
    existingLoanAmount: number;
    monthlyEMI: number;
    creditScore: number;
    bankAccountNumber: string;
    ifscCode: string;
    averageMonthlyBalance: number;

    // Loan Requirements
    loanAmount: number;
    loanTerm: number;
    loanPurpose: string;
    collateralAvailable: string;
    loanType: string;

    // Metadata
    status: 'pending' | 'review' | 'approved' | 'rejected';
    submittedAt: any;
    eligibilityResult?: any;
}

export const submitLoanApplication = async (data: Omit<LoanApplicationData, 'status' | 'submittedAt'>) => {
    try {
        const docRef = await addDoc(collection(db, 'applications'), {
            ...data,
            status: 'pending',
            submittedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding loan application: ", error);
        throw error;
    }
};
