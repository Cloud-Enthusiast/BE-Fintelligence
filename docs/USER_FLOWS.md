
# BE Finance User Flows

This document outlines the main user flows in the BE Finance application.

## Authentication Flow

### Login Process

1. User navigates to `/login` (or is redirected when attempting to access a protected route)
2. User clicks "Continue in Demo Mode" button
3. Demo authentication system logs them in automatically
4. Upon successful authentication:
   - Demo user profile is loaded
   - Loan Officers are directed to `/dashboard`

### Registration Process

1. User navigates to `/register`
2. User sees a message that backend is not connected
3. User is directed to use Demo Mode instead

## Loan Eligibility Assessment Flow

### Multi-Step Assessment Process

1. **Step 1: Business Information**
   - User enters business name, personal details, and contact information
   - Navigation: User clicks "Next" to proceed

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
   - User can save the assessment to localStorage

### Form Navigation Controls

- Navigation buttons appear in the form footer
- Progress indicator shows current step and completion status
- Form data is preserved between steps

## Officer Dashboard Flow

1. Officer logs in and navigates to dashboard
2. Dashboard displays:
   - Application statistics (pending, approved, rejected)
   - Quick access cards to key features
   - Pending applications table
   - Risk alerts for rejected applications
   - Loan performance chart
3. Officer can:
   - Review pending applications
   - Access analytics
   - Manage customer data
   - Process documents

## Application Review Flow

1. Officer selects an application from the dashboard or applications list
2. System displays detailed application information
3. Officer reviews:
   - Applicant information
   - Financial details
   - Eligibility score and risk assessment
4. Officer makes decision (approve/reject)
5. Application status is updated
