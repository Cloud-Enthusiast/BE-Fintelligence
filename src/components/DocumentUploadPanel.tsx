
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MSMEDocumentType, DocumentUploadState, DOCUMENT_TYPE_CONFIG } from '@/types/msmeDocuments';
import { Card, CardContent } from '@/components/ui/card'; // Using shorter imports if configured, but keeping relative if needed. The previous file used ../ui/card
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadPanelProps {
  documentType: MSMEDocumentType;
  onUpload: (file: File, type: MSMEDocumentType) => void;
  uploadState: DocumentUploadState;
  onClear: () => void;
  className?: string;
}

// Helper to map simplified format names (PDF, Excel) to MIME types for Dropzone
const getAcceptedMimes = (formats: string[]): Record<string, string[]> => {
  const mimes: Record<string, string[]> = {};
  formats.forEach(fmt => {
    if (fmt === 'PDF') mimes['application/pdf'] = ['.pdf'];
    if (fmt === 'Excel') {
      mimes['application/vnd.ms-excel'] = ['.xls'];
      mimes['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx'];
    }
    if (fmt === 'CSV') mimes['text/csv'] = ['.csv'];
    if (fmt === 'JSON') mimes['application/json'] = ['.json'];
  });
  return mimes;
};

const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  documentType,
  onUpload,
  uploadState,
  onClear,
  className
}) => {
  const config = DOCUMENT_TYPE_CONFIG[documentType];
  const { status, file, extractedData, error } = uploadState;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0], documentType);
    }
  }, [documentType, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedMimes(config.acceptedFormats),
    maxFiles: 1,
    disabled: status === 'processing' || status === 'success'
  });

  return (
    <Card className={cn("h-full border-2", className,
      status === 'success' ? "border-green-200 bg-green-50/30" :
        status === 'error' ? "border-red-200 bg-red-50/30" :
          isDragActive ? "border-primary bg-primary/5" : "border-dashed hover:border-primary/50"
    )}>
      <CardContent className="p-6 flex flex-col h-full justify-center">
        {status === 'success' && extractedData ? (
          <div className="text-center space-y-4">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{config.label}</h3>
              <p className="text-sm text-gray-500 truncate max-w-[200px] mx-auto" title={extractedData.fileName}>
                {extractedData.fileName}
              </p>
            </div>
            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
              Parsed Successfully
            </div>
            <Button variant="outline" size="sm" onClick={onClear} className="w-full mt-2">
              Replace
            </Button>
          </div>
        ) : (
          <div {...getRootProps()} className={cn("text-center cursor-pointer space-y-4", status === 'processing' && "pointer-events-none")}>
            <input {...getInputProps()} />

            <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto group-hover:bg-gray-200 transition-colors">
              {status === 'processing' ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : error ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : (
                <UploadCloud className="h-6 w-6 text-gray-500" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-gray-900">{config.label}</h3>
              {status === 'processing' ? (
                <p className="text-sm text-primary">Processing...</p>
              ) : error ? (
                <p className="text-xs text-red-600">{error}</p>
              ) : (
                <p className="text-xs text-gray-500">{config.description}</p>
              )}
            </div>

            {status !== 'processing' && !error && (
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                {config.acceptedFormats.join(', ')}
              </p>
            )}

            {error && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-xs text-red-600 h-6">
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploadPanel;
