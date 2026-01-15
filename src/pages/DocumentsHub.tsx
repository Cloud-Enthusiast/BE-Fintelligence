import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/contexts/DocumentContext';
import { useFileExtraction } from '@/hooks/useFileExtraction';
import { extractMsmeDocument } from '@/utils/msmeFinancialExtractor';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import DocumentUploadPanel from '@/components/DocumentUploadPanel';
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  MSMEDocumentType, 
  DocumentUploadState, 
  ExtractedMSMEData,
  DOCUMENT_TYPE_CONFIG 
} from '@/types/msmeDocuments';
import { 
  FileStack, 
  Upload, 
  FileCheck2, 
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react';

const DOCUMENT_TYPES: MSMEDocumentType[] = [
  'balance_sheet',
  'profit_loss',
  'bank_statement',
  'gst_returns',
  'itr_document',
  'cibil_report'
];

const initialUploadStates: Record<MSMEDocumentType, DocumentUploadState> = {
  balance_sheet: { file: null, status: 'idle', extractedData: null, error: null },
  profit_loss: { file: null, status: 'idle', extractedData: null, error: null },
  bank_statement: { file: null, status: 'idle', extractedData: null, error: null },
  gst_returns: { file: null, status: 'idle', extractedData: null, error: null },
  itr_document: { file: null, status: 'idle', extractedData: null, error: null },
  cibil_report: { file: null, status: 'idle', extractedData: null, error: null },
};

const DocumentsHub = () => {
  const { profile, isDemoMode } = useAuth();
  const { documents, addDocument, removeDocument, clearAllDocuments } = useDocuments();
  const { processFile, isProcessing, progress } = useFileExtraction();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadStates, setUploadStates] = useState<Record<MSMEDocumentType, DocumentUploadState>>(initialUploadStates);
  const [selectedDocument, setSelectedDocument] = useState<ExtractedMSMEData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleUpload = useCallback(async (file: File, type: MSMEDocumentType) => {
    // Update state to processing
    setUploadStates(prev => ({
      ...prev,
      [type]: { ...prev[type], file, status: 'processing', error: null }
    }));

    try {
      // Extract text from file
      const extractedData = await processFile(file);
      
      if (extractedData.error) {
        throw new Error(extractedData.error);
      }

      // Extract MSME-specific data
      const msmeData = extractMsmeDocument({
        type,
        extractedText: extractedData.extractedText,
        structuredData: extractedData.structuredData,
        fileName: file.name
      });

      // Store in context
      addDocument({
        documentType: type,
        fileName: file.name,
        fileSize: file.size,
        extractedData: msmeData
      });

      // Update upload state
      setUploadStates(prev => ({
        ...prev,
        [type]: { 
          file, 
          status: 'success', 
          extractedData: msmeData, 
          error: null 
        }
      }));

      toast({
        title: "Document Processed",
        description: `${DOCUMENT_TYPE_CONFIG[type].label} extracted with ${msmeData.extractionConfidence} confidence`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process document';
      setUploadStates(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'error', error: errorMsg }
      }));

      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: errorMsg,
      });
    }
  }, [processFile, addDocument]);

  const handleClear = useCallback((type: MSMEDocumentType) => {
    setUploadStates(prev => ({
      ...prev,
      [type]: initialUploadStates[type]
    }));
    
    // Remove from stored documents
    const docToRemove = documents.find(d => d.documentType === type);
    if (docToRemove) {
      removeDocument(docToRemove.id);
    }
  }, [documents, removeDocument]);

  const handleViewDetails = (data: ExtractedMSMEData) => {
    setSelectedDocument(data);
    setDetailsOpen(true);
  };

  const completedDocs = Object.values(uploadStates).filter(s => s.status === 'success').length;
  const processingDocs = Object.values(uploadStates).filter(s => s.status === 'processing').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader onSidebarToggle={handleSidebarToggle} />
        
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">Document Upload Hub</h1>
                  {isDemoMode && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Demo Mode
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">Upload MSME financial documents for automated data extraction</p>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <div className="flex items-center gap-2 text-sm">
                  <FileCheck2 className="h-4 w-4 text-green-600" />
                  <span>{completedDocs} of {DOCUMENT_TYPES.length} documents</span>
                </div>
                {documents.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllDocuments}
                    className="text-red-600 hover:bg-red-50"
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
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-blue-800">
                          Processing... {progress.stage} ({progress.percentage}%)
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
        </main>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedDocument && DOCUMENT_TYPE_CONFIG[selectedDocument.documentType].label}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.fileName} • Extracted at {selectedDocument && new Date(selectedDocument.extractedAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedDocument && (
              <div className="space-y-4">
                {/* Extracted Fields */}
                <div>
                  <h4 className="font-medium mb-2">Extracted Fields</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedDocument.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Raw Text Preview */}
                {selectedDocument.rawText && (
                  <div>
                    <h4 className="font-medium mb-2">Raw Text (Preview)</h4>
                    <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                      {selectedDocument.rawText.slice(0, 2000)}
                      {selectedDocument.rawText.length > 2000 && '...'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsHub;
