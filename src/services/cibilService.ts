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

// ────────────────────────────────────────────────────
// File → Base64 Conversion
// ────────────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// ────────────────────────────────────────────────────
// Main extraction function
// ────────────────────────────────────────────────────

export const extractCibilReport = async (
    file: File
): Promise<ExtractedCibilData> => {
    // Convert file to base64
    const fileBase64 = await fileToBase64(file);
    const mimeType = file.type || "application/pdf";

    // Call the Cloud Function
    const callable = httpsCallable<
        { fileBase64: string; mimeType: string },
        { success: boolean; data: ExtractedCibilData }
    >(functions, "extractCibilReport");

    const result = await callable({ fileBase64, mimeType });

    if (!result.data.success) {
        throw new Error("Failed to extract CIBIL report data.");
    }

    return result.data.data;
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
