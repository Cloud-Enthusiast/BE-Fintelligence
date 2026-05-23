# BridgeEasy — CLAUDE.md

## What This App Does

BridgeEasy is a one-stop MSME loan origination and eligibility platform for **loan officers and financial institutions**. It allows officers to:
- Collect and process financial documents from MSME clients (CIBIL reports, bank statements, balance sheets, P&L, GST returns, ITR)
- Run AI-powered extraction on those documents (via Google Document AI + Gemini 2.0 Flash)
- Assess loan eligibility using a scoring engine
- Manage loan applications through a review workflow
- Track customer profiles and analytics

**Business context:** The app targets the Indian MSME lending market. All financial figures are in INR. CIBIL score is the primary credit metric. Firebase project: `firepower-ceded`.

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript 5.5** via **Vite**
- **React Router v6** — all protected routes inside `DashboardLayout`
- **React Query (TanStack v5)** — data fetching and caching
- **React Hook Form** + **Zod** — form validation
- **Tailwind CSS 3** + **Shadcn UI** — component library (components.json configured)
- **Framer Motion** — animations
- **Firebase SDK 12** — Auth, Firestore, Storage

### Backend (Firebase Cloud Functions — Node.js 22, TypeScript)
- **Google Vertex AI** — Gemini 2.0 Flash (`gemini-2.0-flash-001`) for document JSON extraction
- **Google Document AI** — OCR and structured text extraction for CIBIL and bank statements
- **Azapi.ai** — CIBIL report parsing (sandbox API)
- **Zod** — schema validation of all AI extraction outputs

### External Integrations
- Azapi.ai sandbox: CIBIL report parsing
- Gemini Vision API: All document type extraction
- Google Document AI: CIBIL + bank statement OCR

---

## Project Structure

```
src/
├── pages/              # Route-level pages (one file per route)
├── components/
│   ├── ui/             # Shadcn UI primitives — DO NOT modify directly
│   ├── eligibility/    # Multi-step eligibility form components
│   └── *.tsx           # Feature-level components
├── contexts/           # AuthContext, ApplicationContext, DocumentContext
├── hooks/              # Custom React hooks (useEligibilityForm, useFileExtraction, etc.)
├── services/           # Firebase/API call wrappers (loanService, cibilService, msmeDocumentService)
├── utils/              # Business logic utilities
│   ├── MSMEEligibilityCalculator.ts
│   ├── riskScoring.ts
│   ├── financialDataExtractor.ts
│   ├── formatters.ts   # formatCurrency(), formatPercent() — always use these for INR
│   └── msmeFinancialExtractor/patterns.ts
├── types/              # TypeScript interfaces (DocumentTypes, msmeDocuments)
├── lib/
│   ├── firebase.ts     # Firebase app init — do not duplicate
│   └── utils.ts        # cn() utility for Tailwind class merging
└── tests/              # Property-based tests (fast-check + vitest)

functions/src/
├── index.ts            # Cloud Function exports (extractCibilReport, extractMsmeDocument)
├── bankStatementSchema.ts
├── cibilSchema.ts
├── documentAIProcessor.ts
├── financialApiProvider.ts

docs/                   # Architecture, component, user flow, and style documentation
```

---

## Routes

| Path | Page | Auth |
|------|------|------|
| `/` | Landing | Public |
| `/login` | Login (Firebase Auth) | Public |
| `/dashboard` | Loan officer dashboard | Protected |
| `/applications` | Applications list | Protected |
| `/create-application` | New application form | Protected |
| `/application-review/:id` | Review specific application | Protected |
| `/analytics` | Analytics dashboard | Protected |
| `/customers` | Customer management | Protected |
| `/document-processor` | Upload + AI extraction | Protected |
| `/eligibility-checker` | Loan eligibility assessment | Protected |
| `/risk-management` | Risk assessment tools | Protected |
| `/settings` | User settings | Protected |
| `/help-support` | Help & support | Protected |

All protected routes are wrapped in `<ProtectedRoute>` inside `<DashboardLayout>` (sidebar + outlet).

---

## Dev Commands

```bash
# Frontend
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (property-based tests)

# Firebase Functions (run from functions/)
npm run build        # Compile TypeScript
firebase deploy --only functions   # Deploy functions
firebase deploy      # Deploy everything
```

---

## Environment Variables

