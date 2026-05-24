# BridgeEasy — Master Plan & Progress Audit

**Last updated:** 2026-05-24  
**Firebase project:** `firepower-ceded`  
**App:** One-stop MSME loan origination platform for loan officers

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete — shipped and TypeScript-verified |
| ⚠️ | Partial — started but not fully wired |
| ⬜ | Not started |
| 🔒 | Blocked on external procurement (not engineering) |

---

## Overall Progress

```
Phase 1 — Production Blockers          ████████████ 100%  ✅
Phase 2 — Data Persistence             ████████████ 100%  ✅
Phase 3 — UI Data Integrity            ████████░░░░  75%  ⚠️
Phase 4 — Scoring Engine Unification   ████████████ 100%  ✅
Phase 5 — Module Integration           ████████████ 100%  ✅
Phase 6 — Polish & Configuration       ███████████░  90%  ⚠️
Phase 7 — Security & Production Ready  ██░░░░░░░░░░  20%  ⬜
```

---

## Phase 1 — Production Blockers (P0)

> **Sprint:** P1 — completed 2026-05-23

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1.1 | Reconnect `ApplicationContext` to Firestore (`onSnapshot` listener, `addDoc`, `updateDoc`) | `src/contexts/ApplicationContext.tsx` | ✅ |
| 1.2 | Fix collection name mismatch — `loanService.ts` was writing to `applications`, context reads `loan_applications` | `src/services/loanService.ts` | ✅ |
| 1.3 | Scope application queries by `userId` — `where('userId','==',uid)` + `orderBy('createdAt','desc')` | `src/contexts/ApplicationContext.tsx` | ✅ |
| 1.4 | Ownership guard on `updateApplicationStatus` — pre-check before write | `src/contexts/ApplicationContext.tsx` | ✅ |

**Verification:** Applications persist across browser sessions, are scoped per officer, and status changes survive refresh.

---

## Phase 2 — Data Persistence

> **Sprint:** P1 — completed 2026-05-23

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 2.1 | Create `customers` Firestore collection + `customerService.ts` CRUD | `src/services/customerService.ts` | ✅ |
| 2.2 | Persist extracted documents to `customers/{id}/documents` subcollection | `src/services/customerService.ts`, `src/pages/DocumentProcessor.tsx` | ✅ |
| 2.3 | `DocumentContext` backed by Firestore when customer is selected (localStorage only when no customer) | `src/contexts/DocumentContext.tsx` | ✅ |
| 2.4 | Upload original files to Firebase Storage at `customers/{id}/documents/{docId}/` | `src/services/msmeDocumentService.ts` | ✅ |
| 2.5 | Persist `eligibilityBreakdown` (full `EligibilityResult`) to `loan_applications` on creation | `src/hooks/useCreateAssessment.ts` | ✅ |
| 2.6 | Update CLAUDE.md to reflect real Firestore state (remove stale "mock mode" note) | `CLAUDE.md` | ✅ |

**Verification:** Refreshing the browser or logging in from another device shows the same customers, documents, and applications.

---

## Phase 3 — UI Data Integrity

> **Sprint:** P1 + P2 — partially completed

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 3.1 | Remove `mockApplicationData` from `LoanApplicationReview` (hardcoded PAN, email, income, credit score) | `src/components/LoanApplicationReview.tsx` | ✅ |
| 3.2 | Render real `eligibilityBreakdown` card in Application Review | `src/components/LoanApplicationReview.tsx` | ✅ |
| 3.3 | Validate Customers page against Firestore-backed customer collection (not derived from app emails) | `src/pages/Customers.tsx` | ✅ |
| 3.4 | Implement **"Request More Information"** action — add `info_requested` status, call `updateApplicationStatus`, persist to Firestore | `src/pages/ApplicationReview.tsx` | ⬜ |
| 3.5 | Show `info_requested` badge in Applications list | `src/pages/Applications.tsx` | ⬜ |
| 3.6 | Add loading skeletons and error states to Dashboard + Applications list (for `onSnapshot` initial load) | `src/pages/Dashboard.tsx`, `src/pages/Applications.tsx` | ⬜ |

**Remaining:** Items 3.4–3.6 are the only incomplete items across all phases so far.

---

## Phase 4 — Scoring Engine Unification

