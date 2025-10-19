import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Search,
  BookOpen,
  Info,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ExtractedData } from '@/hooks/useFileExtraction';
import { FinancialDataExtractor } from '@/utils/financialDataExtractor';
import FinancialDataTable from '@/components/FinancialDataTable';

interface PdfViewerProps {
  extractedData: ExtractedData;
  onClose?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ extractedData, onClose }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const [viewMode, setViewMode] = useState<'analysis' | 'raw'>('analysis');

  // Extract financial data using the intelligent extractor
  const financialData = useMemo(() => {
    if (!extractedData.extractedText) return null;
    const extractor = new FinancialDataExtractor(extractedData.extractedText);
    return extractor.extractAll();
  }, [extractedData.extractedText]);

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

  const downloadAsText = () => {
    const blob = new Blob([extractedData.extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${extractedData.fileName.replace('.pdf', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const getTextStats = () => {
    const text = extractedData.extractedText;
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    
    return {
      characters: text.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length
    };
  };

  const extractKeyInformation = () => {
    const text = extractedData.extractedText.toLowerCase();
    const info: Record<string, string[]> = {
      emails: [],
      phones: [],
      dates: [],
      amounts: [],
      names: []
    };

    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    info.emails = [...new Set(extractedData.extractedText.match(emailRegex) || [])];

    // Extract phone numbers
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    info.phones = [...new Set(extractedData.extractedText.match(phoneRegex) || [])];

    // Extract dates
    const dateRegex = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g;
    info.dates = [...new Set(extractedData.extractedText.match(dateRegex) || [])];

    // Extract monetary amounts
    const amountRegex = /\$[\d,]+\.?\d*/g;
    info.amounts = [...new Set(extractedData.extractedText.match(amountRegex) || [])];

    // Extract potential names (capitalized words)
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    info.names = [...new Set(extractedData.extractedText.match(nameRegex) || [])].slice(0, 10);

    return info;
  };

  const stats = getTextStats();
  const keyInfo = extractKeyInformation();

  return (
    <div className="w-full p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-red-100 p-2">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{extractedData.fileName}</CardTitle>
                  <CardDescription>
                    PDF Document • {Math.round(extractedData.fileSize / 1024)} KB
                    {extractedData.metadata?.totalPages && ` • ${extractedData.metadata.totalPages} pages`}
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
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {extractedData.error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Extraction Error</h4>
                <p>{extractedData.error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.characters.toLocaleString()}</div>
                  <div className="text-sm text-blue-800">Characters</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.words.toLocaleString()}</div>
                  <div className="text-sm text-green-800">Words</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.sentences}</div>
                  <div className="text-sm text-purple-800">Sentences</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{extractedData.metadata?.totalPages || 'N/A'}</div>
                  <div className="text-sm text-orange-800">Pages</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!extractedData.error && (
          <>
            {/* Action Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search in document..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* View Toggle */}
                    <div className="flex items-center space-x-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'analysis' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('analysis')}
                        className="h-8"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analysis
                      </Button>
                      <Button
                        variant={viewMode === 'raw' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('raw')}
                        className="h-8"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Raw Text
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMetadata(!showMetadata)}
                    >
                      {showMetadata ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showMetadata ? 'Hide' : 'Show'} Details
                    </Button>
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
                      onClick={downloadAsText}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            {viewMode === 'analysis' && financialData ? (
              <FinancialDataTable 
                data={financialData} 
                fileName={extractedData.fileName}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Text Content */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Extracted Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96 w-full border rounded-lg p-4">
                        <div 
                          className="text-sm whitespace-pre-wrap font-mono leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(extractedData.extractedText, searchTerm)
                          }}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Key Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Info className="h-5 w-5 mr-2" />
                      Key Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="contacts" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="contacts">Contacts</TabsTrigger>
                        <TabsTrigger value="data">Data</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="contacts" className="space-y-4 mt-4">
                        {keyInfo.emails.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Email Addresses</h4>
                            <div className="space-y-1">
                              {keyInfo.emails.slice(0, 5).map((email, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded font-mono">
                                  {email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {keyInfo.phones.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Phone Numbers</h4>
                            <div className="space-y-1">
                              {keyInfo.phones.slice(0, 5).map((phone, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded font-mono">
                                  {phone}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {keyInfo.names.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Potential Names</h4>
                            <div className="space-y-1">
                              {keyInfo.names.slice(0, 5).map((name, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                  {name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="data" className="space-y-4 mt-4">
                        {keyInfo.dates.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Dates</h4>
                            <div className="space-y-1">
                              {keyInfo.dates.slice(0, 5).map((date, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded font-mono">
                                  {date}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {keyInfo.amounts.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Monetary Amounts</h4>
                            <div className="space-y-1">
                              {keyInfo.amounts.slice(0, 5).map((amount, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded font-mono">
                                  {amount}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Metadata */}
                {showMetadata && extractedData.metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Document Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        {Object.entries(extractedData.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start">
                            <span className="text-gray-600 capitalize font-medium">
                              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                            </span>
                            <span className="font-mono text-right max-w-32 break-words">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PdfViewer;