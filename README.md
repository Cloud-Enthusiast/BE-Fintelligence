
# LoanWise - Loan Management Application

**URL**: https://lovable.dev/projects/d5efe87d-43e4-4dc5-8005-7794d3a76a61

## Project Overview

LoanWise is a comprehensive loan application and management system designed for financial institutions. It provides a secure platform for loan officers to review and process loan applications, while offering applicants an intuitive interface to submit their loan requests.

## Features

### For Loan Officers
- **Secure Authentication**: Dedicated login system for loan officers
- **Dashboard**: Comprehensive overview of loan applications with key metrics
- **Application Review**: Detailed examination of applicant information, financial data, and eligibility
- **Approval Process**: Tools for approving, rejecting, or requesting additional information

### For Loan Applicants
- **User Registration & Login**: Simple account creation and authentication
- **Application Form**: Intuitive form for submitting loan applications
- **Application Status Tracking**: Monitor the progress and status of submitted applications

## Technology Stack

This project is built with modern web technologies:

- **Frontend**: 
  - React with TypeScript for type safety
  - Vite for fast development and building
  - Tailwind CSS for responsive styling
  - Shadcn UI for beautiful component library
  - Framer Motion for smooth animations
  - Tanstack React Query for data fetching

- **Backend**:
  - Supabase for authentication, database, and storage
  - PostgreSQL database (provided by Supabase)

## Authentication

The application utilizes Supabase authentication with the following features:
- Username/password authentication
- Role-based access control (Loan Officer vs Applicant)
- Demo credentials:
  - Loan Officer: username: admin, password: admin123
  - Applicant: username: user, password: user123

## Project Structure

- `/src`
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/integrations` - External service integrations
  - `/lib` - Utility functions and helpers
  - `/pages` - Page components
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions

## Getting Started

### Prerequisites

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Deployment

The application can be deployed directly from Lovable by clicking on Share -> Publish.

### Custom Domain Setup

For custom domain setup, please refer to the [Lovable documentation on custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/).

## Contributing

This project is developed using Lovable AI. You can make changes through:

1. **Using Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/d5efe87d-43e4-4dc5-8005-7794d3a76a61) and start prompting.
2. **Direct GitHub editing**: Edit files on GitHub and commit your changes.
3. **Local development**: Clone the repo, make changes, and push them back.
4. **GitHub Codespaces**: Use GitHub's cloud development environment.

## License

This project is proprietary and confidential. All rights reserved.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.io/)
