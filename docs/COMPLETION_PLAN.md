# BridgeEasy — Completion Plan for Client Delivery

**Prepared by:** BE Fintelligence  
**Target:** Antigravity Development Team  
**Date:** 2026-05-12  
**Codebase:** `D:\BE Fintelligence\bridgeaasy app`  
**Firebase Project:** `firepower-ceded`

---

## Overview

BridgeEasy is functionally complete at the UI/UX level. The document extraction pipeline (Gemini Vision + Document AI via Cloud Functions) is live and working. The eligibility engine is wired to real extracted data.

**The primary gap is the loan application data layer:** `ApplicationContext` is in localStorage mock mode — Firestore read/write is commented out. This means loan applications do not persist across sessions and are invisible to other users. All other issues are secondary to this.

---

## Priority Levels

| Priority | Label | Meaning |
|----------|-------|---------|
| P0 | **Blocker** | App cannot be delivered without this fix |
| P1 | **High** | Significant UX or data integrity gap |
| P2 | **Medium** | Functional gap, not show-stopping |
| P3 | **Low** | Polish or future-proofing |

---

## P0 — Production Blockers

### TASK-01 · Reconnect ApplicationContext to Firestore

**File:** `src/contexts/ApplicationContext.tsx`

**Problem:**  
All Firestore imports (`collection`, `query`, `onSnapshot`, `addDoc`, `updateDoc`, `doc`, `orderBy`, `Timestamp`, `db`) are commented out in lines 2–14. The `addApplication` and `updateApplicationStatus` functions use localStorage mock mode only. A real-time Firestore listener (`onSnapshot`) exists but is commented out at lines 70–88.

**Collection name to use:** `loan_applications` (matches the Firestore security rules in `CLAUDE.md`)

**What to do:**
1. Uncomment the Firestore imports block (lines 2–14)
2. Replace the two `useEffect` localStorage blocks with the commented Firestore `onSnapshot` listener
3. Complete the `onSnapshot` callback to map `querySnapshot.docs` to `LoanApplication[]` (map `doc.id` + `doc.data()`, converting `Timestamp` fields to ISO strings)
4. Replace the mock `addApplication` body with the commented `addDoc` call, targeting `collection(db, 'loan_applications')`
5. Replace the mock `updateApplicationStatus` body with the commented `updateDoc` call, targeting `doc(db, 'loan_applications', id)`
6. Remove all localStorage fallback code (`localStorage.getItem/setItem` calls for `mock_loan_applications`)

**Acceptance criteria:**
- Applications created in one browser session appear in another browser session after refresh
- Applications created by one logged-in user are visible to admin users
- Status changes (approve/reject) persist across sessions

---

### TASK-02 · Fix Collection Name Mismatch in loanService.ts

**File:** `src/services/loanService.ts` (line ~45)

**Problem:**  
`submitLoanApplication` writes to Firestore collection `applications`. `ApplicationContext` (after TASK-01) will read from `loan_applications`. These are two different collections — submitted applications will never appear in the app's list.

**What to do:**  
Change the collection name in `loanService.ts` from `'applications'` to `'loan_applications'` so all writes and reads target the same collection.

**Acceptance criteria:**
- A loan application submitted via the eligibility checker or create-application form appears immediately in the Applications list and Dashboard counts

---

## P1 — High Priority

### TASK-03 · Remove Hardcoded Mock Data from LoanApplicationReview

**File:** `src/components/LoanApplicationReview.tsx` (lines 22–55)

**Problem:**  
A `mockApplicationData` object is merged as the base for the review view. It contains hardcoded values:
- `panId: 'ABCTY1234Z'`
- `email: 'john.smith@example.com'`
- `annualIncome: 750000`, `monthlyIncome: 62500`
- `creditScore: 720`
- `loanPurpose: 'Business Expansion'`
- `financialRiskScore: 78`, `behavioralCreditScore: 82`

Real fetched fields overlay some of these but not all — so a real application can still show the mock email and PAN.

