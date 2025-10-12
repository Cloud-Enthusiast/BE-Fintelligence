import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import FileUploadWidget from './FileUploadWidget';
import { ExtractedData } from '@/hooks/useFileExtraction';

interface DocumentUploadDemoProps {
  title?: string;
  description?: string;
}

const DocumentUploadDemo: React.FC<DocumentUploadDemoProps> = ({
  title = "Document Upload Integration Demo",
  description = "Example of how to integrate file upload and extraction into existing forms"
}) => {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    extractedText: '',
    fileName: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<ExtractedData[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileExtracted = (data: ExtractedData) => {
    // Add to uploaded files list
    setUploadedFiles(prev => [data, ...prev.slice(0, 2)]); // Keep last 3 files
    
    // Auto-populate form fields with extracted text
    if (!data.error && data.extractedText) {
      setFormData(prev => ({
        ...prev,
        extractedText: data.extractedText,
        fileName: data.fileName,
        // If business name is empty and we have structured data, try to extract it
        businessName: prev.businessName || extractBusinessName(data)
      }));
    }
  };

  const extractBusinessName = (data: ExtractedData): string => {
    // Simple extraction logic - in real app this would be more sophisticated
    if (data.structuredData && data.structuredData.length > 0) {
      const firstRow = data.structuredData[0] as any;
      if (typeof firstRow === 'object' && firstRow !== null) {
        // Look for common business name fields
        const businessFields = ['business_name', 'company', 'name', 'Business Name', 'Company Name'];
        for (const field of businessFields) {
          if (firstRow[field]) {
            return String(firstRow[field]);
          }
        }
      }
    }
    
    // Try to extract from text (very basic)
    const lines = data.extractedText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      // Return first non-empty line as potential business name
      return lines[0].substring(0, 50); // Limit length
    }
    
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Uploaded files:', uploadedFiles);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Traditional Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label htmlFor="fileName">Source Document</Label>
                <Input
                  id="fileName"
                  value={formData.fileName}
                  readOnly
                  placeholder="No file uploaded"
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter business description"
                rows={3}
              />
            </div>

            <Separator />

            {/* File Upload Section */}
            <div>
              <Label className="text-base font-medium">Upload Supporting Documents</Label>
              <p className="text-sm text-gray-600 mb-4">
                Upload business documents, financial statements, or other relevant files. 
                Text and data will be automatically extracted and can populate form fields.
              </p>
              
              <FileUploadWidget
                onExtractedData={handleFileExtracted}
                onTextExtracted={(text, fileName) => {
                  console.log('Text extracted:', { text: text.substring(0, 100) + '...', fileName });
                }}
                compact={true}
                placeholder="Upload business documents (CSV, Excel, PDF, Word, etc.)"
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
            </div>

            {/* Extracted Text Display */}
            {formData.extractedText && (
              <div>
                <Label htmlFor="extractedText">Extracted Text</Label>
                <Textarea
                  id="extractedText"
                  value={formData.extractedText}
                  onChange={(e) => handleInputChange('extractedText', e.target.value)}
                  placeholder="Extracted text will appear here"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This text was automatically extracted from your uploaded file. You can edit it if needed.
                </p>
              </div>
            )}

            {/* File History */}
            {uploadedFiles.length > 0 && (
              <div>
                <Label className="text-base font-medium">Recently Uploaded Files</Label>
                <div className="mt-2 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {Math.round(file.fileSize / 1024)} KB • {file.extractedText.length} characters extracted
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.error ? (
                          <Badge variant="destructive" className="text-xs">Error</Badge>
                        ) : (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Processed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit">
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Integration Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Auto-population:</strong> The file upload widget can automatically populate form fields based on extracted data</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Callbacks:</strong> Use <code>onExtractedData</code> and <code>onTextExtracted</code> callbacks to handle extracted content</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Validation:</strong> Extracted data can be validated and processed before populating form fields</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>File History:</strong> Keep track of uploaded files and their processing status</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUploadDemo;