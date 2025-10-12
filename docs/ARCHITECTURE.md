
# BE Finance Architecture

This document provides an overview of the BE Finance application architecture, explaining how different parts of the application connect and interact with each other.

## Application Structure

The BE Finance application follows a modern React application structure with these key elements:

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

Authentication is managed through the `AuthContext` which provides:

- User authentication state
- Login/logout functionality
- User role management

The `ProtectedRoute` component ensures that only authenticated users can access certain routes, redirecting unauthenticated users to the login page.

### 3. Forms and Data Collection

The eligibility assessment is implemented as a multi-step form using:

- Form state management via custom hooks
- Step-by-step user interface
- Validation and calculation

### 4. Layout System

The application uses consistent layouts across pages:

- `Layout` component for main pages
- Header and footer components
- Responsive design patterns

## State Management

State is managed at different levels:

1. **Component State**: Local state using `useState` for component-specific data
2. **Form State**: Custom hooks like `useEligibilityForm` to manage form data
3. **Global State**: React contexts for application-wide state:
   - `AuthContext`: Authentication and user information
   - `ApplicationContext`: Loan application data

## Data Flow

1. **User Authentication**: Data flows from login forms to `AuthContext`
2. **Eligibility Assessment**: Form data flows through the multi-step form components and is processed via the eligibility calculator
3. **Application Submission**: Assessment results are saved to the database through the Supabase client

## File Upload and Information Extraction

The application includes a comprehensive file upload and information extraction system:

### Components
- **FileUploadExtractor**: Full-featured component with inline text display and modal popup
- **FileUploadWidget**: Compact widget for embedding in forms
- **DocumentProcessor**: Dedicated page for document processing

### Supported File Types
- **Text Files**: TXT, JSON
- **Spreadsheets**: CSV, Excel (XLSX/XLS) 
- **Documents**: Word (DOCX), PDF
- **Structured Data**: Automatic parsing of CSV and Excel data

### Features
- **Client-side Processing**: All extraction happens in the browser for privacy
- **Auto-population**: Extracted data can automatically populate form fields
- **Structured Data**: CSV and Excel files are parsed into structured JSON
- **Metadata Extraction**: File information and processing details
- **Error Handling**: Graceful handling of unsupported files and processing errors

### Integration Points
- Dashboard quick access card
- Sidebar navigation
- Embeddable in existing forms
- Standalone document processor page

## Data Storage and Authentication

The application uses a simplified approach for demonstration purposes:

### Authentication System
- **Mock Authentication**: Client-side authentication system for demo purposes
- **Local Storage**: User sessions and application data stored locally
- **Role-based Access**: Support for Loan Officer and Applicant roles

### Data Management
- **Local Storage**: All application data persisted in browser localStorage
- **Context-based State**: React contexts manage global application state
- **Mock Data**: Pre-populated sample applications for demonstration

### Demo Credentials
- **Loan Officer**: john@example.com / password
- **Applicant**: jane@example.com / password
- **OTP Demo**: Use '123456' for OTP login testing

## External Integrations

- **File Processing**: Client-side document processing with XLSX, Mammoth, and PapaParse libraries
