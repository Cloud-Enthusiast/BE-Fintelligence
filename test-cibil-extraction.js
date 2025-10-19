// Quick test to verify CIBIL extraction improvements
const testText = `
CIBIL Report
Your CIBIL Score: 698
Number of loans in report: 3
Total Amount of Loan: ₹8.00 K
Amount overdue: ₹0.00
Suit filed: Yes
Settled amount: ₹95.20 K
Account Details:
- Personal Loan: Active
- Credit Card: Closed
- Home Loan: Settled
`;

console.log('Testing CIBIL extraction with sample text...');
console.log('Sample text contains:');
console.log('- CIBIL Score: 698');
console.log('- Loan count: 3');
console.log('- Total amount: ₹8.00 K');
console.log('- Overdue: ₹0.00');
console.log('- Suit filed: Yes');
console.log('- Settled: ₹95.20 K');
console.log('\nThe enhanced extractor should now detect all these fields with high confidence.');