import { z } from 'zod';

const toNumber = z.union([z.string(), z.number(), z.null()]).transform(val => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const num = Number(String(val).replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
}).default(0);

export const BankStatementSchema = z.object({
    accountHolderName: z.string().nullable().optional().default(''),
    bankName: z.string().nullable().optional().default(''),
    branchName: z.string().nullable().optional().default(''),
    accountNumber: z.string().nullable().optional().default('Unknown'),
    accountType: z.string().nullable().optional().default(''),
    ifscCode: z.string().nullable().optional().default(''),

    statementFromDate: z.string().nullable().optional().default(''),
    statementToDate: z.string().nullable().optional().default(''),
    statementPeriod: z.string().nullable().optional().default(''),

    openingBalance: toNumber,
    closingBalance: toNumber,
    totalCredits: toNumber,
    totalDebits: toNumber,
    averageMonthlyBalance: toNumber,
    minimumBalance: toNumber,
    maximumBalance: toNumber,

    numberOfCreditTransactions: toNumber,
    numberOfDebitTransactions: toNumber,
    chequeBounces: toNumber,
    nachEcsReturns: toNumber,
    loanEMIs: toNumber,

    inwardTransfers: toNumber,
    outwardTransfers: toNumber,
    salaryCredits: toNumber,
    cashWithdrawals: toNumber,
    cashDeposits: toNumber,

    cashFlowPattern: z.enum(['positive', 'negative', 'mixed', 'unknown']).default('unknown'),

    analysis: z.string().optional(),
});

export type ExtractedBankStatementData = z.infer<typeof BankStatementSchema>;

export const validateBankStatementData = (rawData: any): ExtractedBankStatementData => {
    try {
        return BankStatementSchema.parse(rawData);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const zodErr = error as any;
            console.error('Zod Validation Failed for Bank Statement:', JSON.stringify(zodErr.errors, null, 2));
            throw new Error(`Data validation failed: ${zodErr.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        throw error;
    }
};
