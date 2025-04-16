
# BE Finance Development Guide

This guide provides information for developers who want to contribute to or extend the BE Finance application.

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd be-finance
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open the application in your browser
```
http://localhost:5173
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── eligibility/   # Eligibility form components
│   └── ui/            # Shadcn UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configuration
├── pages/          # Page components
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Workflows and Patterns

### Adding a New Page

1. Create a new component in the `pages` directory
2. Add the route in `App.tsx`
3. If the page requires authentication, wrap it with `ProtectedRoute`

Example:
```tsx
// src/pages/NewPage.tsx
import Layout from '@/components/Layout';

const NewPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1>New Page</h1>
        {/* Page content */}
      </div>
    </Layout>
  );
};

export default NewPage;

// In App.tsx
<Route path="/new-page" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />
```

### Creating a New Component

1. Create a new file in the appropriate directory under `components`
2. Follow the existing component patterns
3. Use TypeScript for type safety

Example:
```tsx
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

const MyComponent = ({ title, children }: MyComponentProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

export default MyComponent;
```

### Using Context for State Management

1. Create a context provider in the `contexts` directory
2. Define the context value and provider logic
3. Wrap the necessary parts of your application with the provider

Example:
```tsx
// src/contexts/MyContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
};

export const MyProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState('');
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};
```

### Form Handling Pattern

The application uses a consistent pattern for form handling:

1. Create a custom hook for form state and logic
2. Separate form into step components if multi-step
3. Use controlled inputs with onChange handlers

Example pattern from `useEligibilityForm`:
```typescript
// Form state
const [formData, setFormData] = useState<FormData>({ /* initial values */ });

// Input handler
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Form submission
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Process form data
};
```

## Working with Supabase

The application uses Supabase for backend services.

### Authentication

```typescript
// Login example
const { data, error } = await supabase.auth.signInWithPassword({
  email: username,
  password: password,
});

// Logout example
await supabase.auth.signOut();
```

### Database Operations

```typescript
// Insert data example
const { error } = await supabase
  .from('table_name')
  .insert({ field1: value1, field2: value2 });

// Query data example
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('field', value);
```

## Best Practices

### Component Design

- Keep components small and focused on a single responsibility
- Use TypeScript interfaces for props
- Follow naming conventions:
  - Components: PascalCase (e.g., `EligibilityForm`)
  - Files: Same as component name (e.g., `EligibilityForm.tsx`)
  - Hooks: camelCase with 'use' prefix (e.g., `useEligibilityForm`)

### State Management

- Use component state for local UI state
- Use context for shared state across components
- Keep state as close as possible to where it's used

### Styling

- Use Tailwind CSS utility classes
- Follow the established color system
- Keep responsive design in mind

### Error Handling

- Use try/catch blocks for async operations
- Display user-friendly error messages
- Log detailed errors for debugging

### Performance

- Use React.memo for expensive components
- Avoid unnecessary re-renders
- Optimize images and assets
