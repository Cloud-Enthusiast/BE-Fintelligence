
import { Tour } from './TourContext';

export const ONBOARDING_TOUR: Tour = {
    id: 'onboarding',
    steps: [
        {
            target: '[data-tour="dashboard-header"]',
            title: 'Welcome to BE Finance!',
            content: 'This dashboard provides a real-time overview of your loan portfolio and risk metrics.',
            position: 'bottom'
        },
        {
            target: '[data-tour="sidebar-applications"]',
            title: 'Manage Applications',
            content: 'Access and review all pending loan applications here. You can also create new assessments.',
            position: 'right'
        },
        {
            target: '[data-tour="sidebar-document-processor"]',
            title: 'Intelligent Data Extraction',
            content: 'Upload MSME documents (Balance Sheets, P&L, GST) here for automated data extraction and analysis.',
            position: 'right'
        }
    ]
};

export const ELIGIBILITY_TOUR: Tour = {
    id: 'eligibility_features',
    steps: [
        {
            target: '[data-tour="new-app-button"]',
            title: 'New Assessment',
            content: 'Start a new loan assessment for an MSME applicant.',
            position: 'bottom'
        },
        {
            target: '[data-tour="auto-populate-btn"]',
            title: 'Smart Auto-Populate',
            content: 'This feature automatically fills the application form using data extracted from the documents you uploaded.',
            position: 'bottom'
        }
    ]
};