> **Sprint:** P2 — completed 2026-05-24

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 4.1 | Delete inline eligibility formula in `CreateApplication` (`min(95, max(40, ...))`) — was diverging from `MSMEEligibilityCalculator` | `src/pages/CreateApplication.tsx` | ✅ |
| 4.2 | Both `CreateApplication` and `useEligibilityForm` now call `MSMEEligibilityCalculator` exclusively | `src/pages/CreateApplication.tsx`, `src/hooks/useEligibilityForm.ts` | ✅ |
| 4.3 | Remove silent `creditScore: 700` default from Zod schema and `defaultValues` | `src/components/MSMEApplicationForm.tsx` | ✅ |
| 4.4 | Add visible CIBIL score input field to `MSMEApplicationForm` (field existed in schema but had no UI) | `src/components/MSMEApplicationForm.tsx` | ✅ |
| 4.5 | Wire `eligibilityBreakdown` into `calculateRiskScore` so risk engine uses real scoring data, not generic `50` fallback | `src/utils/riskScoring.ts` | ✅ |
| 4.6 | Externalise all threshold magic numbers to `src/config/scoringConfig.ts` — 7 instances across 5 files | `src/config/scoringConfig.ts` (new), `Customers.tsx`, `RiskManagement.tsx`, `Analytics.tsx`, `riskScoring.ts`, `LoanApplicationReview.tsx` | ✅ |

**Verification:** Creating an application now uses `MSMEEligibilityCalculator` exclusively. Credit score is required input — no more silent 700 fallback.

---

## Phase 5 — Module Integration (Data Flow)

> **Sprint:** P2 — completed 2026-05-24

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 5.1 | Document → Application auto-fill: `MSMEApplicationForm` auto-populates from extracted docs (CIBIL → credit score, bank statement → monthly income, balance sheet → revenue, GST → business name) | `src/components/MSMEApplicationForm.tsx` | ✅ |
| 5.2 | Customer → Application prefill: `prefilledCustomer` prop pre-fills business name, contact details, business type | `src/components/MSMEApplicationForm.tsx`, `src/pages/CreateApplication.tsx` | ✅ |
| 5.3 | Customers page → Document Processor navigation: **Docs** button passes `preselectedCustomerId` in route state | `src/pages/Customers.tsx`, `src/pages/DocumentProcessor.tsx` | ✅ |
| 5.4 | Customers page → Create Application navigation: **Apply** button passes `prefilledCustomer` in route state | `src/pages/Customers.tsx`, `src/pages/CreateApplication.tsx` | ✅ |
| 5.5 | `LoanApplicationReview` maps `eligibilityBreakdown` from Firestore for the breakdown card | `src/hooks/useFetchAssessments.ts`, `src/hooks/useFetchSingleBasicAssessment.ts` | ✅ |
| 5.6 | Document → Eligibility full handoff: extracted `documents` map passed to `MSMEEligibilityCalculator` (not just 3 form fields) | `src/pages/EligibilityChecker.tsx` | ✅ |

**Verification:** Officer flow — pick customer → upload docs → create application — requires zero re-entry of data already extracted.

---

## Phase 6 — Polish & Configuration

> **Sprint:** P2 + P3 — mostly completed 2026-05-24

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 6.1 | All risk/eligibility/CIBIL/loan bucket thresholds in single `scoringConfig.ts` | `src/config/scoringConfig.ts` | ✅ |
| 6.2 | Settings wired to Firestore `users/{uid}/preferences/settings` via `useUserPreferences` hook | `src/hooks/useUserPreferences.ts` (new), `src/pages/Settings.tsx` | ✅ |
| 6.3 | **Save Notification Settings** button — persists to Firestore | `src/pages/Settings.tsx` | ✅ |
| 6.4 | **Save System Settings** button — persists `autoApproval`, `riskThreshold`, `theme`, `dateFormat` | `src/pages/Settings.tsx` | ✅ |
| 6.5 | **Change Password** — uses `reauthenticateWithCredential` + `updatePassword` from Firebase Auth | `src/pages/Settings.tsx` | ✅ |
| 6.6 | **Download My Data** — compiles customers + applications + preferences → JSON file download | `src/pages/Settings.tsx` | ✅ |
| 6.7 | **Delete Account** — confirmation dialog → `user.delete()` | `src/pages/Settings.tsx` | ✅ |
| 6.8 | **Enable 2FA** — "coming soon" toast (Firebase MFA — deferred) | `src/pages/Settings.tsx` | ⚠️ |
| 6.9 | HelpSupport: replace fake contact info (`1-800-FINANCE`, `support@befinance.com`, EST timezone) with real details | `src/pages/HelpSupport.tsx` | ✅ |
| 6.10 | HelpSupport: wire dead Quick Action buttons (`onClick` handlers to `mailto:` + YouTube) | `src/pages/HelpSupport.tsx` | ✅ |
| 6.11 | HelpSupport: replace fake hardcoded System Status widget with real Firebase + Google Cloud status page links | `src/pages/HelpSupport.tsx` | ✅ |
| 6.12 | **Save Profile** — wire `updateProfile` (Firebase Auth display name) + write to `users/{uid}` Firestore doc | `src/pages/Settings.tsx` | ⚠️ |
| 6.13 | `LoanEligibilityForm` inline thresholds (70/40 bands) → `SCORING_CONFIG.eligibility.high/medium` | `src/components/LoanEligibilityForm.tsx` | ⬜ |

