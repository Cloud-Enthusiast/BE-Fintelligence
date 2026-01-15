import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExtractedMSMEData, MSMEDocumentType } from '@/types/msmeDocuments';

const STORAGE_KEY = 'be_finance_documents';

export interface StoredDocument {
  id: string;
  documentType: MSMEDocumentType;
  fileName: string;
  fileSize: number;
  extractedData: ExtractedMSMEData;
  uploadedAt: string;
}

interface DocumentContextType {
  documents: StoredDocument[];
  addDocument: (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>) => string;
  removeDocument: (id: string) => void;
  getDocumentsByType: (type: MSMEDocumentType) => StoredDocument[];
  clearAllDocuments: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<StoredDocument[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocument = (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>): string => {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDoc: StoredDocument = {
      ...doc,
      id,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments(prev => [...prev, newDoc]);
    return id;
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocumentsByType = (type: MSMEDocumentType): StoredDocument[] => {
    return documents.filter(doc => doc.documentType === type);
  };

  const clearAllDocuments = () => {
    setDocuments([]);
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocument,
      removeDocument,
      getDocumentsByType,
      clearAllDocuments,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
