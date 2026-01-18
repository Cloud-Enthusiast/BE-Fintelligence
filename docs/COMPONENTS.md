
# BE Finance Components

This document describes the key components of the BE Finance application, their relationships, and how they work together.

## Component Hierarchy

```
App
├── AuthProvider
├── ApplicationProvider
├── BrowserRouter
│   ├── Login
│   ├── ProtectedRoute
│   │   ├── Index
│   │   │   ├── Layout
│   │   │   │   ├── Header
│   │   │   │   ├── EligibilityForm
│   │   │   │   │   ├── EligibilityFormWrapper
│   │   │   │   │   │   ├── FormStepIndicator
│   │   │   │   │   │   ├── FormStep1
│   │   │   │   │   │   ├── FormStep2
│   │   │   │   │   │   ├── FormStep3
│   │   │   │   │   │   ├── EligibilityResult
│   │   │   │   │   │   └── FormFooter
│   │   │   │   └── Footer
│   │   ├── Dashboard
│   │   ├── Application
│   │   └── Other Protected Pages
│   └── NotFound
└── Toaster
```

## Core Components

### Authentication Components

#### `AuthProvider` (src/contexts/AuthContext.tsx)

Manages the authentication state of the application.

**Purpose:**
- Provides user authentication state
- Handles login/logout operations
- Manages user roles (Loan Officer/Applicant)

**Key Features:**
- `login()`: Authenticates users with username/password
- `loginWithOTP()`: Authenticates users with OTP
- `logout()`: Signs out the current user
- Stores user data in local storage for persistence

#### `ProtectedRoute` (src/components/ProtectedRoute.tsx)

Guards routes that require authentication.

**Purpose:**
- Prevents unauthenticated access to protected routes
- Redirects to login page when necessary
- Enforces role-based access control

**Props:**
- `children`: Components to render when authenticated
- `allowedRoles`: Optional array of roles allowed to access the route

### Layout Components

#### `Layout` (src/components/Layout.tsx)

Provides consistent page structure.

**Purpose:**
- Creates consistent header, content, and footer
- Handles navigation elements
- Adds animation effects to page transitions

**Structure:**
- Header with navigation links
- Main content area with page-specific content
- Footer with copyright information

### Form Components

#### `EligibilityForm` / `EligibilityFormWrapper` (src/components/eligibility/*)

Multi-step form for loan eligibility assessment.

**Purpose:**
- Collects applicant and business information
- Processes eligibility calculations
- Displays results to the user

**Key Subcomponents:**
- `FormStepIndicator`: Shows progress through the form
- `FormStep1`: Business information collection
- `FormStep2`: Financial details collection
- `FormStep3`: Loan requirements collection
- `EligibilityResult`: Displays assessment results
- `FormFooter`: Navigation controls for the form

### Custom Hook

#### `useEligibilityForm` (src/hooks/useEligibilityForm.ts)

Custom hook that manages the eligibility form state and logic.

**Purpose:**
- Maintains form data across steps
- Handles form validation
- Processes form submission
- Calculates eligibility
- Saves results to database

**Key Functions:**
- `handleChange`: Updates form fields
- `handleNumericInputChange`: Handles numeric inputs with validation
- `handleSubmit`: Processes form submission
- `nextStep`/`prevStep`: Handles form navigation
- `handleSaveToLocalStorage`: Persists form data to browser storage

## UI Components

The application uses a variety of UI components from the Shadcn UI library:

- `Button`: For action triggers
- `Card`: For content containers
- `Input`: For text entry
- `Select`: For dropdown selections
- `Slider`: For range selections
- `Tabs`: For tabbed interfaces
- `Toast`: For notifications

## Component Data Flow

Example data flow for the eligibility assessment:

1. User inputs data in `FormStep1`, `FormStep2`, and `FormStep3`
2. `useEligibilityForm` hook manages the data
3. When submitted, data is processed by `calculateEligibility` utility
4. Results are displayed in `EligibilityResult` component
5. Data can be saved to localStorage through the hook's `handleSaveToLocalStorage` function
