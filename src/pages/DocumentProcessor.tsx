import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Zap, Shield, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FileUploadExtractor from '@/components/FileUploadExtractor';
import { ExtractedData } from '@/hooks/useFileExtraction';
import Layout from '@/components/Layout';
import { useTour } from '@/components/Tour/TourContext';
import { DOCUMENT_PROCESSOR_TOUR } from '@/components/Tour/tours';
import { useEffect } from 'react';

const DocumentProcessor = () => {
  const navigate = useNavigate();
  const [processedFiles, setProcessedFiles] = useState<ExtractedData[]>([]);
  const { startTour, isTourSeen } = useTour();

  useEffect(() => {
    if (!isTourSeen('document_processor')) {
      const timer = setTimeout(() => {
        startTour(DOCUMENT_PROCESSOR_TOUR);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTourSeen, startTour]);

  const handleExtractedData = (data: ExtractedData) => {
    setProcessedFiles(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 files
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const features = [
    {
      icon: <Upload className="h-6 w-6 text-blue-600" />,
      title: "Multiple File Types",
      description: "Support for TXT, CSV, JSON, DOCX, Excel (XLSX/XLS), and PDF files"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Instant Processing",
      description: "Fast text and data extraction processing in your browser"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Secure & Private",
      description: "All processing happens locally - your files never leave your device"
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      title: "Processing History",
      description: "Keep track of recently processed files and their extracted data"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>

            {/* Title Section */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3 mr-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900" data-tour="doc-processor-title">Document Processor</h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Extract text and structured data from your documents instantly. Upload CSV, Excel, Word, PDF,
                and text files to get organized data, metadata, and searchable content.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="rounded-full bg-gray-50 p-3 w-fit mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2" data-tour="doc-processor-upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload & Extract</CardTitle>
                  <CardDescription>
                    Drag and drop your file or click to browse. Supported formats include documents,
                    images, and structured data files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadExtractor
                    onExtractedData={handleExtractedData}
                    showInline={true}
                    maxFileSize={15 * 1024 * 1024} // 15MB
                  />
                </CardContent>
              </Card>
            </div>

            {/* Processing History Sidebar */}
            <div data-tour="doc-processor-recent">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Files
                  </CardTitle>
                  <CardDescription>
                    Recently processed files and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processedFiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No files processed yet</p>
                      <p className="text-sm">Upload a file to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {processedFiles.map((file, index) => (
                        <motion.div
                          key={`${file.fileName}-${index}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm truncate flex-1 mr-2">
                              {file.fileName}
                            </h4>
                            {file.error ? (
                              <Badge variant="destructive" className="text-xs">
                                Error
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Success
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Size: {Math.round(file.fileSize / 1024)} KB</p>
                            <p>Text: {file.extractedText.length} chars</p>
                            {file.structuredData && (
                              <p>Rows: {file.structuredData.length}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Tips */}
              <Card className="mt-6" data-tour="doc-processor-tips">
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Excel files will extract data from the first sheet by default</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>CSV files work best with proper headers and consistent formatting</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Keep file sizes under 15MB for optimal performance</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>All processing happens locally - your data stays private</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DocumentProcessor;