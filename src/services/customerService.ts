import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  where,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { ExtractedMSMEData } from '@/types/msmeDocuments';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  /** UID of the loan officer who created this record */
  userId: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
  /** PAN number — used for deduplication and CIBIL lookup */
  pan?: string;
  /** GSTIN — required for GST compliance scoring */
  gstin?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ─────────────────────────────────────────────────────────────────────────────
// Real-time subscription
// ─────────────────────────────────────────────────────────────────────────────

/** Subscribe to all customers owned by a given officer. Returns the unsubscribe fn. */
export const subscribeToCustomers = (
  userId: string,
  onData: (customers: Customer[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  // Requires composite index: (userId ASC, createdAt DESC)
  const q = query(
    collection(db, 'customers'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const customers: Customer[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId ?? '',
          businessName: d.businessName ?? '',
          fullName: d.fullName ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          businessType: d.businessType ?? '',
          pan: d.pan,
          gstin: d.gstin,
          createdAt:
            d.createdAt instanceof Timestamp
              ? d.createdAt.toDate().toISOString()
              : d.createdAt ?? new Date().toISOString(),
          updatedAt:
            d.updatedAt instanceof Timestamp
              ? d.updatedAt.toDate().toISOString()
              : d.updatedAt,
        };
      });
      onData(customers);
    },
    (error) => {
      console.error('Firestore customers snapshot error:', error);
      onError?.(error);
    }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/** Create a new customer record. Returns the new document ID. */
export const createCustomer = async (
  userId: string,
  input: CreateCustomerInput
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'customers'), {
    ...input,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

/** Update mutable fields on an existing customer record. */
export const updateCustomer = async (
  customerId: string,
  updates: Partial<CreateCustomerInput>
): Promise<void> => {
  const docRef = doc(db, 'customers', customerId);
  await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
};

// ─────────────────────────────────────────────────────────────────────────────
// Document persistence (Storage + Firestore subcollection)
// ─────────────────────────────────────────────────────────────────────────────

export interface SavedCustomerDocument {
  /** Firestore document ID (also used as the Storage folder name) */
  docId: string;
  storagePath: string;
  downloadUrl: string;
}

/**
 * Upload a document file to Firebase Storage and persist the extracted data
 * to the `customers/{customerId}/documents/{docId}` subcollection.
 *
 * Storage path: `customers/{customerId}/documents/{docId}/{filename}`
 */
export const saveCustomerDocument = async (
  customerId: string,
  userId: string,
  file: File,
  extractedData: ExtractedMSMEData
): Promise<SavedCustomerDocument> => {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const storagePath = `customers/${customerId}/documents/${docId}/${file.name}`;

  // 1. Upload original file to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  // 2. Persist extracted data to Firestore subcollection
  await setDoc(doc(db, 'customers', customerId, 'documents', docId), {
    userId,
    customerId,
    documentType: extractedData.documentType,
    fileName: file.name,
    fileSize: file.size,
    storagePath,
    downloadUrl,
    extractedData: extractedData.data,
    extractedAt: extractedData.extractedAt,
    extractionConfidence: extractedData.extractionConfidence,
    aiAnalysis: extractedData.aiAnalysis ?? '',
    processedAt: Timestamp.now(),
  });

  return { docId, storagePath, downloadUrl };
};
