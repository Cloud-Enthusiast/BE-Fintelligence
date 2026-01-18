# Implementation Plan: MSME Loan System Revival

## Overview

This implementation plan transforms the existing loan processing application into a streamlined, intelligent document processing platform focused exclusively on Loan Officers. The tasks are organized to build incrementally, starting with system cleanup and authentication simplification, then adding document intelligence capabilities, and finally implementing advanced risk assessment features.

## Tasks

- [ ] 1. System Cleanup and Authentication Simplification
  - Remove all applicant-specific routes, components, and authentication logic
  - Fix existing bugs including undefined supabase reference in Login.tsx
  - Simplify AuthContext to support only Loan Officer role
  - Clean up unused imports and dead code
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 1.1 Write property test for authentication role validation
  - **Property 1: Authentication Role Validation**
  - **Validates: Requirements 1.2**

- [ ] 2. Document Upload Infrastructure
  - [ ] 2.1 Create DocumentUploadPanel component
    - Implement file upload interface supporting multiple document types
    - Add drag-and-drop functionality and file validation
    - Support PDF and Excel formats for different document types
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.2 Write property test for document format support
    - **Property 2: Document Format Support**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ]* 2.3 Write property test for file upload validation
    - **Property 3: File Upload Validation**
    - **Validates: Requirements 2.8, 2.9**

- [ ] 3. Enhanced Financial Data Extraction Engine
  - [ ] 3.1 Enhance FinancialDataExtractor with MSME-specific patterns
    - Implement extraction patterns for Balance Sheets, P&L Statements, Bank Statements
    - Add extraction patterns for GST Returns, ITR Documents, and CIBIL Reports
    - Create validation logic for extracted data completeness
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

  - [ ]* 3.2 Write property test for document-specific data extraction
    - **Property 4: Document-Specific Data Extraction**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [ ]* 3.3 Write property test for extraction error handling
    - **Property 5: Extraction Error Handling**
    - **Validates: Requirements 3.6**

  - [ ]* 3.4 Write property test for extracted data validation
    - **Property 6: Extracted Data Validation**
    - **Validates: Requirements 3.7**

- [ ] 4. Financial Data Display Components
  - [ ] 4.1 Create FinancialSummaryCard component
    - Implement structured display of extracted financial data
    - Add visual indicators for good/warning/critical values
    - Create side-by-side document viewer and data display
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 4.2 Write property test for financial data display
    - **Property 7: Financial Data Display**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 4.3 Write property test for threshold-based warning indicators
    - **Property 8: Threshold-Based Warning Indicators**
    - **Validates: Requirements 4.4**

  - [ ]* 4.4 Write property test for data organization by document type
    - **Property 9: Data Organization by Document Type**
    - **Validates: Requirements 4.5**

- [ ] 5. Checkpoint - Ensure document processing works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Enhanced Application Workflow
  - [ ] 6.1 Create MSMEApplicationForm component
    - Implement manual application creation interface
    - Add document import and pre-population functionality
    - Include data validation and inconsistency flagging
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.2 Write property test for document import and pre-population
    - **Property 10: Document Import and Pre-population**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ] 7. Comprehensive Application Review Interface
  - [ ] 7.1 Create enhanced ApplicationReview component
    - Implement Business Information section display
    - Add Financial Summary section with key metrics
    - Include document attachments with inline preview
    - Display eligibility scores and risk factor highlighting
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 7.2 Write property test for document preview capability
    - **Property 11: Document Preview Capability**
    - **Validates: Requirements 6.3**

  - [ ]* 7.3 Write property test for eligibility score display
    - **Property 12: Eligibility Score Display**
    - **Validates: Requirements 6.4, 7.7**

  - [ ]* 7.4 Write property test for risk factor highlighting
    - **Property 13: Risk Factor Highlighting**
    - **Validates: Requirements 6.5**

