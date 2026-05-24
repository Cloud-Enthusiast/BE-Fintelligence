# /doc-audit

Audit the documents on file for a customer.

## What it does

Given a customer ID, produces a full document health report:

1. **List all documents** — query `customers/{customerId}/documents` subcollection.
2. **Coverage matrix** — for each of the 6 required doc types, show:
   - ✅ Present + extraction confidence ≥ 80%
   - ⚠️ Present but low confidence (< 80%) — flag for re-upload
   - ❌ Missing — block eligibility calculation until uploaded
3. **CIBIL age check** — if a `cibil_report` doc exists, show its `extractedAt` date. Warn if older than 90 days (stale per RBI guidelines).
4. **Credit score source** — confirm whether the credit score on any linked application came from the CIBIL doc or was manually entered.
5. **Data gaps** — list any fields `MSMEEligibilityCalculator` needs that are `null`/`undefined` across all extracted docs:
   - `annualRevenue`, `monthlyIncome`, `creditScore`, `existingLoanAmount`, `gstComplianceScore`, `currentRatio`, `dscr`
6. **Recommendations** — suggest which documents to re-upload to fill the gaps.

## Usage

```
/doc-audit <customerId>
/doc-audit cust_abc123
```

## Notes

- Reads only from `customers/{customerId}/documents` — documents saved to `localStorage` only (no customer selected) are **not** audited. Remind the officer to always select a customer before uploading.
- Storage paths are at `customers/{customerId}/documents/{docId}/{filename}` — provide download links where possible.
- Extraction confidence is stored on each doc record as `confidence` (0–1 float).
