import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { 
  Upload, FileText, Landmark, Receipt, ShieldCheck, Scale, TrendingUp, 
  CheckCircle, AlertCircle, Loader2, X 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MSMEDocumentType, DOCUMENT_TYPE_CONFIG, DocumentUploadState } from '@/types/msmeDocuments';

interface DocumentUploadPanelProps {
  documentType: MSMEDocumentType;
  onUpload: (file: File, type: MSMEDocumentType) => void;
  uploadState: DocumentUploadState;
  onClear: () => void;
}

const iconMap = {
  scale: Scale,
  'trending-up': TrendingUp,
  landmark: Landmark,
  receipt: Receipt,
  'file-text': FileText,
  'shield-check': ShieldCheck,
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  green: 'bg-green-100 text-green-600 border-green-200',
  purple: 'bg-purple-100 text-purple-600 border-purple-200',
  orange: 'bg-orange-100 text-orange-600 border-orange-200',
  red: 'bg-red-100 text-red-600 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
};

const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  documentType,
  onUpload,
  uploadState,
  onClear
}) => {
  const { toast } = useToast();
  const config = DOCUMENT_TYPE_CONFIG[documentType];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || FileText;
  const colorClasses = colorMap[config.color] || colorMap.blue;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0], documentType);
    }
  }, [onUpload, documentType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: uploadState.status === 'processing' || uploadState.status === 'uploading'
  });

  const isProcessing = uploadState.status === 'processing' || uploadState.status === 'uploading';
  const hasData = uploadState.status === 'success' && uploadState.extractedData;
  const hasError = uploadState.status === 'error';

  return (
    <Card className={`transition-all duration-200 ${isDragActive ? 'ring-2 ring-primary' : ''} ${hasData ? 'border-green-300' : hasError ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClasses}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{config.label}</CardTitle>
              <CardDescription className="text-xs">{config.description}</CardDescription>
            </div>
          </div>
          {hasData && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Processing...</p>
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center space-y-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive">{uploadState.error}</p>
                <p className="text-xs text-muted-foreground">Click to try again</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? 'Drop file here' : 'Drop or click to upload'}
                </p>
                <div className="flex gap-1">
                  {config.acceptedFormats.map(format => (
                    <Badge key={format} variant="secondary" className="text-xs">{format}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {uploadState.extractedData?.fileName}
                </p>
                <p className="text-xs text-green-600">
                  Extracted • {uploadState.extractedData?.extractionConfidence} confidence
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploadPanel;
