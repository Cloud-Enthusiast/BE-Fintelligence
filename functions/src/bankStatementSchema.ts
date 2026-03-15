import { z } from 'zod';

export const BankStatementSchema = z.object({
  averageMonthlyBalance: z.union([z.string(), z.number()]).transform(val => {
      if (typeof val === 'number') return val;
      const num = Number(val.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? 0 : num;
  }).default(0),

  cashFlowPattern: z.enum(['positive', 'negative', 'mixed', 'unknown']).default('unknown'),

  loanEMIs: z.union([z.string(), z.number()]).transform(val => {
      if (typeof val === 'number') return val;
      const num = Number(val.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? 0 : num;
  }).default(0),

  chequeBounces: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'number') return val;
    const num = Number(val.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  }).default(0),

  totalCredits: z.union([z.string(), z.number()]).transform(val => {
      if (typeof val === 'number') return val;
      const num = Number(val.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? 0 : num;
  }).default(0),

  totalDebits: z.union([z.string(), z.number()]).transform(val => {
      if (typeof val === 'number') return val;
      const num = Number(val.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? 0 : num;
  }).default(0),

  statementPeriod: z.string().default('Unknown'),
  
  accountNumber: z.string().default('Unknown'),
  
  analysis: z.string().optional()
});

export type ExtractedBankStatementData = z.infer<typeof BankStatementSchema>;

/**
 * Validates and sanitizes the raw output from Gemini using the BankStatementSchema.
 * If validation fails, throws a clear error detailing which fields were mismatched.
 */
export const validateBankStatementData = (rawData: any): ExtractedBankStatementData => {
    try {
        return BankStatementSchema.parse(rawData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Zod Validation Failed for Bank Statement:", JSON.stringify(error.errors, null, 2));
            throw new Error(`Data validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        throw error;
    }
};
