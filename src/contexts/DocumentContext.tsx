import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExtractedMSMEData, MSMEDocumentType } from '@/types/msmeDocuments';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const STORAGE_KEY = 'be_finance_documents';

export interface StoredDocument {
  id: string;
  documentType: MSMEDocumentType;
  fileName: string;
  fileSize: number;
  extractedData: ExtractedMSMEData;
  uploadedAt: string;
  isTemporary?: boolean;
}

interface DocumentContextType {
  documents: StoredDocument[];
  addDocument: (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>, persist?: boolean) => string;
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
  const { user } = useAuth();
  const [documents, setDocuments] = useState<StoredDocument[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch from Firestore on mount/login
  useEffect(() => {
    const fetchFirestoreDocs = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'extracted_documents'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const firestoreDocs: StoredDocument[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          firestoreDocs.push({
            id: doc.id,
            documentType: data.documentType,
            fileName: data.fileName,
            fileSize: data.fileSize || 0,
            extractedData: data as ExtractedMSMEData,
            uploadedAt: data.processedAt || data.extractedAt || new Date().toISOString(),
          });
        });

        // Merge with local docs - avoid duplicates by ID
        setDocuments(prev => {
          const existingIds = new Set(firestoreDocs.map(d => d.id));
          const localOnly = prev.filter(d => !existingIds.has(d.id));
          return [...localOnly, ...firestoreDocs];
        });
      } catch (error) {
        console.error("Error fetching Firestore docs:", error);
      }
    };

    fetchFirestoreDocs();
  }, [user]);

  // Persist to localStorage - only those NOT marked as temporary
  useEffect(() => {
    const persistentDocs = documents.filter(doc => !doc.isTemporary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentDocs));
  }, [documents]);

  const addDocument = (doc: Omit<StoredDocument, 'id' | 'uploadedAt'> & { id?: string }, persist: boolean = true): string => {
    const id = doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDoc: StoredDocument = {
      ...doc,
      id,
      uploadedAt: new Date().toISOString(),
      isTemporary: !persist
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
