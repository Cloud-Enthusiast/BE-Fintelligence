# /deploy-check

Pre-deploy checklist for the BridgeEasy app.

## What it does

Runs a structured pre-flight check before any Firebase deploy:

### 1. TypeScript
```bash
npx tsc -b
```
Must return zero errors. Do not proceed if there are typescript errors and resolve them first.

### 2. Lint
```bash
npm run lint
```
Fix any errors (warnings are acceptable).

### 3. Tests
```bash
npm run test
```
All property-based tests in `src/tests/` must pass.

### 4. Cloud Functions build
```bash
cd functions ; npm run build
```
Functions TypeScript must compile cleanly.

### 5. Firestore rules check
- Confirm `firestore.rules` has `where('userId','==',uid)` guards on `loan_applications` and `customers`.
- Confirm `customers/{customerId}/documents` rules match the parent customer owner.

### 6. Composite index reminder
Remind that these indexes must be deployed or queries will fail:
- `loan_applications`: `(userId ASC, createdAt DESC)`
- `customers`: `(userId ASC, createdAt DESC)`

Deploy indexes via:
```bash
firebase deploy --only firestore:indexes
```

### 7. Environment variables
Confirm `.env.local` has all required `VITE_FIREBASE_*` keys and `VITE_GEMINI_API_KEY`.
Warn that `VITE_GEMINI_API_KEY` is browser-exposed — rate-limited OK, but flag for long-term proxy fix.

### 8. Azapi.ai sandbox warning
Remind that Azapi.ai is on **sandbox** credentials — do not deploy to production until the live API key is swapped.

## Usage

```
/deploy-check
```

Run this before every `firebase deploy`.
