import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Zap, Eye, Target, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploadExtractor from '@/components/FileUploadExtractor';
import { ExtractedData } from '@/hooks/useFileExtraction';
import Layout from '@/components/Layout';

const EnhancedPdfDemo = () => {
  const [lastProcessedFile, setLastProcessedFile] = useState<ExtractedData | null>(null);

  const handleFileProcessed = (data: ExtractedData) => {
    setLastProcessedFile(data);
  };

  const features = [
    {
      icon: <Eye className="h-6 w-6 text-purple-600" />,
      title: "OCR Technology",
      description: "Optical Character Recognition for scanned documents and images",
      details: "Uses Tesseract.js to extract text from image-based PDFs with high accuracy"
    },
    {
      icon: <Target className="h-6 w-6 text-green-600" />,
      title: "Multi-Method Extraction",
      description: "Combines text layer extraction with OCR for maximum accuracy",
      details: "Automatically chooses the best method for each page: text layer, OCR, or both"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Smart Processing",
      description: "Intelligent page analysis and confidence scoring",
      details: "Analyzes each page individually and provides confidence scores for extracted content"
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Detailed Analysis",
      description: "Comprehensive extraction statistics and metadata",
      details: "Page-by-page breakdown, processing methods used, and extraction quality metrics"
    }
  ];

  const comparisonData = [
    {
      aspect: "Text-based PDFs",
      basic: "✅ Good",
      enhanced: "✅ Excellent",
      improvement: "Better text positioning and formatting"
    },
    {
      aspect: "Scanned PDFs",
      basic: "❌ Limited",
      enhanced: "✅ OCR Enabled",
      improvement: "Full OCR processing with Tesseract.js"
    },
    {
      aspect: "Mixed Content",
      basic: "⚠️ Text only",
      enhanced: "✅ Text + OCR",
      improvement: "Combines multiple extraction methods"
    },
    {
      aspect: "Confidence Scoring",
      basic: "❌ None",
      enhanced: "✅ Per-page scores",
      improvement: "Quality assessment for each extraction"
    },
    {
      aspect: "Processing Details",
      basic: "⚠️ Basic",
      enhanced: "✅ Comprehensive",
      improvement: "Detailed page breakdown and method tracking"
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-gradient-to-r from-purple-100 to-blue-100 p-3 mr-3">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced PDF Extraction with OCR</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience industry-grade PDF processing with OCR capabilities, multi-method extraction, 
              and detailed analysis. Now handles both text-based and scanned documents with high accuracy.
            </p>
          </div>

          {/* Enhancement Alert */}
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>New Enhancement:</strong> OCR technology added! The system now automatically detects 
              and processes scanned PDFs, image-based content, and provides detailed extraction analytics.
            </AlertDescription>
          </Alert>

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
                  <CardContent className="p-6">
                    <div className="rounded-full bg-gray-50 p-3 w-fit mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2 text-center">{feature.title}</h3>
                    <p className="text-sm text-gray-600 text-center mb-3">{feature.description}</p>
                    <p className="text-xs text-gray-500 text-center">{feature.details}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Upload PDF for Enhanced Processing
                  </CardTitle>
                  <CardDescription>
                    Upload any PDF document to see the enhanced extraction in action. The system will 
                    automatically analyze each page and choose the best extraction method.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadExtractor 
                    onExtractedData={handleFileProcessed}
                    showInline={true}
                    maxFileSize={25 * 1024 * 1024} // 25MB
                    acceptedFileTypes={['application/pdf']}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Processing Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Processing Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Text Layer Extraction</div>
                      <div className="text-blue-700">Direct extraction from PDF text streams</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Eye className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-800">OCR Processing</div>
                      <div className="text-purple-700">Optical recognition for scanned content</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">Hybrid Approach</div>
                      <div className="text-green-700">Combines both methods for best results</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Last Processed File Info */}
              {lastProcessedFile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Last Processed File</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">File:</span>
                      <span className="font-medium truncate ml-2">{lastProcessedFile.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{Math.round(lastProcessedFile.fileSize / 1024)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Text Length:</span>
                      <span className="font-medium">{lastProcessedFile.extractedText.length} chars</span>
                    </div>
                    {lastProcessedFile.metadata?.totalPages && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pages:</span>
                        <span className="font-medium">{lastProcessedFile.metadata.totalPages}</span>
                      </div>
                    )}
                    {lastProcessedFile.metadata?.confidence && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{Math.round(lastProcessedFile.metadata.confidence * 100)}%</span>
                      </div>
                    )}
                    {lastProcessedFile.metadata?.extractionMethods && (
                      <div>
                        <span className="text-gray-600">Methods:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lastProcessedFile.metadata.extractionMethods.map((method: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Basic vs Enhanced PDF Extraction
              </CardTitle>
              <CardDescription>
                See how the enhanced extraction with OCR compares to basic PDF processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Aspect</th>
                      <th className="text-left py-3 px-4 font-medium">Basic Extraction</th>
                      <th className="text-left py-3 px-4 font-medium">Enhanced with OCR</th>
                      <th className="text-left py-3 px-4 font-medium">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{row.aspect}</td>
                        <td className="py-3 px-4">{row.basic}</td>
                        <td className="py-3 px-4">{row.enhanced}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{row.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
              <CardDescription>
                How the enhanced PDF extraction works under the hood
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Text Layer Processing
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• PDF.js library for direct text extraction</li>
                    <li>• Intelligent text positioning and formatting</li>
                    <li>• Preserves document structure and layout</li>
                    <li>• Fast processing for text-based PDFs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    OCR Processing
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Tesseract.js for optical character recognition</li>
                    <li>• Page rendering to high-resolution canvas</li>
                    <li>• Confidence scoring for extracted text</li>
                    <li>• Handles scanned documents and images</li>
                  </ul>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Note:</strong> All processing happens client-side in your browser. 
                  No files are uploaded to external servers, ensuring complete privacy and security.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EnhancedPdfDemo;