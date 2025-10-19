export interface FinancialData {
    cibilScore: string;
    numberOfLoans: string;
    totalLoanAmount: string;
    amountOverdue: string;
    suitFiledAndDefault: string;
    settledAndWrittenOff: string;
    reportDate: string;
    applicantName: string;
    panNumber: string;
    accountNumbers: string[];
}

export class FinancialDataExtractor {
    private text: string;

    constructor(text: string) {
        this.text = text.toLowerCase();
    }

    public extractAll(): FinancialData {
        return {
            cibilScore: this.extractCibilScore(),
            numberOfLoans: this.extractNumberOfLoans(),
            totalLoanAmount: this.extractTotalLoanAmount(),
            amountOverdue: this.extractAmountOverdue(),
            suitFiledAndDefault: this.extractSuitFiledAndDefault(),
            settledAndWrittenOff: this.extractSettledAndWrittenOff(),
            reportDate: this.extractReportDate(),
            applicantName: this.extractApplicantName(),
            panNumber: this.extractPanNumber(),
            accountNumbers: this.extractAccountNumbers()
        };
    }

    private extractCibilScore(): string {
        // Look for CIBIL score patterns
        const patterns = [
            /cibil\s*score\s*:?\s*(\d{3})/i,
            /credit\s*score\s*:?\s*(\d{3})/i,
            /score\s*:?\s*(\d{3})/i,
            /(\d{3})\s*cibil/i,
            /(\d{3})\s*score/i
        ];

        for (const pattern of patterns) {
            const match = this.text.match(pattern);
            if (match && match[1]) {
                const score = parseInt(match[1]);
                if (score >= 300 && score <= 900) {
                    return match[1];
                }
            }
        }
        return '';
    }

    private extractNumberOfLoans(): string {
        // Look for number of loans/accounts
        const patterns = [
            /(\d+)\s*(?:active\s*)?(?:loan|account)s?/i,
            /(?:loan|account)s?\s*:?\s*(\d+)/i,
            /total\s*(?:loan|account)s?\s*:?\s*(\d+)/i,
            /number\s*of\s*(?:loan|account)s?\s*:?\s*(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = this.text.match(pattern);
            if (match && match[1]) {
                const count = parseInt(match[1]);
                if (count >= 0 && count <= 50) { // Reasonable range
                    return match[1];
                }
            }
        }
        return '';
    }

    private extractTotalLoanAmount(): string {
        // Look for total loan amounts
        const patterns = [
            /total\s*(?:loan\s*)?amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /(?:loan\s*)?amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /sanctioned\s*amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /principal\s*amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i
        ];

        return this.extractAmount(patterns);
    }

    private extractAmountOverdue(): string {
        // Look for overdue amounts
        const patterns = [
            /(?:amount\s*)?overdue\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /overdue\s*amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /outstanding\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /dues\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /arrears\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i
        ];

        return this.extractAmount(patterns);
    }

    private extractSuitFiledAndDefault(): string {
        // Look for suit filed or default information
        const suitPatterns = [
            /suit\s*filed/i,
            /legal\s*action/i,
            /court\s*case/i,
            /litigation/i,
            /default/i,
            /npa/i,
            /non[\s-]?performing/i
        ];

        for (const pattern of suitPatterns) {
            if (this.text.match(pattern)) {
                // Try to extract associated amount
                const amountPatterns = [
                    new RegExp(pattern.source + '.*?(?:rs\\.?\\s*|₹\\s*)?([₹\\d,]+(?:\\.\\d{2})?)', 'i'),
                    new RegExp('(?:rs\\.?\\s*|₹\\s*)?([₹\\d,]+(?:\\.\\d{2})?).*?' + pattern.source, 'i')
                ];

                const amount = this.extractAmount(amountPatterns);
                if (amount) return amount;

                return 'Yes'; // Found indication but no amount
            }
        }
        return '';
    }

    private extractSettledAndWrittenOff(): string {
        // Look for settled or written off amounts
        const patterns = [
            /(?:settled|written\s*off)\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /settlement\s*amount\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /write[\s-]?off\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i,
            /closed\s*:?\s*(?:rs\.?\s*|₹\s*)?([₹\d,]+(?:\.\d{2})?)/i
        ];

        const amount = this.extractAmount(patterns);
        if (amount) return amount;

        // Check for status indicators
        const statusPatterns = [
            /settled/i,
            /written\s*off/i,
            /write[\s-]?off/i,
            /closed/i
        ];

        for (const pattern of statusPatterns) {
            if (this.text.match(pattern)) {
                return 'Yes';
            }
        }
        return '';
    }

    private extractReportDate(): string {
        // Look for report dates
        const patterns = [
            /(?:report\s*)?date\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
            /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
            /(?:generated\s*on|as\s*on)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
        ];

        for (const pattern of patterns) {
            const match = this.text.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }

    private extractApplicantName(): string {
        // Look for applicant name
        const patterns = [
            /(?:name|applicant)\s*:?\s*([a-z\s]{2,50})/i,
            /mr\.?\s*([a-z\s]{2,50})/i,
            /ms\.?\s*([a-z\s]{2,50})/i,
            /([a-z]+\s+[a-z]+(?:\s+[a-z]+)?)/i // Basic name pattern
        ];

        for (const pattern of patterns) {
            const match = this.text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                // Filter out common false positives
                if (!this.isCommonWord(name) && name.length > 3) {
                    return this.toTitleCase(name);
                }
            }
        }
        return '';
    }

    private extractPanNumber(): string {
        // Look for PAN number
        const pattern = /([a-z]{5}\d{4}[a-z])/i;
        const match = this.text.match(pattern);
        return match ? match[1].toUpperCase() : '';
    }

    private extractAccountNumbers(): string[] {
        // Look for account numbers
        const patterns = [
            /(?:account|a\/c)\s*(?:no\.?|number)\s*:?\s*([a-z0-9]{8,20})/gi,
            /([0-9]{10,16})/g // Generic number pattern for account numbers
        ];

        const accounts: string[] = [];
        for (const pattern of patterns) {
            const matches = this.text.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && !accounts.includes(match[1])) {
                    accounts.push(match[1]);
                }
            }
        }
        return accounts.slice(0, 5); // Limit to 5 accounts
    }

    private extractAmount(patterns: RegExp[]): string {
        for (const pattern of patterns) {
            const match = this.text.match(pattern);
            if (match && match[1]) {
                // Clean up the amount
                let amount = match[1].replace(/[₹,]/g, '').trim();
                if (amount && !isNaN(parseFloat(amount))) {
                    return this.formatAmount(amount);
                }
            }
        }
        return '';
    }

    private formatAmount(amount: string): string {
        const num = parseFloat(amount);
        if (num >= 10000000) { // 1 crore
            return `₹${(num / 10000000).toFixed(2)} Cr`;
        } else if (num >= 100000) { // 1 lakh
            return `₹${(num / 100000).toFixed(2)} L`;
        } else if (num >= 1000) { // 1 thousand
            return `₹${(num / 1000).toFixed(2)} K`;
        } else {
            return `₹${num.toLocaleString()}`;
        }
    }

    private isCommonWord(word: string): boolean {
        const commonWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
            'below', 'between', 'among', 'report', 'date', 'amount', 'loan', 'account',
            'cibil', 'score', 'total', 'number', 'overdue', 'settled', 'written', 'off'
        ];
        return commonWords.includes(word.toLowerCase());
    }

    private toTitleCase(str: string): string {
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
}