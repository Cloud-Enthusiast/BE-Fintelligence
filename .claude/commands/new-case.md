# /new-case

Start a new MSME loan case end-to-end.

## What it does

Walks you through the recommended officer workflow for onboarding a new MSME client:

1. **Verify customer exists** — search `customers` Firestore collection by business name / PAN / GSTIN. If not found, prompt for the minimum required fields and call `customerService.createCustomer()`.
2. **Document checklist** — list the 6 supported doc types (`cibil_report`, `bank_statement`, `balance_sheet`, `profit_loss`, `gst_returns`, `itr_document`) and flag which are already uploaded for this customer.
3. **Navigate to Document Processor** — open `/document-processor` with `preselectedCustomerId` pre-set in route state.
4. **Run eligibility** — after docs are processed, navigate to `/eligibility-checker` with the customer's extracted data pre-loaded.
5. **Create application** — navigate to `/create-application` with `prefilledCustomer` in route state so no data needs to be re-entered.
6. **Confirm** — show the created application ID and a link to `/application-review/:id`.

## Usage

```
/new-case
/new-case <business name or customer ID>
```

## Notes

- Requires the user to be logged in (Firebase Auth session).
- All Firestore writes are scoped to `userId` — no cross-officer data leakage.
- If a CIBIL report has been uploaded, the credit score is auto-populated; do NOT accept the default 700 fallback.
- Azapi.ai is on **sandbox** credentials — remind the officer if they're processing a real CIBIL report.
