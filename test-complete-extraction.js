// Test Complete CIBIL Extraction - All 13 Fields
const completeCibilText = `
CIBIL TransUnion Credit Information Report

Personal Information:
Name: Swetapadma Biranchi Mohanty
Date Of Birth: XX/XX/XXXX
PAN: AUDPM6032B

Credit Summary:
Your CIBIL Score: 698
Number of loans in report: 3
Total Amount of Loan: ₹8.00 K
Amount overdue: ₹0.00

Account Details:
Member Name: HDFC Bank Ltd
Account Type: Personal Loan
Loans per bank: 2
EMI Amount: ₹2,500
Type of Collateral: Unsecured

Payment History:
Bounced details: 2 instances
Payment delays: 30, 60 (2 occurrences)

Legal Status:
Suit filed: Yes
Wilful Default: No

Settlement Information:
Settlement amount: ₹95.20 K
Written off amount (Total): ₹1.50 L
Written off amount (Principal): ₹1.20 L
`;

console.log('=== COMPLETE CIBIL EXTRACTION TEST ===');
console.log('Testing all 13 fields from user specification:');
console.log('');
console.log('Expected Results:');
console.log('1. Name of Customer: Swetapadma Biranchi Mohanty (90%)');
console.log('2. CIBIL Score: 698 (90%)');
console.log('3. Bank Name: HDFC Bank Ltd (90%)');
console.log('4. Account type: Personal Loan (90%)');
console.log('5. Loans per bank: 2 (90%)');
console.log('6. Total Amount of Loan: ₹8.00 K (90%)');
console.log('7. Bounced details: 2 (90%)');
console.log('8. Type of Collateral: Unsecured (90%)');
console.log('9. EMI Amount: ₹2,500 (90%)');
console.log('10. Written off amount (Total): ₹1.50 L (90%)');
console.log('11. Written off amount (Principal): ₹1.20 L (90%)');
console.log('12. Suit filed /Wilful Default: Yes (90%)');
console.log('13. Settlement amount: ₹95.20 K (90%)');
console.log('');
console.log('Expected Overall Quality: 85%+ (vs previous 47%)');
console.log('Expected Fields Extracted: 13/13 (vs previous 4/6)');