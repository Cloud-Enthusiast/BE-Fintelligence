import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Download,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useFileExtraction, ExtractedData } from '@/hooks/useFileExtraction';
import PdfViewer from './PdfViewer';
import EnhancedPdfDisplay from './EnhancedPdfDisplay';

interface FileUploadExtractorProps {
  onExtractedData?: (data: ExtractedData) => void;
  showInline?: boolean;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

const FileUploadExtractor: React.FC<FileUploadExtractorProps> = ({
  onExtractedData,
  showInline = true,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = [
    'text/plain',
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf'
  ],
  className = ''
}) => {
  const { toast } = useToast();
  const { isProcessing, extractedData, processFile, clearData, progress } = useFileExtraction();
  const [showModal, setShowModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await processFile(file);
      
      if (result.error) {
        toast({
          title: "Extraction Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "File processed successfully",
          description: `Extracted ${result.extractedText.length} characters from ${result.fileName}`,
        });
      }

      onExtractedData?.(result);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the file",
        variant: "destructive"
      });
    }
  }, [processFile, onExtractedData, maxFileSize, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: isProcessing
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileText className="h-5 w-5 text-green-600" />;
    if (fileType.includes('text') || fileType.includes('json') || fileType.includes('csv')) return <FileText className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <File className="h-5 w-5 text-red-600" />;
    return <File className="h-5 w-5" />;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadAsText = (data: ExtractedData) => {
    const blob = new Blob([data.extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${data.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed transition-colors duration-200 hover:border-primary/50">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center p-8 rounded-lg transition-colors duration-200 ${
              isDragActive 
                ? 'bg-primary/5 border-primary' 
                : 'hover:bg-gray-50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {isProcessing ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isProcessing 
                    ? 'Processing file...' 
                    : isDragActive 
                      ? 'Drop the file here' 
                      : 'Drop a file here or click to browse'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: TXT, CSV, JSON, DOCX, Excel (XLSX/XLS), PDF (up to {Math.round(maxFileSize / 1024 / 1024)}MB)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(extractedData.fileType)}
                    <div>
                      <CardTitle className="text-lg">{extractedData.fileName}</CardTitle>
                      <CardDescription>
                        {formatFileSize(extractedData.fileSize)} • {extractedData.fileType}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {extractedData.error ? (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Error</span>
                      </Badge>
                    ) : (
                      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        <span>Extracted</span>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearData()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {extractedData.error ? (
                  <div className="text-red-600 bg-red-50 p-3 rounded-lg">
                    {extractedData.error}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(extractedData.extractedText)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAsText(extractedData)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {!showInline && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowModal(true)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Text
                        </Button>
                      )}
                      {(extractedData.fileType === 'application/pdf' || extractedData.fileName.toLowerCase().endsWith('.pdf')) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPdfViewer(true)}
                        >
                          <File className="h-4 w-4 mr-2" />
                          PDF Analysis
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Enhanced PDF Display for PDFs */}
                    {(extractedData.fileType === 'application/pdf' || extractedData.fileName.toLowerCase().endsWith('.pdf')) && (
                      <EnhancedPdfDisplay 
                        extractedData={extractedData} 
                        progress={progress}
                      />
                    )}

                    {/* Standard Inline Text Display for non-PDFs */}
                    {showInline && !(extractedData.fileType === 'application/pdf' || extractedData.fileName.toLowerCase().endsWith('.pdf')) && (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Text:</h4>
                        <ScrollArea className="h-64 w-full border rounded-lg p-3">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {extractedData.extractedText || 'No text extracted'}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}

                    {/* PDF Text Display (when inline is enabled) */}
                    {showInline && (extractedData.fileType === 'application/pdf' || extractedData.fileName.toLowerCase().endsWith('.pdf')) && extractedData.extractedText && (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Text:</h4>
                        <ScrollArea className="h-64 w-full border rounded-lg p-3">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {extractedData.extractedText}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Structured Data Display */}
                    {extractedData.structuredData && (
                      <div>
                        <h4 className="font-medium mb-2">Structured Data:</h4>
                        <ScrollArea className="h-32 w-full border rounded-lg p-3">
                          <pre className="text-sm">
                            {JSON.stringify(extractedData.structuredData.slice(0, 5), null, 2)}
                            {extractedData.structuredData.length > 5 && '\n... and more'}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Metadata for non-PDFs (PDFs have enhanced display) */}
                    {extractedData.metadata && !(extractedData.fileType === 'application/pdf' || extractedData.fileName.toLowerCase().endsWith('.pdf')) && (
                      <div>
                        <h4 className="font-medium mb-2">File Information:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(extractedData.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Full Text View */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Extracted Text - {extractedData?.fileName}</DialogTitle>
            <DialogDescription>
              Full text content extracted from the uploaded file
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 w-full border rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap">
              {extractedData?.extractedText || 'No text available'}
            </pre>
          </ScrollArea>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => extractedData && copyToClipboard(extractedData.extractedText)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={() => extractedData && downloadAsText(extractedData)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0">
          {extractedData && (
            <PdfViewer 
              extractedData={extractedData} 
              onClose={() => setShowPdfViewer(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploadExtractor;