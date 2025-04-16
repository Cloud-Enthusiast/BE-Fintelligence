
# BE Finance User Flows

This document outlines the main user flows in the BE Finance application, explaining the step-by-step processes users follow to accomplish key tasks.

## Authentication Flow

![Authentication Flow](https://via.placeholder.com/800x400?text=Authentication+Flow+Diagram)

### Login Process

1. User navigates to `/login` (or is redirected there when attempting to access a protected route)
2. User selects login type (Officer or Applicant)
3. User enters credentials:
   - Username/password login
   - OTP-based login (alternative)
4. After successful authentication:
   - Loan Officers are directed to `/dashboard`
   - Applicants are directed to `/application`
   - If the user was redirected from another page, they're returned to that page

## Loan Eligibility Assessment Flow

![Eligibility Flow](https://via.placeholder.com/800x400?text=Eligibility+Assessment+Flow+Diagram)

### Multi-Step Assessment Process

1. **Step 1: Business Information**
   - User enters business name, personal details, and contact information
   - Navigation: User clicks "Next" to proceed to step 2

2. **Step 2: Financial Details**
   - User enters financial information:
     - Monthly income (automatically calculates annual revenue)
     - Existing loan amount
     - Credit score
   - Navigation: User can go "Previous" or "Next"

3. **Step 3: Loan Requirements**
   - User specifies loan details:
     - Loan amount
     - Loan term (in months)
     - Business type
   - Navigation: User can go "Previous" or submit the form

4. **Step 4: Results**
   - System calculates eligibility based on provided information
   - User is shown eligibility result (eligible/ineligible)
   - If eligible, additional loan details and next steps are shown
   - User can save the assessment to their account

### Form Navigation Controls

- Navigation buttons appear in the form footer
- Progress indicator shows current step and completion status
- Form data is preserved between steps

## Officer Dashboard Flow

![Dashboard Flow](https://via.placeholder.com/800x400?text=Officer+Dashboard+Flow+Diagram)

1. Officer logs in and navigates to dashboard
2. Dashboard displays overview of applications
3. Officer can:
   - Review pending applications
   - Access analytics
   - Manage customer data

## Application Review Flow

![Review Flow](https://via.placeholder.com/800x400?text=Application+Review+Flow+Diagram)

1. Officer selects an application from the list
2. System displays detailed application information
3. Officer reviews applicant information, financials, and eligibility score
4. Officer makes decision (approve/reject/request more information)
