# /rescore

Re-run the eligibility and risk score for an existing application.

## What it does

Given an application ID, re-evaluates the application using the current scoring engines and updates Firestore:

1. **Fetch application** — load the full application record from `loan_applications/{applicationId}` via `loanService`.
2. **Re-run eligibility** — call `MSMEEligibilityCalculator` (`src/utils/MSMEEligibilityCalculator.ts`) with the application's stored financials. This uses the same engine as the create-application flow.
3. **Re-run risk** — call `calculateRiskScore` (`src/utils/riskScoring.ts`) passing the new `EligibilityResult` as the `eligibility` parameter.
4. **Show diff** — display old vs new scores side-by-side before writing anything.
5. **Confirm** — ask before overwriting. On confirm, update `eligibilityScore`, `eligibilityBreakdown`, `isEligible`, `rejectionReason` on the Firestore record.

## Usage

```
/rescore <applicationId>
/rescore abc123xyz
```

## When to use

- After changing thresholds in `src/config/scoringConfig.ts` — rescore affected applications.
- After a CIBIL document is uploaded post-application — re-run with the real credit score.
- When an officer disputes an automated decision and wants a fresh calculation.

## Notes

- Only the **application owner** (`userId == currentUser.uid`) can trigger a rescore — enforced by Firestore rules.
- The rescore does **not** change application status (Pending/Approved/Rejected) — that requires a human review action.
- All threshold values come from `src/config/scoringConfig.ts` — if you changed thresholds, those changes take effect immediately on rescore.
