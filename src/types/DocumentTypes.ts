
export type DocumentType =
    | 'balance_sheet'
    | 'profit_loss'
    | 'bank_statement'
    | 'gst_return'
    | 'itr_document'
    | 'cibil_report';

export interface UploadedDocument {
    id: string;
    filename: string;
    type: DocumentType;
    size: number;
    uploadedAt: Date;
    extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
    file?: File; // Determine if we want to store the File object temporarily
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
    balance_sheet: "Balance Sheet",
    profit_loss: "Profit & Loss Statement",
    bank_statement: "Bank Statement",
    gst_return: "GST Return",
    itr_document: "ITR Document",
    cibil_report: "CIBIL Report"
};

export const ALLOWED_FILE_TYPES: Record<DocumentType, string[]> = {
    balance_sheet: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    profit_loss: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    bank_statement: ['application/pdf'],
    gst_return: ['application/pdf'],
    itr_document: ['application/pdf'],
    cibil_report: ['application/pdf']
};

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