- [ ] 8. MSME-Specific Eligibility Calculator
  - [ ] 8.1 Create MSMEEligibilityCalculator utility
    - Implement DSCR calculation (Net Operating Income / Total Debt Service)
    - Add Current Ratio calculation (Current Assets / Current Liabilities)
    - Create revenue growth trend analysis
    - Implement GST compliance scoring based on filing regularity
    - Add banking relationship scoring from account history
    - Include industry-specific risk factor application
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 8.2 Write property test for DSCR calculation accuracy
    - **Property 14: DSCR Calculation Accuracy**
    - **Validates: Requirements 7.1**

  - [ ]* 8.3 Write property test for current ratio calculation accuracy
    - **Property 15: Current Ratio Calculation Accuracy**
    - **Validates: Requirements 7.2**

  - [ ]* 8.4 Write property test for revenue growth analysis
    - **Property 16: Revenue Growth Analysis**
    - **Validates: Requirements 7.3**

  - [ ]* 8.5 Write property test for GST compliance scoring
    - **Property 17: GST Compliance Scoring**
    - **Validates: Requirements 7.4**

  - [ ]* 8.6 Write property test for banking relationship scoring
    - **Property 18: Banking Relationship Scoring**
    - **Validates: Requirements 7.5**

  - [ ]* 8.7 Write property test for industry risk factor application
    - **Property 19: Industry Risk Factor Application**
    - **Validates: Requirements 7.6**

- [ ] 9. Automated Risk Assessment Engine
  - [ ] 9.1 Create RiskAssessmentEngine utility
    - Implement overall risk score calculation algorithms
    - Add document inconsistency detection logic
    - Create industry benchmark comparison functionality
    - Implement risk threshold alert generation
    - Add detailed risk score explanation generation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 9.2 Write property test for risk score calculation
    - **Property 20: Risk Score Calculation**
    - **Validates: Requirements 8.1**

  - [ ]* 9.3 Write property test for document inconsistency detection
    - **Property 21: Document Inconsistency Detection**
    - **Validates: Requirements 8.2**

  - [ ]* 9.4 Write property test for industry benchmark comparison
    - **Property 22: Industry Benchmark Comparison**
    - **Validates: Requirements 8.3**

  - [ ]* 9.5 Write property test for risk threshold alert generation
    - **Property 23: Risk Threshold Alert Generation**
    - **Validates: Requirements 8.4**

  - [ ]* 9.6 Write property test for risk score explanation generation
    - **Property 24: Risk Score Explanation Generation**
    - **Validates: Requirements 8.5**

- [ ] 10. Checkpoint - Ensure risk assessment functionality works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Risk Management Dashboard
  - [ ] 11.1 Create RiskManagementDashboard component
    - Implement real-time risk alert display
    - Add portfolio trend analysis visualization
    - Create sector concentration warning system
    - Include alert filtering and sorting functionality
    - Add exportable risk report generation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 11.2 Write property test for real-time risk alert display
    - **Property 25: Real-time Risk Alert Display**
    - **Validates: Requirements 9.1**

  - [ ]* 11.3 Write property test for portfolio trend analysis
    - **Property 26: Portfolio Trend Analysis**
    - **Validates: Requirements 9.2**

  - [ ]* 11.4 Write property test for sector concentration warnings
    - **Property 27: Sector Concentration Warnings**
    - **Validates: Requirements 9.3**

  - [ ]* 11.5 Write property test for alert filtering and sorting
    - **Property 28: Alert Filtering and Sorting**
    - **Validates: Requirements 9.4**

  - [ ]* 11.6 Write property test for risk report export
    - **Property 29: Risk Report Export**
    - **Validates: Requirements 9.5**

- [ ] 12. Navigation and Route Updates
  - [ ] 12.1 Update application routing
    - Remove applicant-specific routes
    - Add new document processing and risk management routes
    - Ensure all navigation links work correctly
    - Update sidebar navigation for new features
    - _Requirements: 1.3, 10.3_

  - [ ]* 12.2 Write property test for navigation route functionality
    - **Property 30: Navigation Route Functionality**
    - **Validates: Requirements 10.3**

- [ ] 13. Integration and Final Testing
  - [ ] 13.1 Wire all components together
    - Integrate document upload with data extraction
    - Connect eligibility calculator with risk assessment engine
    - Link risk management dashboard with application data
    - Ensure data flows correctly between all components
    - _Requirements: All requirements integration_

  - [ ]* 13.2 Write integration tests for end-to-end workflows
    - Test complete loan application processing workflow
    - Verify document upload to risk assessment pipeline
    - Test dashboard updates with new application data

- [ ] 14. Final checkpoint - Ensure all functionality works together
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Integration tests ensure components work together correctly
- The implementation builds incrementally to allow for early validation and feedback