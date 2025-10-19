import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Eye, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Clock,
  Target,
  Layers,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExtractedData } from '@/hooks/useFileExtraction';

interface EnhancedPdfDisplayProps {
  extractedData: ExtractedData;
  progress?: { current: number; total: number; stage: string };
}

const EnhancedPdfDisplay: React.FC<EnhancedPdfDisplayProps> = ({ extractedData, progress }) => {
  const metadata = extractedData.metadata;
  const isEnhanced = metadata?.enhancedExtraction;
  const hasOCR = metadata?.extractionMethods?.includes('ocr') || metadata?.ocrPagesProcessed > 0;
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'text':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Text Layer</Badge>;
      case 'ocr':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">OCR</Badge>;
      case 'both':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Text + OCR</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Progress */}
      {progress && progress.stage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium">{progress.stage}</p>
                {progress.total > 0 && (
                  <Progress 
                    value={(progress.current / progress.total) * 100} 
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced PDF Information */}
      {isEnhanced && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Enhanced PDF Analysis</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {hasOCR && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Eye className="h-3 w-3 mr-1" />
                      OCR Enabled
                    </Badge>
                  )}
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enhanced
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Advanced extraction with OCR and intelligent text processing
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="pages">Page Analysis</TabsTrigger>
                  <TabsTrigger value="methods">Methods Used</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {metadata?.totalPages || 0}
                      </div>
                      <div className="text-sm text-blue-800">Total Pages</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {metadata?.pagesWithText || 0}
                      </div>
                      <div className="text-sm text-green-800">With Text</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {metadata?.ocrPagesProcessed || 0}
                      </div>
                      <div className="text-sm text-purple-800">OCR Pages</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round((metadata?.confidence || 0) * 100)}%
                      </div>
                      <div className="text-sm text-orange-800">Confidence</div>
                    </div>
                  </div>

                  {metadata?.confidence && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Extraction Confidence</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(metadata.confidence)}`}>
                          {Math.round(metadata.confidence * 100)}%
                        </span>
                      </div>
                      <Progress value={metadata.confidence * 100} className="h-2" />
                    </div>
                  )}

                  {metadata?.processingTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Processing Time
                      </span>
                      <span className="font-mono">
                        {(metadata.processingTime / 1000).toFixed(2)}s
                      </span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pages" className="space-y-4 mt-4">
                  {metadata?.pageBreakdown && metadata.pageBreakdown.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {metadata.pageBreakdown.map((page: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {page.pageNum}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                Page {page.pageNum}
                              </div>
                              <div className="text-xs text-gray-600">
                                {page.textLength} characters
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getMethodBadge(page.method)}
                            {page.confidence && (
                              <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(page.confidence)}`}>
                                {Math.round(page.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No page breakdown available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="methods" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {metadata?.extractionMethods?.map((method: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {method === 'text' && <FileText className="h-5 w-5 text-blue-600" />}
                          {method === 'ocr' && <Eye className="h-5 w-5 text-purple-600" />}
                          {method === 'both' && <Target className="h-5 w-5 text-green-600" />}
                          <div>
                            <div className="font-medium capitalize">{method} Extraction</div>
                            <div className="text-sm text-gray-600">
                              {method === 'text' && 'Direct text layer extraction from PDF'}
                              {method === 'ocr' && 'Optical Character Recognition on rendered pages'}
                              {method === 'both' && 'Combined text layer and OCR extraction'}
                            </div>
                          </div>
                        </div>
                        {getMethodBadge(method)}
                      </div>
                    ))}

                    {metadata?.fallbackUsed && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium text-yellow-800">Fallback Method Used</div>
                          <div className="text-sm text-yellow-700">
                            Primary extraction methods failed, used basic PDF parsing
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Standard PDF Information (for non-enhanced) */}
      {!isEnhanced && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                PDF Information
              </CardTitle>
              {metadata?.fallbackUsed && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Fallback Used
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {metadata?.totalPages && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{metadata.totalPages}</span>
                </div>
              )}
              {metadata?.pagesWithText && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages with text:</span>
                  <span className="font-medium">{metadata.pagesWithText}</span>
                </div>
              )}
              {metadata?.extractionMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{metadata.extractionMethod}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Information */}
      {extractedData.error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Extraction Error</h4>
                <p className="text-sm text-red-700 mt-1">{extractedData.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Quality Info */}
      {extractedData.extractedText && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Extraction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {extractedData.extractedText.length.toLocaleString()}
                </div>
                <div className="text-gray-600">Characters</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {extractedData.extractedText.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}
                </div>
                <div className="text-gray-600">Words</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {extractedData.extractedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
                </div>
                <div className="text-gray-600">Sentences</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">
                  {extractedData.extractedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length}
                </div>
                <div className="text-gray-600">Paragraphs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPdfDisplay;