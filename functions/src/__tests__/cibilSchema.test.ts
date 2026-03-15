import { describe, it, expect } from 'vitest';
import { validateCibilData } from '../cibilSchema';

describe('Cibil Data Zod Schema Validation', () => {
    it('should successfully parse valid extracted data', () => {
        const validData = {
            name: "John Doe",
            dateOfBirth: "01-01-1980",
            gender: "Male",
            cibilScore: 750,
            hasSuitFiled: true,
            totalActiveAccounts: 2,
            accounts: [
                {
                    accountType: "Credit Card",
                    sanctionedAmount: 50000,
                    accountStatus: "Active",
                }
            ]
        };

        const result = validateCibilData(validData);
        expect(result.cibilScore).toBe(750);
        expect(result.hasSuitFiled).toBe(true);
        expect(result.accounts.length).toBe(1);
        expect(result.accounts[0].sanctionedAmount).toBe(50000);
    });

    it('should default missing properties properly', () => {
        const incompleteData = {
            name: "Jane Doe"
        };
        const result = validateCibilData(incompleteData);
        expect(result.name).toBe("Jane Doe");
        expect(result.cibilScore).toBe(0);
        expect(result.hasSuitFiled).toBe(false);
        expect(result.accounts).toEqual([]);
    });
});
