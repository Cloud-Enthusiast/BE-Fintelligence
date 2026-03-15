import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// ────────────────────────────────────────────────────
// Types matching the Cloud Function response
// ────────────────────────────────────────────────────

export interface CibilAccount {
    accountType: string;
    accountNumber: string;
    ownershipIndicator: string;
    dateOpened: string;
    dateOfLastPayment: string;
    sanctionedAmount: number;
    currentBalance: number;
    amountOverdue: number;
    creditLimit: number;
    emiAmount: number;
    paymentStatus: string;
    accountStatus: string;
    suitFiledStatus: string;
    writtenOffAmount: number;
    settlementAmount: number;
    paymentHistoryPattern: string;
}

export interface CibilEnquiry {
    enquiryDate: string;
    memberName: string;
    enquiryPurpose: string;
    enquiryAmount: number;
}

export interface ExtractedCibilData {
    name: string;
    dateOfBirth: string;
    gender: string;
    panNumber: string;
    aadharNumber: string;
    passportNumber: string;
    voterId: string;
    drivingLicense: string;
    emails: string[];
    phones: string[];
    addresses: string[];
    cibilScore: number;
    scoreDate: string;
    totalAccounts: number;
    totalActiveAccounts: number;
    totalClosedAccounts: number;
    totalOverdueAccounts: number;
    zeroBalanceAccounts: number;
    totalSanctionedAmount: number;
    totalCurrentBalance: number;
    totalOutstandingAmount: number;
    totalOverdueAmount: number;
    totalCreditLimit: number;
    totalEmiAmount: number;
    totalWrittenOffAmount: number;
    totalSettlementAmount: number;
    maxDaysPastDue: number;
    accounts: CibilAccount[];
    enquiries: CibilEnquiry[];
    totalEnquiriesLast30Days: number;
    totalEnquiriesLast12Months: number;
    hasSettlement: boolean;
    hasWrittenOff: boolean;
    hasSuitFiled: boolean;
    hasOverdue: boolean;
    reportDate: string;
    reportSummary: string;
}

import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable } from "firebase/storage";
import { doc, onSnapshot } from "firebase/firestore";

// ────────────────────────────────────────────────────
// Main extraction function
// ────────────────────────────────────────────────────

export const extractCibilReport = async (
    file: File,
    onProgress?: (progress: number, status: 'uploading' | 'processing') => void
): Promise<ExtractedCibilData> => {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser;
        if (!user) {
            return reject(new Error("unauthenticated: Please log in to extract CIBIL reports."));
        }

        const uuid = crypto.randomUUID();
        const extension = file.name.split('.').pop() || 'pdf';
        const storagePath = `reports/${user.uid}/${uuid}.${extension}`;
        
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // Scale upload progress from 0 to 50%
                onProgress?.(progress * 0.5, "uploading");
            },
            (error) => {
                reject(error);
            },
            () => {
                // Upload complete, Document AI is processing in the background (50% to 100%)
                onProgress?.(50, "processing");
                
                const reportRef = doc(db, `users/${user.uid}/cibilReports/${uuid}`);
                const unsubscribe = onSnapshot(reportRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.status === "completed") {
                            unsubscribe();
                            onProgress?.(100, "processing");
                            resolve(data.data as ExtractedCibilData);
                        } else if (data.status === "error") {
                            unsubscribe();
                            reject(new Error(data.error || "Failed to process document."));
                        }
                    }
                }, (error) => {
                    unsubscribe();
                    reject(error);
                });
            }
        );
    });
};

// ────────────────────────────────────────────────────
// Utility: Format INR currency
// ────────────────────────────────────────────────────

export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};
