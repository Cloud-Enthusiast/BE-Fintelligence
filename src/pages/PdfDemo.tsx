import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Zap, Search, BookOpen, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FileUploadExtractor from '@/components/FileUploadExtractor';
import PdfViewer from '@/components/PdfViewer';
import { ExtractedData } from '@/hooks/useFileExtraction';
import Layout from '@/components/Layout';

const PdfDemo = () => {
  const [extractedPdf, setExtractedPdf] = useState<ExtractedData | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handlePdfExtracted = (data: ExtractedData) => {
    if (data.fileType === 'application/pdf' || data.fileName.toLowerCase().endsWith('.pdf')) {
      setExtractedPdf(data);
      setShowViewer(true);
    }
  };

  const features = [
    {
      icon: <FileText className="h-6 w-6 text-red-600" />,
      title: "Complete PDF Text Extraction",
      description: "Extract all text content from PDF documents using PDF.js library"
    },
    {
      icon: <Search className="h-6 w-6 text-blue-600" />,
      title: "Smart Information Detection",
      description: "Automatically detect emails, phone numbers, dates, and monetary amounts"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      title: "Advanced PDF Analysis",
      description: "View document statistics, metadata, and structured information extraction"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Real-time Processing",
      description: "Fast client-side processing with detailed progress and error handling"
    }
  ];

  const samplePdfs = [
    {
      name: "Business Plan Template",
      description: "Multi-page business plan with financial projections",
      size: "2.3 MB"
    },
    {
      name: "Financial Statement",
      description: "Annual financial report with tables and charts",
      size: "1.8 MB"
    },
    {
      name: "Contract Document",
      description: "Legal contract with terms and conditions",
      size: "856 KB"
    }
  ];

  if (showViewer && extractedPdf) {
    return (
      <Layout>
        <PdfViewer 
          extractedData={extractedPdf} 
          onClose={() => {
            setShowViewer(false);
            setExtractedPdf(null);
          }}
        />
      </Layout>
    );
  }

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
              <div className="rounded-full bg-red-100 p-3 mr-3">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">PDF Text Extraction Demo</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload any PDF document to see complete text extraction with smart information detection, 
              document analysis, and advanced viewing capabilities.
            </p>
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
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload PDF Document</CardTitle>
                  <CardDescription>
                    Upload any PDF file to see complete text extraction and analysis. 
                    The system will automatically detect and extract all readable text content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadExtractor 
                    onExtractedData={handlePdfExtracted}
                    showInline={true}
                    maxFileSize={25 * 1024 * 1024} // 25MB for PDFs
                    acceptedFileTypes={['application/pdf']}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* What Gets Extracted */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Search className="h-5 w-5 mr-2" />
                    What Gets Extracted
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Text</Badge>
                    <p>All readable text content from every page</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Emails</Badge>
                    <p>Email addresses found in the document</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Phones</Badge>
                    <p>Phone numbers in various formats</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Dates</Badge>
                    <p>Date references and timestamps</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Amounts</Badge>
                    <p>Monetary values and financial figures</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Names</Badge>
                    <p>Potential person and company names</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-0.5">Stats</Badge>
                    <p>Word count, page count, and document metrics</p>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Try Sample Documents</CardTitle>
                  <CardDescription>
                    Don't have a PDF? Try these sample document types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {samplePdfs.map((pdf, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{pdf.name}</h4>
                        <span className="text-xs text-gray-500">{pdf.size}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{pdf.description}</p>
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Download className="h-3 w-3 mr-2" />
                        Sample PDF (Demo)
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>PDF.js Library:</strong> Industry-standard PDF processing</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Client-side Processing:</strong> Your files never leave your device</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Smart Parsing:</strong> Regex-based information extraction</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Search & Highlight:</strong> Find text within extracted content</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Export Options:</strong> Copy to clipboard or download as text</p>
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

export default PdfDemo;