Frontend (`.env.local`):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GEMINI_API_KEY
```

Cloud Functions (set via Firebase config or GCP Secret Manager):
```
DOCUMENT_AI_CIBIL_PROCESSOR_ID
DOCUMENT_AI_BANK_PROCESSOR_ID
```

---

## State Management

| Context | What It Manages | Persistence |
|---------|----------------|-------------|
| `AuthContext` | Firebase user, login/logout methods | Firebase Auth session |
| `ApplicationContext` | Loan applications list and status | **Firestore** `loan_applications` collection (real, not mocked). Query is scoped `where('userId','==',uid)` — requires composite index `(userId ASC, createdAt DESC)`. |
| `DocumentContext` | Uploaded documents per session | localStorage (key: `be_finance_documents`) — session-only; Firestore/Storage persistence happens via `saveCustomerDocument()` in `customerService.ts` when a customer is selected in DocumentProcessor. |

> **Note:** `ApplicationContext` is **fully Firestore-backed**. The previous note about "mock mode / commented out" was stale — it was cleaned up in the P1 sprint (2026-05-23).

---

## Document Processing Pipeline

```
User uploads file (PDF/image, max 15MB)
  ↓
Firebase Cloud Function: extractMsmeDocument (or extractCibilReport)
  ↓
[CIBIL / Bank Statement] → Google Document AI (OCR + structured text)
[Other types]            → Raw base64 sent directly
  ↓
Gemini 2.0 Flash Vision (JSON extraction, temp=0.1, max 8192 tokens)
  ↓
Zod schema validation (per document type)
  ↓
Return validated structured JSON to frontend
```

**Supported document types:** `cibil_report`, `balance_sheet`, `profit_loss`, `bank_statement`, `gst_returns`, `itr_document`

**Function timeouts:** CIBIL = 300s, others = 120s

---

## Key Business Logic

- **`MSMEEligibilityCalculator.ts`** — Core eligibility scoring engine. Takes extracted financial data and outputs eligibility status + score.
- **`riskScoring.ts`** — Risk factor assessment based on financial metrics and CIBIL score.
- **`financialDataExtractor.ts`** — Normalizes extracted document data into a consistent format.
- **`formatCurrency()`** / **`formatPercent()`** — Always use these for displaying INR values or percentages. Never format money inline.

---

## Firestore Collections

| Collection | Access Control | Notes |
|-----------|---------------|-------|
| `loan_applications` | Create if signed in + owner; read/update if owner or admin; delete if admin | Contains `eligibilityBreakdown` (full `EligibilityResult` from `MSMEEligibilityCalculator`) |
| `applications` | Same as above | Legacy alias |
| `customers/{customerId}` | Create/read/update/delete if owner | Master customer entity. Added P1 sprint 2026-05-23. |
| `customers/{customerId}/documents/{docId}` | Same as parent | Extracted doc data + Storage path. Written by `saveCustomerDocument()`. |
| `customers/{customerId}/cibilAssessments/{assessmentId}` | Same as parent | Historical CIBIL pulls per customer |
| `extracted_documents` | Create if signed in + owner; read/update/delete if owner | Legacy opt-in save from DocumentProcessor — superseded by `customers/{id}/documents` |
| `users/{userId}` | Read/write only for self | |
| `users/{userId}/preferences/{prefDoc}` | Read/write only for self | Settings persistence (Phase 3) |

---

## Conventions & Rules

1. **Shadcn UI components** live in `src/components/ui/` — never edit them directly. Extend via wrapper components.
2. **All INR currency formatting** must use `formatCurrency()` from `src/utils/formatters.ts`.
3. **Firebase init** is only in `src/lib/firebase.ts` — never initialize Firebase elsewhere.
4. **Zod schemas** for Cloud Functions live in `functions/src/` — keep them co-located with the functions that use them.
5. **New pages** go in `src/pages/`, must be added to the router in `src/App.tsx`, and protected routes must use `<ProtectedRoute>`.
6. **Custom hooks** that touch Firebase/API go in `src/hooks/`. Pure business logic goes in `src/utils/`.
7. **No inline styles** — use Tailwind classes. For complex component variants, use `class-variance-authority` (CVA).
8. **Document types** are strictly typed — see `src/types/DocumentTypes.ts` and `src/types/msmeDocuments.ts`. Do not use string literals.
9. `cn()` from `src/lib/utils.ts` is the only way to merge Tailwind classes.
10. **Tests** use `vitest` + `fast-check` for property-based testing. Run `npm run test` before marking any utility function change as complete.

---

## Things to Be Careful About

- **Firestore composite index required:** `loan_applications` query uses `where('userId','==',uid)` + `orderBy('createdAt','desc')`. Deploy the index or Firestore will reject the query. Same applies to `customers` collection.
- **Customer-first workflow:** `saveCustomerDocument()` in `customerService.ts` requires a `customerId`. In DocumentProcessor, if no customer is selected, docs are saved to localStorage only — not to Firestore/Storage.
- Azapi.ai is on **sandbox** credentials — do not use production CIBIL parsing until the API key is swapped.
- `VITE_GEMINI_API_KEY` in the frontend is exposed to the browser — only safe because it's rate-limited. Long term, proxy via Cloud Functions.
- `functions/` has its own `package.json` and `tsconfig.json` — always `cd functions && npm run build` after changing function code.
- Firebase deploy runs `npm run build` in functions automatically (see `firebase.json` predeploy hook).
