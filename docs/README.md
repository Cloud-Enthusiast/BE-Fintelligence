
# BE Finance - Commercial Loan Application

## Overview

BE Finance is a commercial loan application platform that provides loan eligibility assessment for businesses. The application consists of a responsive frontend interface built with modern web technologies.

## Tech Stack

- **React**: Frontend library for building user interfaces
- **TypeScript**: Adds static typing to JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Shadcn UI**: Component library for beautiful UI elements
- **React Query**: Data fetching and caching (frontend-only)
- **File Processing**: Document upload and text extraction capabilities

## Key Features

- **Demo Authentication**: Frontend-only authentication system for testing
- **Loan Eligibility Assessment**: Interactive multi-step form to check commercial loan eligibility
- **Dashboard**: Comprehensive view for loan officers with analytics
- **Application Management**: View and manage loan applications
- **Document Processing**: Upload and extract text from Excel, Word, and CSV files

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Use "Demo Mode" on the login page to test the application

**Note**: This is a frontend-only version for testing purposes. All data is stored locally in the browser.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers (Auth, Application)
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configuration
├── pages/          # Page components
└── utils/          # Utility functions
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [User Flows](./USER_FLOWS.md)
- [Components Documentation](./COMPONENTS.md)
- [Styles & Theming](./STYLES_AND_THEMING.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
