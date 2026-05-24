# /security-review

Run a security review of the current branch changes.

## What it does

Performs a BridgeEasy-specific security audit on staged/committed changes:

### 1. API key exposure
- Search for any new `VITE_*` variables added to frontend code — they are browser-exposed.
- Confirm `VITE_GEMINI_API_KEY` is still the only sensitive key in the frontend; all others should be Cloud Function secrets.
- Flag any hardcoded API keys, tokens, or credentials in source files.

### 2. Firestore rules
- Verify `firestore.rules` has not regressed — specifically:
  - `loan_applications`: read/write only if `request.auth.uid == resource.data.userId`
  - `customers/{customerId}`: read/write only if owner
  - `customers/{customerId}/documents`: inherits parent ownership
  - `users/{userId}`: read/write only if `request.auth.uid == userId`
- Check for any collection with `allow read, write: if true` (public access).

### 3. Ownership checks in ApplicationContext
- Confirm `updateApplicationStatus` still has an ownership pre-check before writing.
- Confirm the `loan_applications` query still has `where('userId','==',user.uid)`.

### 4. Cloud Function input validation
- Confirm all Cloud Function inputs are validated with Zod schemas before processing.
- Check for any new functions that accept user-supplied data without validation.

### 5. Azapi.ai sandbox
- Confirm Azapi.ai credentials are still sandbox — flag if a production key is present.
- Remind: do not go live with CIBIL parsing until this is explicitly swapped.

### 6. Base64 blob handling
- Cloud Functions receive base64 file data — confirm file size limits are enforced (15MB max).
- Confirm extracted data is validated by Zod before being written to Firestore.

### 7. Auth guards
- Confirm all new routes in `src/App.tsx` are wrapped in `<ProtectedRoute>`.
- Confirm no new pages bypass the `DashboardLayout` auth check.

## Usage

```
/security-review
```

Typically run before opening a PR or before `firebase deploy`.

## Notes

- For a full diff-based review, use `/review` (PR review skill) which covers code quality more broadly.
- This skill focuses specifically on the BridgeEasy threat surface: Firebase rules, key exposure, and input validation.
