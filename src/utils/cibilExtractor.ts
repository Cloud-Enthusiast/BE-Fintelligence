export interface CibilAccount {
    accountType: string;
    accountNumber: string; // Last 4 digits usually visible
    memberDate: string; // Date opened
    sanctionedAmount: string;
    currentBalance: string;
    amountOverdue: string;
    paymentStatus: string; // e.g., "000" or "STD"
}

export interface CibilData {
    name: string;
    address: string;
    cibilScore: string;
    totalLoans: number;
    totalOverdueLoans: number;
    totalOutstandingAmount: string;
    totalSanctionedAmount: string;
    totalEmiAmount: string;
    daysPastDue: number; // Max DPD
    settlementAmount: string;
    accounts: CibilAccount[];
}

export const extractCibilData = (text: string): CibilData => {
    // Helper to clean currency strings
    const cleanAmount = (str: string) => str ? str.replace(/[^\d]/g, '') : "0";
    const formatAmount = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

    // 1. Basic Info Extraction
    // Patterns adjusted for common TransUnion CIBIL text dumps
    const nameMatch = text.match(/(?:Name|Consumer Name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?=\n|Date of Birth|Gender|$)/i);
    const scoreMatch = text.match(/(?:CIBIL TransUnion Score|Score|CIBIL SCORE)\s*[:\-]?\s*(\d{3})/i);
    // Address often spans multiple lines
    const addressMatch = text.match(/(?:Address|Consumer Address|OFFICE ADDRESS)\s*[:\-]?\s*([\s\S]+?)(?=\n\s*(?:Pin|Mobile|Phone|Email|Telephone|Cat|$))/i);

    // 2. Account Extraction
    // Strategy: Split text into "Account" blocks if possible, or iterate through repeating patterns.
    // TransUnion reports usually list accounts sequentially.
    // We will look for the "Account Type" keyword which usually starts a new block.

    const accounts: CibilAccount[] = [];
    const accountsSection = text.split(/(?:Account Type|Acct Type)\s*[:\-]?/i);

    // Skip the first chunk as it's the header/personal info
    for (let i = 1; i < accountsSection.length; i++) {
        const block = accountsSection[i];

        // Extract fields from this block
        const typeMatch = block.match(/^([^\n]+)/); // First line after split is usually type
        const type = typeMatch ? typeMatch[1].trim() : "Unknown";

        // Account Number
        const accNumMatch = block.match(/(?:Account Number|Acct No|Member ID)\s*[:\-]?\s*([A-Z0-9\*\-]+)/i);

        // Dates
        const dateMatch = block.match(/(?:Date Opened|Disbursed)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);

        // Amounts - Regex needs to be flexible for "Rs." or just numbers
        const sanctionMatch = block.match(/(?:Sanctioned Amount|High Credit|Credit Limit)\s*[:\-]?\s*(?:Rs\.?)?\s*([\d,]+)/i);
        const balanceMatch = block.match(/(?:Current Balance)\s*[:\-]?\s*(?:Rs\.?)?\s*([\d,]+)/i);
        const overdueMatch = block.match(/(?:Overdue Amount|Amount Overdue)\s*[:\-]?\s*(?:Rs\.?)?\s*([\d,]+)/i);
        const emiMatch = block.match(/(?:EMI Amount)\s*[:\-]?\s*(?:Rs\.?)?\s*([\d,]+)/i);

        const statusMatch = block.match(/(?:Payment Status|Account Status)\s*[:\-]?\s*([A-Za-z0-9\s]+)/i);

        accounts.push({
            accountType: type,
            accountNumber: accNumMatch ? accNumMatch[1] : "N/A",
            memberDate: dateMatch ? dateMatch[1] : "N/A",
            sanctionedAmount: sanctionMatch ? sanctionMatch[1] : "0",
            currentBalance: balanceMatch ? balanceMatch[1] : "0",
            amountOverdue: overdueMatch ? overdueMatch[1] : "0",
            paymentStatus: statusMatch ? statusMatch[1].trim() : "STD"
            // Note: Settlement amount, days default are often in specific "Days Past Due" tables which are harder to parse from raw text 
            // without spatial layout, but we can look for keywords in the block.
        });
    }

    // 3. Aggregate Calculations
    let totalSanctioned = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    let totalEmi = 0;
    let maxDaysDefault = 0;
    let settlementAmt = 0;
    let overdueCount = 0;

    accounts.forEach(acc => {
        totalSanctioned += parseInt(cleanAmount(acc.sanctionedAmount));
        totalOutstanding += parseInt(cleanAmount(acc.currentBalance));
        const overdue = parseInt(cleanAmount(acc.amountOverdue));
        totalOverdue += overdue;
        if (overdue > 0) overdueCount++;
    });

    // Heuristic for global settlement amount search
    const settlementMatch = text.match(/(?:Settlement Amount)\s*[:\-]?\s*(?:Rs\.?)?\s*([\d,]+)/i);
    if (settlementMatch) {
        settlementAmt = parseInt(cleanAmount(settlementMatch[1]));
    }

    // Heuristic for "Days Past Due" - finding the max number associated with DPD
    const dpdMatches = text.matchAll(/(\d+) Days Past Due/gi);
    for (const match of dpdMatches) {
        const days = parseInt(match[1]);
        if (days > maxDaysDefault) maxDaysDefault = days;
    }

    return {
        name: nameMatch ? nameMatch[1].trim() : "Not Found",
        address: addressMatch ? addressMatch[1].replace(/\n/g, ', ').trim().slice(0, 100) + "..." : "Not Found",
        cibilScore: scoreMatch ? scoreMatch[1] : "N/A",
        totalLoans: accounts.length,
        totalOverdueLoans: overdueCount,
        totalOutstandingAmount: formatAmount(totalOutstanding),
        totalSanctionedAmount: formatAmount(totalSanctioned),
        totalEmiAmount: formatAmount(totalEmi), // EMI is often harder to aggregate accurately
        daysPastDue: maxDaysDefault,
        settlementAmount: formatAmount(settlementAmt),
        accounts: accounts
    };
};
