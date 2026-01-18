# Requirements Document

## Introduction

The MSME Loan Qualification System Revival enhances an existing loan processing application by simplifying the user model to single-role (Loan Officer only), implementing intelligent document processing for MSME-specific financial documents, and creating a comprehensive risk assessment engine. The system will streamline the loan application workflow while providing advanced document intelligence and automated risk scoring capabilities.

## Glossary

- **MSME**: Micro, Small, and Medium Enterprises
- **Loan_Officer**: Banking professional who processes and evaluates loan applications
- **Document_Intelligence_Engine**: AI-powered system that extracts structured data from financial documents
- **Risk_Assessment_Engine**: Automated system that calculates loan risk scores based on financial data
- **Financial_Document**: Business documents including Balance Sheets, P&L Statements, Bank Statements, GST Returns, ITR Documents, and CIBIL Reports
- **DSCR**: Debt Service Coverage Ratio - measure of cash flow available to pay current debt obligations
- **Application_Workflow**: End-to-end process from loan application creation to approval/rejection decision

## Requirements

### Requirement 1: Single-Role Authentication System

**User Story:** As a system administrator, I want to simplify the authentication system to support only Loan Officers, so that the application has a cleaner, more focused user experience.

#### Acceptance Criteria

1. WHEN a user visits the landing page, THE System SHALL display only Loan Officer login options
2. WHEN a user attempts to authenticate, THE System SHALL validate credentials against Loan Officer roles only
3. THE System SHALL remove all applicant-specific routes and components from the application
4. THE AuthContext SHALL support only Loan Officer user types
5. THE System SHALL clean up all unused authentication code and imports

### Requirement 2: Document Upload and Management Hub

**User Story:** As a Loan Officer, I want to upload and manage various MSME financial documents in a centralized hub, so that I can efficiently process loan applications with comprehensive documentation.

#### Acceptance Criteria

1. WHEN a Loan Officer accesses the Document Upload section, THE System SHALL display a dedicated upload interface
2. THE System SHALL support upload of Balance Sheets in PDF and Excel formats
3. THE System SHALL support upload of Profit & Loss Statements in PDF and Excel formats
4. THE System SHALL support upload of Bank Statements in PDF format
5. THE System SHALL support upload of GST Returns in PDF format
6. THE System SHALL support upload of ITR Documents in PDF format
7. THE System SHALL support upload of CIBIL Reports in PDF format
8. WHEN a document is uploaded, THE System SHALL validate the file format and size
9. WHEN a document upload fails, THE System SHALL display descriptive error messages

### Requirement 3: Intelligent Financial Data Extraction

**User Story:** As a Loan Officer, I want the system to automatically extract relevant financial data from uploaded documents, so that I can quickly assess loan applications without manual data entry.

#### Acceptance Criteria

1. WHEN a Balance Sheet is uploaded, THE Document_Intelligence_Engine SHALL extract Total Assets, Total Liabilities, Current Assets, Fixed Assets, Current Liabilities, Long-term Debt, Net Worth, and Working Capital
2. WHEN a P&L Statement is uploaded, THE Document_Intelligence_Engine SHALL extract Revenue, Cost of Goods, Gross Profit, Operating Expenses, EBITDA, Net Profit, and Profit Margins
3. WHEN a Bank Statement is uploaded, THE Document_Intelligence_Engine SHALL extract Average Monthly Balance, Cash Flow Pattern, Loan EMIs, Cheque Bounces, and Credits/Debits Summary
4. WHEN a GST Return is uploaded, THE Document_Intelligence_Engine SHALL extract Monthly Turnover, GST Paid, Input Credit, and Filing Regularity
5. WHEN a CIBIL Report is uploaded, THE Document_Intelligence_Engine SHALL extract Credit Score, Active Loans, Payment History, Defaults, and Settled Accounts
6. WHEN data extraction fails, THE System SHALL log the error and notify the Loan Officer
7. THE System SHALL validate extracted data for completeness and flag missing critical fields

### Requirement 4: Financial Data Display and Visualization

**User Story:** As a Loan Officer, I want to view extracted financial data in a structured, visual format alongside the original documents, so that I can quickly understand the applicant's financial position.