**What to do:**
1. Remove the `mockApplicationData` constant
2. Render all fields from the real `application` object fetched via `useFetchAssessments` / `useApplications`
3. For fields not yet stored in `LoanApplication` (e.g. `panId`, `loanPurpose`, `behavioralCreditScore`), either add them to the `LoanApplication` interface and persist them when creating an application, or show a `"—"` placeholder instead of fake values
4. `financialRiskScore` should come from the real `eligibilityScore` field already being set — confirm this mapping is correct and remove the fallback mock value

**Acceptance criteria:**
- No hardcoded PAN, email, income, or credit score values appear in any application review
- Every field shown on the review page is sourced from the actual submitted application data or shows `"—"` when genuinely missing

---

### TASK-04 · Implement "Request More Information" Action

**File:** `src/pages/ApplicationReview.tsx` (line ~75)

**Problem:**  
`handleRequestInfo` contains only a `toast()` call with a `// TODO` comment. No status change, no Firestore write, no notification is triggered.

**What to do:**
1. Add `'info_requested'` as a valid status value in the `LoanApplication` interface (alongside `'pending'`, `'approved'`, `'rejected'`)
2. Call `updateApplicationStatus(id, 'info_requested')` inside `handleRequestInfo` after the toast
3. Display the `info_requested` status in the Applications list with an appropriate badge colour (e.g. amber/yellow)
4. (Optional) Store a `requestNote` field on the application if the officer can enter a message

**Acceptance criteria:**
- Clicking "Request Info" on a review page visibly changes the application status badge
- The status persists across page refreshes (after TASK-01 is complete)

---

### TASK-05 · Connect Customers Page to Real Data

**File:** `src/pages/Customers.tsx`

**Problem:**  
Customer list is derived by deduplicating `email` from `applications` (localStorage). There is no dedicated Firestore customers collection. After TASK-01, the data source will be live but the derivation logic needs to be validated.

**What to do:**
1. After TASK-01 is complete, verify that the deduplication logic still works correctly with Firestore-sourced applications
2. Ensure customer profile data (name, email, phone, businessType) maps from the real `LoanApplication` fields
3. If `LoanApplication` does not store `phone`, add it to the interface and the create-application form

**Acceptance criteria:**
- Customers page populates with real applicant data from Firestore
- No duplicate customer entries for the same email

---

## P2 — Medium Priority

### TASK-06 · Replace Static Trend Calculations in riskScoring.ts

**File:** `src/utils/riskScoring.ts` (line ~274)

**Problem:**  
Comment reads: `// Mock trends (would be calculated from historical data in real implementation)`. Trend values (e.g. revenue trend, credit score trend) are returned as static/hardcoded values.

**What to do:**
1. If multiple applications exist for the same business (same PAN or email), calculate actual delta between the most recent and previous application's extracted financial metrics
2. If historical data is not available (first application), return `null` or `'insufficient_data'` for trend fields rather than a fake trend value
3. Remove the mock comment

**Acceptance criteria:**
- Trend values are `null` when only one data point exists
- Trend values reflect real directional change when two or more data points exist for the same borrower

---

### TASK-07 · Secure GEMINI_API_KEY (Move to Cloud Function Proxy)

**File:** `src/` (frontend), `functions/src/index.ts`

**Problem:**  
`VITE_GEMINI_API_KEY` is embedded in the Vite bundle and exposed to the browser. CLAUDE.md notes: *"only safe because it's rate-limited. Long term, proxy via Cloud Functions."*

**What to do:**
1. Remove `VITE_GEMINI_API_KEY` from all frontend `.env` files and code
2. Any direct Gemini API calls in the frontend must be routed through a Firebase Cloud Function (the `extractMsmeDocument` function already does this for document extraction — confirm no other direct Gemini calls remain)
3. Set the API key only in Firebase Function config/Secret Manager

**Acceptance criteria:**
- No API key is visible in the browser's Network tab or JS bundle
- Document extraction still works after the key is removed from the frontend

---

### TASK-08 · Swap Azapi.ai from Sandbox to Production

