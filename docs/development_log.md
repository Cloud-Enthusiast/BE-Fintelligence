# Development Log

This document summarizes the development work and fixes implemented during a recent session.

## Configured Automatic Browser Launch

- Modified `vite.config.ts` to include `open: true` in the `server` configuration.
- This change ensures that the application automatically opens in the default browser when running `npm run dev`.

## Investigated and Fixed Data Submission Error

- **Issue:** Encountered a `404 Not Found` error when submitting the eligibility form, preventing data from being saved to the Supabase database.
- **Investigation:**
    - Reviewed `src/hooks/useEligibilityForm.ts` to understand the data submission logic.
    - Used the Supabase MCP tool to list database tables and found a mismatch between the table name used in the code (`loan_eligibility_assessments`) and the actual table name in the database (`Loan_applicants`).
    - Corrected the table name in `src/hooks/useEligibilityForm.ts` to `Loan_applicants`.
    - Encountered a TypeScript error due to outdated local type definitions.
    - Generated new Supabase TypeScript types using the `generate_typescript_types` tool, which included the correctly capitalized `Loan_applicants` table.
    - Updated the local types file (`src/types/supabase.ts`) with the newly generated types to resolve the TypeScript error.
- **New Issue:** After fixing the 404, a `409 Conflict` (foreign key violation) error occurred during form submission. The error indicated that the `applicant_id` being inserted into `Loan_applicants` did not exist in the related `loan_applicants` table (lowercase).
- **Solution:**
    - Implemented a "find or create" logic within the `handleSaveToDatabase` function in `src/hooks/useEligibilityForm.ts`.
    - This logic checks if a record for the logged-in user exists in the `loan_applicants` table.
    - If a record does not exist, a new one is created using the user's ID and available information.
    - The ID of the existing or newly created `loan_applicants` record is then used as the `applicant_id` when inserting the assessment data into the `Loan_applicants` table.
- **Result:** This resolved the foreign key constraint error, allowing successful data submission to the `Loan_applicants` table.

## Addressed Temporary Login Issue

- A temporary issue prevented login after some changes.
- Reviewed login and authentication code (`src/pages/Login.tsx`, `src/contexts/AuthContext.tsx`).
- The issue resolved after restarting the development server and refreshing the browser, suggesting it was a transient environment problem unrelated to the code changes.

## Renamed Git Branch

- Renamed the local Git branch from `main` to `master` using `git branch -m main master`.
- Pushed the new `master` branch to the remote repository and set it as upstream using `git push origin -u master`.
- Deleted the old remote `main` branch using `git push origin --delete main`.

## Implemented Loan Officer Registration and Login

- Added `first_name`, `last_name`, `designation`, `email`, and `role` columns to the `Officer_profile` table in Supabase.
- Modified the `LoanOfficerRegister.tsx` component to insert loan officer profile data into the `Officer_profile` table after successful registration.
- Updated `src/types/supabase.ts` with the latest database types, including the `Officer_profile` table and its new columns.
- Modified the `AuthContext.tsx` to fetch user profiles and roles from either the `Officer_profile` or `user_profiles` table based on the login type.
- Provided SQL commands to enable Row Level Security (RLS) for the `Officer_profile` table and create an insert policy allowing authenticated users to insert their own profiles.