#### Acceptance Criteria

1. WHEN financial data is extracted, THE System SHALL display it in a FinancialSummaryCard component
2. THE System SHALL provide visual indicators for good, warning, and critical financial values
3. THE System SHALL display documents and extracted data side-by-side for easy comparison
4. WHEN financial ratios exceed safe thresholds, THE System SHALL highlight them with warning indicators
5. THE System SHALL organize extracted data by document type for clear categorization

### Requirement 5: Enhanced Application Creation Workflow

**User Story:** As a Loan Officer, I want to create new loan applications either manually or by importing data from uploaded documents, so that I can efficiently process applications with minimal data entry.

#### Acceptance Criteria

1. THE System SHALL allow Loan Officers to create new loan applications manually
2. THE System SHALL allow Loan Officers to import application data from uploaded documents
3. WHEN importing from documents, THE System SHALL pre-populate application fields with extracted data
4. THE System SHALL validate imported data and flag inconsistencies
5. WHEN manual entry is required, THE System SHALL provide clear field labels and validation

### Requirement 6: Comprehensive Application Review Interface

**User Story:** As a Loan Officer, I want to view complete loan applications with business information, financial summaries, and document attachments in one interface, so that I can make informed lending decisions.

#### Acceptance Criteria

1. THE System SHALL display a Business Information section with company details
2. THE System SHALL display a Financial Summary section with key metrics from extracted documents
3. THE System SHALL display document attachments with inline preview capability
4. THE System SHALL display eligibility score breakdown with contributing factors
5. THE System SHALL highlight risk factors and warning indicators prominently

### Requirement 7: MSME-Specific Eligibility Calculator

**User Story:** As a Loan Officer, I want an eligibility calculator that considers MSME-specific financial factors, so that I can accurately assess loan qualification based on business characteristics.

#### Acceptance Criteria

1. THE Eligibility_Calculator SHALL calculate Debt Service Coverage Ratio (DSCR) from financial data
2. THE Eligibility_Calculator SHALL calculate Current Ratio from balance sheet data
3. THE Eligibility_Calculator SHALL analyze revenue growth trends from historical data
4. THE Eligibility_Calculator SHALL score GST compliance based on filing regularity
5. THE Eligibility_Calculator SHALL score banking relationship based on account history
6. THE Eligibility_Calculator SHALL apply industry-specific risk factors to the calculation
7. THE System SHALL display eligibility score with detailed breakdown of contributing factors

### Requirement 8: Automated Risk Assessment Engine

**User Story:** As a Loan Officer, I want an automated risk assessment system that analyzes financial data and flags potential issues, so that I can identify high-risk applications efficiently.

#### Acceptance Criteria

1. THE Risk_Assessment_Engine SHALL calculate overall risk scores based on extracted financial data
2. THE Risk_Assessment_Engine SHALL flag inconsistencies between different financial documents
3. THE Risk_Assessment_Engine SHALL compare applicant metrics against industry benchmarks
4. WHEN risk scores exceed acceptable thresholds, THE System SHALL generate alerts
5. THE System SHALL provide detailed explanations for risk score calculations

### Requirement 9: Risk Management Dashboard

**User Story:** As a Loan Officer, I want a dashboard that shows real-time risk alerts and portfolio analysis, so that I can monitor overall lending risk and make strategic decisions.

#### Acceptance Criteria

1. THE System SHALL display real-time alerts for high-risk applications
2. THE System SHALL provide trend analysis for portfolio health metrics
3. THE System SHALL show sector concentration warnings when exposure limits are approached
4. THE System SHALL allow filtering and sorting of risk alerts by severity and type
5. THE System SHALL provide exportable risk reports for management review

### Requirement 10: System Cleanup and Bug Fixes

**User Story:** As a system administrator, I want existing bugs fixed and unused code removed, so that the application runs reliably and is maintainable.

#### Acceptance Criteria

1. THE System SHALL fix the undefined supabase reference in Login.tsx
2. THE System SHALL remove all unused imports and dead code
3. THE System SHALL ensure all navigation routes work correctly
4. THE System SHALL validate that all existing functionality remains operational after cleanup
5. THE System SHALL maintain consistent code formatting and structure