import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useFileExtraction, ExtractedData } from '@/hooks/useFileExtraction';

interface FileUploadWidgetProps {
  onExtractedData?: (data: ExtractedData) => void;
  onTextExtracted?: (text: string, fileName: string) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  placeholder?: string;
  compact?: boolean;
  className?: string;
}

const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  onExtractedData,
  onTextExtracted,
  maxFileSize = 5 * 1024 * 1024, // 5MB default for widget
  acceptedFileTypes = [
    'text/plain',
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf'
  ],
  placeholder = "Drop a file here or click to upload",
  compact = false,
  className = ''
}) => {
  const { toast } = useToast();
  const { isProcessing, extractedData, processFile, clearData } = useFileExtraction();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
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
          title: "File processed",
          description: `Extracted text from ${result.fileName}`,
        });
        
        // Call both callbacks if provided
        onExtractedData?.(result);
        onTextExtracted?.(result.extractedText, result.fileName);
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the file",
        variant: "destructive"
      });
    }
  }, [processFile, onExtractedData, onTextExtracted, maxFileSize, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: isProcessing
  });

  if (compact) {
    return (
      <div className={className}>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center space-x-2">
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{placeholder}</span>
          </div>
        </div>

        {extractedData && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium truncate">{extractedData.fileName}</span>
              </div>
              <div className="flex items-center space-x-1">
                {extractedData.error ? (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearData();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {!extractedData.error && (
              <div className="text-xs text-gray-600">
                Extracted {extractedData.extractedText.length} characters
              </div>
            )}
            
            {extractedData.error && (
              <div className="text-xs text-red-600">
                {extractedData.error}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center p-6 rounded-lg transition-colors ${
              isDragActive 
                ? 'bg-primary/5 border-primary' 
                : 'hover:bg-gray-50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-3">
              <Upload className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {isProcessing 
                    ? 'Processing file...' 
                    : isDragActive 
                      ? 'Drop the file here' 
                      : placeholder
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: TXT, CSV, JSON, DOCX, Excel (XLSX/XLS), PDF (up to {Math.round(maxFileSize / 1024 / 1024)}MB)
                </p>
              </div>
            </div>
          </div>

          {extractedData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{extractedData.fileName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {extractedData.error ? (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearData}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {extractedData.error ? (
                <div className="text-red-600 text-sm">
                  {extractedData.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Extracted {extractedData.extractedText.length} characters
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border text-sm">
                    <pre className="whitespace-pre-wrap font-mono">
                      {extractedData.extractedText.substring(0, 500)}
                      {extractedData.extractedText.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadWidget;