
# BE Finance Architecture

This document provides an overview of the BE Finance application architecture.

## Application Structure

The BE Finance application follows a modern React application structure:

1. **Component-Based Architecture**: The UI is built using reusable components
2. **Context-based State Management**: Global state is managed through React contexts
3. **Route-Based Navigation**: Pages are defined as routes in the React Router setup
4. **Form-Based Workflows**: Multi-step forms for data collection and processing

## Core Architecture Components

### 1. Routing System

The application routes are defined in `App.tsx`, with protected routes ensuring authenticated access:

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    } />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    {/* Additional routes */}
  </Routes>
</BrowserRouter>
```

### 2. Authentication System

Authentication is managed through Supabase Auth via `AuthContext`:

- User authentication state with Supabase
- Login/logout functionality
- Role-based access (loan_officer, admin)
- Profile management via `profiles` table

The `ProtectedRoute` component ensures that only authenticated users can access certain routes.

### 3. Forms and Data Collection

The eligibility assessment is implemented as a multi-step form using:

- Form state management via custom hooks (`useEligibilityForm`)
- Step-by-step user interface with progress indicators
- Validation and eligibility calculation

### 4. Layout System

The application uses consistent layouts across pages:

- `Layout` component for public pages
- Dashboard layout with sidebar for authenticated pages
- Responsive design patterns

## State Management

State is managed at different levels:

1. **Component State**: Local state using `useState` for component-specific data
2. **Form State**: Custom hooks like `useEligibilityForm` to manage form data
3. **Global State**: React contexts for application-wide state:
   - `AuthContext`: Authentication and user information (via Supabase)
   - `ApplicationContext`: Loan application data

## Data Flow

1. **User Authentication**: Supabase Auth handles login/registration
2. **Eligibility Assessment**: Form data flows through multi-step components and is processed via the eligibility calculator
3. **Application Submission**: Assessment results are saved to the database

## File Upload and Document Processing

The application includes document processing capabilities:

### Components
- **FileUploadExtractor**: Full-featured component with text display
- **DocumentProcessor**: Dedicated page for document processing

### Supported File Types
- **Text Files**: TXT, JSON
- **Spreadsheets**: CSV, Excel (XLSX/XLS)
- **Documents**: Word (DOCX)

### Features
- **Client-side Processing**: All extraction happens in the browser
- **Structured Data**: CSV and Excel files are parsed into structured JSON
- **Error Handling**: Graceful handling of unsupported files

## Database Schema

The application uses Supabase with the following tables:

- **profiles**: User profile information linked to auth.users
- **user_roles**: Role assignments (loan_officer, admin)

## External Integrations

- **Supabase**: Authentication, database, and backend services
- **File Processing**: Client-side document processing with XLSX, Mammoth, and PapaParse libraries
