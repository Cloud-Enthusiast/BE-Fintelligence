// Test the simple extraction approach
const testCibilText = `
CIBIL TransUnion Credit Information Report

Personal Information:
Name: Swetapadma Biranchi Mohanty Date Of Birth: XX/XX/XXXX
PAN: AUDPM6032B

Credit Summary:
Your CIBIL Score: 698
Number of loans in report: 3
Total Amount of Loan: ₹8.00 K
Amount overdue: ₹0.00

Account Details:
1. HDFC Bank - Personal Loan - Active
2. SBI - Credit Card - Closed  
3. ICICI Bank - Home Loan - Settled

Legal Status:
Suit filed: Yes
Default status: No

Settlement Information:
Settled amount: ₹95.20 K
Written off amount: ₹0.00
`;

console.log('=== SIMPLE CIBIL EXTRACTION TEST ===');
console.log('Input text contains clear field labels and values');
console.log('Expected results:');
console.log('- CIBIL Score: 698 (90% confidence)');
console.log('- Number of loans: 3 (90% confidence)');
console.log('- Total Amount: ₹8.00 K (90% confidence)');
console.log('- Amount overdue: ₹0.00 (90% confidence)');
console.log('- Suit filed: Yes (90% confidence)');
console.log('- Settled amount: ₹95.20 K (90% confidence)');
console.log('');
console.log('This simple approach should achieve 85%+ overall accuracy');
console.log('by directly finding values near their labels in the text.');