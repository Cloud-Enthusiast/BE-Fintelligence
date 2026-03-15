import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import {
  extractMsmeDocument,
  getDocumentSummary,
  MsmeDocumentType,
} from '@/services/msmeDocumentService';
import DocumentUploadPanel from '@/components/DocumentUploadPanel';
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import {
  MSMEDocumentType,
  DocumentUploadState,
  ExtractedMSMEData,
  DOCUMENT_TYPE_CONFIG,
} from '@/types/msmeDocuments';
import {
  FileStack,
  Upload,
  FileCheck2,
  Trash2,
  Eye,
  Zap,
} from 'lucide-react';
import CibilReportView from '@/components/CibilReportView';

const DOCUMENT_TYPES: MSMEDocumentType[] = [
  'balance_sheet',
  'profit_loss',
  'bank_statement',
  'gst_returns',
  'itr_document',
  'cibil_report',
];

const initialUploadStates: Record<MSMEDocumentType, DocumentUploadState> = {
  balance_sheet: { file: null, status: 'idle', extractedData: null, error: null },
  profit_loss: { file: null, status: 'idle', extractedData: null, error: null },
  bank_statement: { file: null, status: 'idle', extractedData: null, error: null },
  gst_returns: { file: null, status: 'idle', extractedData: null, error: null },
  itr_document: { file: null, status: 'idle', extractedData: null, error: null },
  cibil_report: { file: null, status: 'idle', extractedData: null, error: null },
};

