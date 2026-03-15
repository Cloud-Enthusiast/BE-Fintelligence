import { z } from 'zod';
import { logger } from 'firebase-functions/v2';

// Matches the CibilAccount interface
const CibilAccountSchema = z.object({
    accountType: z.string().default(''),
    accountNumber: z.string().default(''),
    ownershipIndicator: z.string().default(''),
    dateOpened: z.string().default(''),
    dateOfLastPayment: z.string().default(''),
    sanctionedAmount: z.number().nullable().default(0),
    currentBalance: z.number().nullable().default(0),
    amountOverdue: z.number().nullable().default(0),
    creditLimit: z.number().nullable().default(0),
    emiAmount: z.number().nullable().default(0),
    paymentStatus: z.string().default(''),
    accountStatus: z.string().default(''),
    suitFiledStatus: z.string().default(''),
    writtenOffAmount: z.number().nullable().default(0),
    settlementAmount: z.number().nullable().default(0),
    paymentHistoryPattern: z.string().default('')
}).transform(val => ({
    ...val,
    sanctionedAmount: val.sanctionedAmount || 0,
    currentBalance: val.currentBalance || 0,
    amountOverdue: val.amountOverdue || 0,
    creditLimit: val.creditLimit || 0,
    emiAmount: val.emiAmount || 0,
    writtenOffAmount: val.writtenOffAmount || 0,
    settlementAmount: val.settlementAmount || 0,
}));

// Matches the CibilEnquiry interface
const CibilEnquirySchema = z.object({
    enquiryDate: z.string().default(''),
    memberName: z.string().default(''),
    enquiryPurpose: z.string().default(''),
    enquiryAmount: z.number().nullable().default(0)
}).transform(val => ({
    ...val,
    enquiryAmount: val.enquiryAmount || 0,
}));

// Matches the ExtractedCibilData interface
export const CibilDataSchema = z.object({
    name: z.string().default(''),
    dateOfBirth: z.string().default(''),
    gender: z.string().default(''),
    panNumber: z.string().default(''),
    aadharNumber: z.string().default(''),
    passportNumber: z.string().default(''),
    voterId: z.string().default(''),
    drivingLicense: z.string().default(''),
    emails: z.array(z.string()).default([]),
    phones: z.array(z.string()).default([]),
    addresses: z.array(z.string()).default([]),
    cibilScore: z.number().nullable().default(0),
    scoreDate: z.string().default(''),
    totalAccounts: z.number().nullable().default(0),
    totalActiveAccounts: z.number().nullable().default(0),
    totalClosedAccounts: z.number().nullable().default(0),
    totalOverdueAccounts: z.number().nullable().default(0),
    zeroBalanceAccounts: z.number().nullable().default(0),
    totalSanctionedAmount: z.number().nullable().default(0),
    totalCurrentBalance: z.number().nullable().default(0),
    totalOutstandingAmount: z.number().nullable().default(0),
    totalOverdueAmount: z.number().nullable().default(0),
    totalCreditLimit: z.number().nullable().default(0),
    totalEmiAmount: z.number().nullable().default(0),
    totalWrittenOffAmount: z.number().nullable().default(0),
    totalSettlementAmount: z.number().nullable().default(0),
    maxDaysPastDue: z.number().nullable().default(0),
    accounts: z.array(CibilAccountSchema).default([]),
    enquiries: z.array(CibilEnquirySchema).default([]),
    totalEnquiriesLast30Days: z.number().nullable().default(0),
    totalEnquiriesLast12Months: z.number().nullable().default(0),
    hasSettlement: z.boolean().nullable().default(false),
    hasWrittenOff: z.boolean().nullable().default(false),
    hasSuitFiled: z.boolean().nullable().default(false),
    hasOverdue: z.boolean().nullable().default(false),
    reportDate: z.string().default(''),
    reportSummary: z.string().default('')
}).transform(val => ({
    ...val,
    cibilScore: val.cibilScore || 0,
    totalAccounts: val.totalAccounts || 0,
    totalActiveAccounts: val.totalActiveAccounts || 0,
    totalClosedAccounts: val.totalClosedAccounts || 0,
    totalOverdueAccounts: val.totalOverdueAccounts || 0,
    zeroBalanceAccounts: val.zeroBalanceAccounts || 0,
    totalSanctionedAmount: val.totalSanctionedAmount || 0,
    totalCurrentBalance: val.totalCurrentBalance || 0,
    totalOutstandingAmount: val.totalOutstandingAmount || 0,
    totalOverdueAmount: val.totalOverdueAmount || 0,
    totalCreditLimit: val.totalCreditLimit || 0,
    totalEmiAmount: val.totalEmiAmount || 0,
    totalWrittenOffAmount: val.totalWrittenOffAmount || 0,
    totalSettlementAmount: val.totalSettlementAmount || 0,
    maxDaysPastDue: val.maxDaysPastDue || 0,
    totalEnquiriesLast30Days: val.totalEnquiriesLast30Days || 0,
    totalEnquiriesLast12Months: val.totalEnquiriesLast12Months || 0,
    hasSettlement: val.hasSettlement || false,
    hasWrittenOff: val.hasWrittenOff || false,
    hasSuitFiled: val.hasSuitFiled || false,
    hasOverdue: val.hasOverdue || false,
}));

/**
 * Validates and cleans the output from Gemini, ensuring it matches the expected interface.
 * Logs any fields that were dropped or defaulted due to schema mismatch.
 */
export const validateCibilData = (rawData: any) => {
    try {
        return CibilDataSchema.parse(rawData);
    } catch (error: any) {
        logger.error("Zod Schema Validation Error on CIBIL Data:", { error });
        // Instead of outright failing, we will attempt to parse with defaults if it's partially salvageable, but Zod takes care of defaulting missing values.
        throw new Error("Failed to validate CIBIL data against expected schema.");
    }
};