**File:** `functions/src/financialApiProvider.ts` (or wherever Azapi credentials are set)

**Problem:**  
Azapi.ai is on sandbox credentials. CIBIL report parsing via Azapi will not work against real CIBIL data until production credentials are in place.

**What to do:**
1. Obtain production API key from Azapi.ai
2. Replace sandbox key in Firebase Function config/Secret Manager
3. Test with a real CIBIL PDF (not a sample/mock)
4. Confirm the `extractCibilReport` Cloud Function returns real structured data end-to-end

**Acceptance criteria:**
- CIBIL report upload in DocumentProcessor shows real parsed credit score and account data
- No sandbox watermarks or test data appear in extraction output

---

## P3 — Low Priority / Polish

### TASK-09 · Add Firestore Security Rules for `extracted_documents` Collection

**File:** `firestore.rules`

**Problem:**  
`DocumentProcessor.tsx` optionally writes to `extracted_documents` collection (live write via `addDoc`). The CLAUDE.md security rules table does not list this collection — its rules are likely absent or permissive.

**What to do:**
- Add a rule: read/write allowed only if `request.auth != null && request.auth.uid == resource.data.userId`

---

### TASK-10 · Add Loading and Error States to Applications List

**Files:** `src/pages/Dashboard.tsx`, `src/pages/Applications.tsx` (or equivalent list page)

**Problem:**  
After TASK-01, the `onSnapshot` listener will have a loading state before first data arrives. Currently there is no loading skeleton or error boundary for the applications list.

**What to do:**
- Add an `isLoading` boolean to `ApplicationContext` (true until first snapshot fires)
- Show a skeleton loader in the Dashboard and Applications list while `isLoading` is true
- Show an error state if the snapshot listener emits an error

---

## Summary Table

| Task | File(s) | Priority | Effort |
|------|---------|----------|--------|
| TASK-01: Reconnect ApplicationContext to Firestore | `src/contexts/ApplicationContext.tsx` | P0 | Medium |
| TASK-02: Fix collection name mismatch | `src/services/loanService.ts` | P0 | Trivial |
| TASK-03: Remove mock data from LoanApplicationReview | `src/components/LoanApplicationReview.tsx` | P1 | Medium |
| TASK-04: Implement Request Info action | `src/pages/ApplicationReview.tsx` | P1 | Small |
| TASK-05: Validate Customers page with live data | `src/pages/Customers.tsx` | P1 | Small |
| TASK-06: Replace static risk trends | `src/utils/riskScoring.ts` | P2 | Medium |
| TASK-07: Move Gemini key to Cloud Function | `src/`, `functions/src/` | P2 | Small |
| TASK-08: Swap Azapi.ai to production | `functions/src/financialApiProvider.ts` | P2 | Trivial* |
| TASK-09: Firestore rules for extracted_documents | `firestore.rules` | P3 | Trivial |
| TASK-10: Loading/error states for applications | `Dashboard.tsx`, `Applications.tsx` | P3 | Small |

*Trivial once production API key is obtained from Azapi.ai.

---

## Suggested Execution Order

```
TASK-02 → TASK-01 → TASK-03 → TASK-04 → TASK-05
```

Start with TASK-02 (one-line fix) before TASK-01 so the collection name is correct before the Firestore listener goes live. TASK-03, 04, and 05 depend on TASK-01 being done so real data flows through.

P2 and P3 tasks can be done in parallel or deferred to a second sprint.

---

## What Is Already Working (Do Not Modify)

- Firebase Auth login/logout flow
- Document upload and AI extraction (Cloud Functions, Gemini Vision, Document AI)
- CIBIL report parsing and `CibilReportView` display
- Eligibility engine (`MSMEEligibilityCalculator`, `useDocumentEligibility`)
- Risk scoring (except static trends — TASK-06)
- `EligibilityReport` component wired to extracted document data
- All Shadcn UI components and routing
- DocumentContext (localStorage persistence of extracted docs per session)
- Dashboard stat counts and charts (work correctly once TASK-01 is live)
