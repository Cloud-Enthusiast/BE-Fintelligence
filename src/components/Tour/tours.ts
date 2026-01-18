
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
            target: '[data-tour="dashboard-stats"]',
            title: 'Performance Overview',
            content: 'Monitor your pending, approved, and rejected applications at a glance.',
            position: 'bottom'
        },
        {
            target: '[data-tour="dashboard-applications-list"]',
            title: 'Recent Activity',
            content: 'Quickly access the most recent applications that need your attention.',
            position: 'top'
        },
        {
            target: '[data-tour="dashboard-risk-alerts"]',
            title: 'AI Risk Alerts',
            content: 'Our AI monitors all applications and flags high-risk cases here for immediate review.',
            position: 'top'
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
            content: 'This feature automatically fills the application form using data extracted from the documents you uploaded. This saves time and reduces manual entry errors.',
            position: 'bottom'
        }
    ]
};

export const DOCUMENT_PROCESSOR_TOUR: Tour = {
    id: 'document_processor',
    steps: [
        {
            target: '[data-tour="doc-processor-title"]',
            title: 'Intelligent Processor',
            content: 'Convert raw financial documents into structured data using our advanced extraction engine.',
            position: 'bottom'
        },
        {
            target: '[data-tour="doc-processor-upload"]',
            title: 'Upload Documents',
            content: 'Drag and drop PDF, Excel, or Image files here. We support Balance Sheets, P&L statements, and GST returns.',
            position: 'bottom'
        },
        {
            target: '[data-tour="doc-processor-recent"]',
            title: 'Processing History',
            content: 'Track the status of your recently uploaded files and access extracted data immediately.',
            position: 'left'
        },
        {
            target: '[data-tour="doc-processor-tips"]',
            title: 'System Tips',
            content: 'Check here for best practices to ensure the highest extraction accuracy.',
            position: 'left'
        }
    ]
};

export const APPLICATION_REVIEW_TOUR: Tour = {
    id: 'application_review',
    steps: [
        {
            target: '[data-tour="review-applicant-details"]',
            title: 'Applicant Summary',
            content: 'Review the base financial standing, credit score, and debt service ratio of the applicant.',
            position: 'right'
        },
        {
            target: '[data-tour="review-risk-assessment"]',
            title: 'AI Risk Engine',
            content: 'Our AI evaluates financial and behavioral data to generate a risk score and identifies potential fraud alerts.',
            position: 'bottom'
        },
        {
            target: '[data-tour="review-stress-test"]',
            title: 'Resilience Analysis',
            content: 'See how the applicant would perform under economic stress, such as interest rate hikes or income shocks.',
            position: 'left'
        },
        {
            target: '[data-tour="review-decision-actions"]',
            title: 'Take Action',
            content: 'Once you have reviewed the AI insights, you can approve, reject, or request more information.',
            position: 'top'
        }
    ]
};
