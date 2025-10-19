import { useState } from 'react';

export interface PdfExtractionResult {
    success: boolean;
    extracted_text: string;
    page_count: number;
    pages_with_text: number;
    pages: Array<{
        page_number: number;
        text: string;
        text_length: number;
        has_text: boolean;
    }>;
    metadata: {
        title: string;
        author: string;
        subject: string;
        creator: string;
        producer: string;
        creation_date: string;
        modification_date: string;
        extraction_method: string;
        accuracy: string;
        processing_time: string;
    };
    extracted_info: {
        emails: string[];
        phones: string[];
        dates: string[];
        names: string[];
        skills: string[];
        companies: string[];
        education: string[];
        locations: string[];
        monetary_amounts: string[];
    };
    statistics: {
        character_count: number;
        word_count: number;
        sentence_count: number;
        paragraph_count: number;
        average_words_per_sentence: number;
        reading_time_minutes: number;
    };
    confidence: number;
    file_info: {
        filename: string;
        size: number;
        content_type: string;
    };
    error?: string;
}

export const usePdfExtraction = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ stage: '', percentage: 0 });

    const checkServerHealth = async (): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:8001/health');
            return response.ok;
        } catch (error) {
            console.warn('PyPDF server health check failed:', error);
            return false;
        }
    };

    const extractPdf = async (file: File): Promise<PdfExtractionResult> => {
        setIsProcessing(true);
        setProgress({ stage: 'Checking PDF service...', percentage: 10 });

        try {
            // Check if server is available
            const isServerHealthy = await checkServerHealth();
            if (!isServerHealthy) {
                throw new Error('PDF extraction service is not available. Please ensure the Python backend is running on port 8001.');
            }

            setProgress({ stage: 'Uploading PDF to extraction service...', percentage: 30 });

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);

            setProgress({ stage: 'Processing PDF with PyPDF...', percentage: 50 });

            // Call the Python service
            const response = await fetch('http://localhost:8001/extract-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            setProgress({ stage: 'Finalizing extraction...', percentage: 90 });

            const result: PdfExtractionResult = await response.json();

            setProgress({ stage: 'PDF extraction complete!', percentage: 100 });

            return result;

        } catch (error) {
            console.error('PDF extraction failed:', error);

            // Return error result
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                extracted_text: '',
                page_count: 0,
                pages_with_text: 0,
                pages: [],
                metadata: {
                    title: '',
                    author: '',
                    subject: '',
                    creator: '',
                    producer: '',
                    creation_date: '',
                    modification_date: '',
                    extraction_method: 'PyPDF Server (Failed)',
                    accuracy: 'N/A',
                    processing_time: new Date().toISOString()
                },
                extracted_info: {
                    emails: [],
                    phones: [],
                    dates: [],
                    names: [],
                    skills: [],
                    companies: [],
                    education: [],
                    locations: [],
                    monetary_amounts: []
                },
                statistics: {
                    character_count: 0,
                    word_count: 0,
                    sentence_count: 0,
                    paragraph_count: 0,
                    average_words_per_sentence: 0,
                    reading_time_minutes: 0
                },
                confidence: 0,
                file_info: {
                    filename: file.name,
                    size: file.size,
                    content_type: file.type
                }
            };
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        extractPdf,
        checkServerHealth,
        isProcessing,
        progress
    };
};