---

## Phase 7 — Security & Production Readiness

> **Sprint:** Not yet started

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 7.1 | Move `VITE_GEMINI_API_KEY` out of browser bundle → proxy all Gemini calls via Cloud Function | `src/` (remove key), `functions/src/index.ts` | ⬜ |
| 7.2 | Add Firestore security rule for `extracted_documents` collection (currently likely unguarded) | `firestore.rules` | ⬜ |
| 7.3 | Deploy Firestore composite indexes — `loan_applications (userId ASC, createdAt DESC)` and `customers (userId ASC, createdAt DESC)` | Firebase console / `firestore.indexes.json` | ⬜ |
| 7.4 | Replace static/hardcoded risk trend values with real delta calculations from historical applications | `src/utils/riskScoring.ts` (line ~274) | ⬜ |
| 7.5 | Swap Azapi.ai from sandbox → production credentials (procurement, not engineering) | `functions/src/financialApiProvider.ts` | 🔒 |
| 7.6 | Firebase MFA (2FA) for Settings | `src/pages/Settings.tsx` | ⬜ |
| 7.7 | Analytics full-funnel metrics: doc processing volume, extraction confidence distribution, time-to-decision, approval-vs-eligibility correlation | `src/pages/Analytics.tsx` | ⬜ |
| 7.8 | Dashboard actionable queues: "waiting on docs", "risk-flagged", "stale CIBIL (>90 days)" | `src/pages/Dashboard.tsx` | ⬜ |
| 7.9 | `Data Retention Policy` button — in-app explanation per RBI guideline | `src/pages/Settings.tsx` | ⬜ |

---

## Remaining Items — Quick Reference

### Must-do before UAT / client handoff

| Priority | Item | Phase |
|----------|------|-------|
| High | "Request More Information" action (status + Firestore persist) | 3.4, 3.5 |
| High | Deploy Firestore composite indexes | 7.3 |
| High | Firestore rule for `extracted_documents` | 7.2 |
| Medium | Loading skeletons for Dashboard + Applications list | 3.6 |
| Medium | Profile save (display name → Firebase Auth + `users/{uid}`) | 6.12 |
| Medium | `LoanEligibilityForm` threshold cleanup | 6.13 |

### Deferred / Phase 7

| Priority | Item |
|----------|------|
| High (security) | Move Gemini API key to Cloud Function proxy |
| Medium | Real historical risk trends |
| Medium | Analytics full-funnel charts |
| Medium | Dashboard actionable queues |
| Low | Firebase MFA (2FA) |
| Blocked | Azapi.ai sandbox → production (needs API key from vendor) |

---

## What Is Solid (Do Not Re-Touch)

- ✅ Firebase Auth login/logout + session management
- ✅ Document upload → Cloud Function → Gemini / Document AI extraction pipeline
- ✅ CIBIL report parsing + `CibilReportView` display
- ✅ `MSMEEligibilityCalculator` — full DSCR / current ratio / GST compliance scoring
- ✅ `riskScoring.ts` — wired to `eligibilityBreakdown`
- ✅ All Shadcn UI components and React Router routing
- ✅ `ApplicationContext` — Firestore-backed, user-scoped
- ✅ `customers` Firestore collection + `customerService`
- ✅ `scoringConfig.ts` — single source of truth for all thresholds
- ✅ Settings persistence via `useUserPreferences`

---

## Out of Scope (Separate Epics)

- **Multi-officer / RBAC** — admin vs officer vs viewer roles
- **Customer notifications** — email/SMS on application status change
- **Azapi.ai production swap** — procurement dependency
- **Full MFA** — Firebase MFA requires additional Firebase plan
