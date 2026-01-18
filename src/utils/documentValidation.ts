
import { DocumentType, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from '../types/DocumentTypes';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateDocument = (file: File, type: DocumentType): ValidationResult => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            error: `File size exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit.`
        };
    }

    const allowedTypes = ALLOWED_FILE_TYPES[type];
    if (!allowedTypes.includes(file.type)) {
        // Check for file extension as fallback if mime type is missing/generic
        const extension = file.name.split('.').pop()?.toLowerCase();
        const isExcel = (extension === 'xls' || extension === 'xlsx') &&
            (type === 'balance_sheet' || type === 'profit_loss');

        // Explicitly allow if it's an excel file for supported types, even if mime type check flaked
        // But ideally we rely on mime types. Let's be strict for now based on requirements.
        // However, windows often has weird mime types for excel.

        return {
            isValid: false,
            error: `Invalid file format. Allowed formats: ${allowedTypes.join(', ')}`
        };
    }

    return { isValid: true };
};