const DocumentProcessor = () => {
  const { user } = useAuth();
  const { documents, addDocument, removeDocument, clearAllDocuments } = useDocuments();

  const [uploadStates, setUploadStates] = useState<Record<MSMEDocumentType, DocumentUploadState>>(initialUploadStates);
  const [selectedDocument, setSelectedDocument] = useState<ExtractedMSMEData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<{file: File, type: MSMEDocumentType, data: ExtractedMSMEData} | null>(null);

  const handleSaveToFirebase = async (doc: {file: File, type: MSMEDocumentType, data: ExtractedMSMEData}) => {
    try {
      // Save to Firestore
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      await addDoc(collection(db, 'extracted_documents'), {
        ...doc.data,
        userId: user?.uid,
        processedAt: new Date().toISOString(),
      });

      toast({
        title: 'Saved to Database',
        description: 'Extracted information has been persisted to Firebase.',
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save to database, but data is available locally.',
      });
    }
  };

  const finalizeExtraction = (saveToFirestore: boolean) => {
    if (!pendingDoc) return;

    const { file, type, data } = pendingDoc;

    // Store in context (localStorage)
    addDocument({
      documentType: type,
      fileName: file.name,
      fileSize: file.size,
      extractedData: data,
    });

    setUploadStates(prev => ({
      ...prev,
      [type]: { file, status: 'success', extractedData: data, error: null }
    }));

    if (saveToFirestore) {
      handleSaveToFirebase(pendingDoc);
    }

    setConfirmSaveOpen(false);
    setPendingDoc(null);
  };

  const handleUpload = useCallback(async (file: File, type: MSMEDocumentType) => {
    // Mark as processing
    setUploadStates(prev => ({
      ...prev,
      [type]: { ...prev[type], file, status: 'processing', error: null }
    }));

    try {
      // Call Gemini Vision Cloud Function — works on the raw PDF/image visually
      const result = await extractMsmeDocument(file, type as MsmeDocumentType);

      // Prepare compatibility object
      const msmeData: ExtractedMSMEData = {
        documentType: type,
        fileName: file.name,
        extractedAt: new Date().toISOString(),
        data: result.data as any,
        extractionConfidence: 'high',
        aiAnalysis: (result.data as any).analysis ?? '',
        rawText: '',
      };

      setPendingDoc({ file, type, data: msmeData });
      setConfirmSaveOpen(true);

      toast({
        title: 'AI Extraction Complete',
        description: `Gemini Vision successfully analysed your ${DOCUMENT_TYPE_CONFIG[type].label}.`,
      });
    } catch (error: any) {
      const errorMsg =
        error?.message?.includes('unauthenticated')
          ? 'Please log in to extract documents.'
          : error?.message || 'Failed to process document.';

      setUploadStates(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'error', error: errorMsg }
      }));

      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: errorMsg,
      });
    }
  }, [addDocument]);

  const handleClear = useCallback((type: MSMEDocumentType) => {
    setUploadStates(prev => ({ ...prev, [type]: initialUploadStates[type] }));
    const docToRemove = documents.find(d => d.documentType === type);
    if (docToRemove) removeDocument(docToRemove.id);
  }, [documents, removeDocument]);

  const handleViewDetails = (data: ExtractedMSMEData) => {
    setSelectedDocument(data);
    setDetailsOpen(true);
  };

  const completedDocs = Object.values(uploadStates).filter(s => s.status === 'success').length;
  const processingDocs = Object.values(uploadStates).filter(s => s.status === 'processing').length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Document Hub</h1>
            <p className="text-slate-500 mt-2">Upload and manage financial documents for automated data extraction.</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
              <FileCheck2 className="h-4 w-4" />
              <span>{completedDocs} of {DOCUMENT_TYPES.length} documents</span>
            </div>
            {documents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllDocuments}
                className="text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="extracted" className="gap-2">
              <FileStack className="h-4 w-4" />
              Extracted Data ({completedDocs})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {processingDocs > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                    <span className="text-primary font-medium">
                      Gemini Vision is analysing your document...
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOCUMENT_TYPES.map(type => (
                <DocumentUploadPanel
                  key={type}
                  documentType={type}
                  onUpload={handleUpload}
                  uploadState={uploadStates[type]}
                  onClear={() => handleClear(type)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Extracted Data Tab */}
          <TabsContent value="extracted" className="space-y-6">
            {completedDocs === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileStack className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Documents Processed Yet</h3>
                  <p className="text-muted-foreground">
                    Upload documents in the "Upload Documents" tab to see extracted financial data here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(uploadStates)
                  .filter(([_, state]) => state.status === 'success' && state.extractedData)
                  .map(([type, state]) => (
                    <FinancialSummaryCard
                      key={type}
                      data={state.extractedData!}
                      onViewDetails={() => handleViewDetails(state.extractedData!)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedDocument && DOCUMENT_TYPE_CONFIG[selectedDocument.documentType].label}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.fileName} • Extracted at {selectedDocument && new Date(selectedDocument.extractedAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-1">
            {selectedDocument && (
              <div className="pb-6 pr-4 pl-1">
                {selectedDocument.documentType === 'cibil_report' ? (
                  <CibilReportView
                    data={selectedDocument.data as any}
                    aiAnalysis={selectedDocument.aiAnalysis}
                  />
                ) : (
                  <div className="space-y-6">
                    {/* AI Analysis */}
                    {selectedDocument.aiAnalysis && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          Gemini AI Analysis
                        </h4>
                        <p className="text-primary/80 text-sm leading-relaxed italic">
                          {selectedDocument.aiAnalysis}
                        </p>
                      </div>
                    )}

                    {/* Key Metrics */}
                    <div>
                      <h4 className="font-medium mb-3">Key Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {getDocumentSummary(selectedDocument.documentType as MsmeDocumentType, selectedDocument.data).map(
                          ({ label, value }) => (
                            <div key={label} className="flex justify-between bg-muted rounded-lg p-3">
                              <span className="text-muted-foreground text-sm">{label}</span>
                              <span className="font-medium text-sm">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* All Extracted Fields */}
                    <div>
                      <h4 className="font-medium mb-2">All Extracted Fields</h4>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(selectedDocument.data)
                            .filter(([key]) => key !== 'analysis')
                            .map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize text-sm">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="font-medium text-sm">{String(value)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmSaveOpen} onOpenChange={(open) => !open && finalizeExtraction(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Extracted Information?</DialogTitle>
            <DialogDescription>
              Gemini has successfully extracted data from <strong>{pendingDoc?.file.name}</strong>. 
              Would you like to save this permanently to the database?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => finalizeExtraction(false)}>
              No, keep locally
            </Button>
            <Button onClick={() => finalizeExtraction(true)} className="bg-primary hover:bg-primary/90">
              Yes, save to DB
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentProcessor;
