import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  Copy, 
  Download, 
  FileText, 
  Info, 
  AlertTriangle, 
  XCircle,
  Edit3,
  Save,
  X,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  ChevronDown,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedCibilData, ValidationFlag } from '@/types/enhanced-cibil';

interface EnhancedCibilTableProps {
  data: EnhancedCibilData;
  fileName: string;
  showConfidenceScores?: boolean;
  showValidationFlags?: boolean;
  onFieldEdit?: (field: string, value: string) => void;
}

const EnhancedCibilTable: React.FC<EnhancedCibilTableProps> = ({ 
  data, 
  fileName, 
  showConfidenceScores = false,
  showValidationFlags = true,
  onFieldEdit 
}) => {
  const { toast } = useToast();
  const [showConfidence, setShowConfidence] = useState(showConfidenceScores);
  const [showFlags, setShowFlags] = useState(showValidationFlags);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Complete table data matching the exact specification format from user's image
  const tableData = [
    { 
      key: 'nameOfCustomer',
      label: 'Name of Customer :', 
      value: (data as any).nameOfCustomer || data.applicantName || '',
      confidence: data.fieldConfidence.applicantName || 0,
      editable: true
    },
    { 
      key: 'cibilScore',
      label: 'CIBIL Score :', 
      value: data.cibilScore,
      confidence: data.fieldConfidence.cibilScore,
      editable: true
    },
    { 
      key: 'bankName',
      label: 'Bank Name :', 
      value: (data as any).bankName || '',
      confidence: (data.fieldConfidence as any).bankName || 0,
      editable: true
    },
    { 
      key: 'accountType',
      label: 'Account type :', 
      value: (data as any).accountType || '',
      confidence: (data.fieldConfidence as any).accountType || 0,
      editable: true
    },
    { 
      key: 'loansPerBank',
      label: 'Loans per bank :', 
      value: (data as any).loansPerBank || data.numberOfLoans || '',
      confidence: data.fieldConfidence.numberOfLoans || 0,
      editable: true
    },
    { 
      key: 'totalAmountOfLoan',
      label: 'Total Amount of Loan :', 
      value: (data as any).totalAmountOfLoan || data.totalLoanAmount || '',
      confidence: data.fieldConfidence.totalLoanAmount || 0,
      editable: true
    },
    { 
      key: 'bouncedDetails',
      label: 'Bounced details :', 
      value: (data as any).bouncedDetails || '',
      confidence: (data.fieldConfidence as any).bouncedDetails || 0,
      editable: true
    },
    { 
      key: 'typeOfCollateral',
      label: 'Type of Collateral :', 
      value: (data as any).typeOfCollateral || '',
      confidence: (data.fieldConfidence as any).typeOfCollateral || 0,
      editable: true
    },
    { 
      key: 'emiAmount',
      label: 'EMI Amount :', 
      value: (data as any).emiAmount || '',
      confidence: (data.fieldConfidence as any).emiAmount || 0,
      editable: true
    },
    { 
      key: 'writtenOffAmountTotal',
      label: 'Written off amount (Total) :', 
      value: (data as any).writtenOffAmountTotal || '',
      confidence: (data.fieldConfidence as any).writtenOffAmountTotal || 0,
      editable: true
    },
    { 
      key: 'writtenOffAmountPrincipal',
      label: 'Written off amount (Principal) :', 
      value: (data as any).writtenOffAmountPrincipal || '',
      confidence: (data.fieldConfidence as any).writtenOffAmountPrincipal || 0,
      editable: true
    },
    { 
      key: 'suitFiledWilfulDefault',
      label: 'Suit filed /Wilful Default :', 
      value: (data as any).suitFiledWilfulDefault || data.suitFiledAndDefault || '',
      confidence: data.fieldConfidence.suitFiledAndDefault || 0,
      editable: true
    },
    { 
      key: 'settlementAmount',
      label: 'Settlement amount :', 
      value: (data as any).settlementAmount || data.settledAndWrittenOff || '',
      confidence: data.fieldConfidence.settledAndWrittenOff || 0,
      editable: true
    }
  ];

  // Additional information data
  const additionalData = [
    { 
      key: 'reportDate',
      label: 'Report Date', 
      value: data.reportDate,
      confidence: data.fieldConfidence.reportDate
    },
    { 
      key: 'applicantName',
      label: 'Applicant Name', 
      value: data.applicantName,
      confidence: data.fieldConfidence.applicantName
    },
    { 
      key: 'panNumber',
      label: 'PAN Number', 
      value: data.panNumber,
      confidence: data.fieldConfidence.panNumber
    },
    { 
      key: 'accountNumbers',
      label: 'Account Numbers', 
      value: data.accountNumbers.join(', '),
      confidence: data.fieldConfidence.accountNumbers
    }
  ];

  // Get confidence color based on score
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    if (confidence >= 0.4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Get confidence badge variant
  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    if (confidence >= 0.4) return 'outline';
    return 'destructive';
  };

  // Get validation flags for a specific field
  const getFieldFlags = (fieldKey: string): ValidationFlag[] => {
    return data.extractionQuality.validationFlags.filter(flag => flag.field === fieldKey);
  };

  // Handle field editing
  const handleEditStart = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleEditSave = () => {
    if (editingField && onFieldEdit) {
      onFieldEdit(editingField, editValue);
      toast({
        title: "Field updated",
        description: `${editingField} has been updated successfully`,
      });
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Enhanced copy functionality with multiple formats
  const copyToClipboard = async (format: 'simple' | 'detailed' | 'json' = 'simple') => {
    let textToCopy = '';

    switch (format) {
      case 'detailed':
        textToCopy = formatDetailedCopyText();
        break;
      case 'json':
        textToCopy = formatJSONCopyText();
        break;
      default:
        textToCopy = formatSimpleCopyText();
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to clipboard",
        description: `${format.charAt(0).toUpperCase() + format.slice(1)} format copied to your clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy data to clipboard",
        variant: "destructive"
      });
    }
  };

  const formatSimpleCopyText = () => {
    return tableData.map(item => `${item.label} ${item.value || 'Not found'}`).join('\n');
  };

  const formatDetailedCopyText = () => {
    return `CIBIL Report Analysis - ${fileName}
Report Type: ${data.reportType}
Quality: ${data.extractionQuality.qualityLevel} (${data.extractionQuality.overallScore}%)

PRIMARY DATA:
${tableData.map(item => `${item.label} ${item.value || 'Not found'}${showConfidence ? ` (${Math.round(item.confidence * 100)}%)` : ''}`).join('\n')}

ADDITIONAL INFO:
${additionalData.filter(item => item.value).map(item => `${item.label}: ${item.value}${showConfidence ? ` (${Math.round(item.confidence * 100)}%)` : ''}`).join('\n')}`;
  };

  const formatJSONCopyText = () => {
    const copyData = {
      fileName,
      reportType: data.reportType,
      extractionQuality: data.extractionQuality.qualityLevel,
      overallScore: data.extractionQuality.overallScore,
      data: Object.fromEntries(
        tableData.map(item => [
          item.key,
          {
            value: item.value || null,
            confidence: showConfidence ? Math.round(item.confidence * 100) : undefined
          }
        ])
      )
    };
    return JSON.stringify(copyData, null, 2);
  };

  // Enhanced export functionality for CIBIL-specific data format
  const exportData = (format: 'txt' | 'json' | 'csv' = 'txt') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFileName = `enhanced_cibil_analysis_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}`;

    switch (format) {
      case 'json':
        exportAsJSON(baseFileName);
        break;
      case 'csv':
        exportAsCSV(baseFileName);
        break;
      default:
        exportAsText(baseFileName);
    }
  };

  const exportAsText = (baseFileName: string) => {
    const exportText = `Enhanced CIBIL Report Analysis - ${fileName}
Generated on: ${new Date().toLocaleDateString()}
Report Type: ${data.reportType}
Processing Methods: ${data.processingMethod.join(', ')}
Extraction Quality: ${data.extractionQuality.qualityLevel} (${data.extractionQuality.overallScore}%)

=== PRIMARY FINANCIAL DATA ===
${tableData.map(item => `${item.label} ${item.value || 'Not found'}${showConfidence ? ` (Confidence: ${Math.round(item.confidence * 100)}%)` : ''}`).join('\n')}

=== ADDITIONAL INFORMATION ===
${additionalData.filter(item => item.value).map(item => `${item.label}: ${item.value}${showConfidence ? ` (Confidence: ${Math.round(item.confidence * 100)}%)` : ''}`).join('\n')}

=== EXTRACTION ANALYTICS ===
Overall Quality Score: ${data.extractionQuality.overallScore}%
Fields Extracted: ${data.extractionQuality.fieldsExtracted}/${data.extractionQuality.totalFields}
Quality Level: ${data.extractionQuality.qualityLevel}
Processing Methods: ${data.processingMethod.join(', ')}
${data.extractionTimestamp ? `Extraction Time: ${data.extractionTimestamp}` : ''}
${data.documentPages ? `Document Pages: ${data.documentPages}` : ''}
${data.ocrConfidence ? `OCR Confidence: ${Math.round(data.ocrConfidence * 100)}%` : ''}

=== VALIDATION FLAGS ===
${data.extractionQuality.validationFlags.length > 0 
  ? data.extractionQuality.validationFlags.map(flag => 
      `[${flag.severity}] ${flag.field}: ${flag.issue}${flag.suggestion ? ` - ${flag.suggestion}` : ''}`
    ).join('\n')
  : 'No validation issues detected'
}
`;

    downloadFile(exportText, `${baseFileName}.txt`, 'text/plain');
  };

  const exportAsJSON = (baseFileName: string) => {
    const exportData = {
      metadata: {
        fileName,
        exportDate: new Date().toISOString(),
        reportType: data.reportType,
        processingMethods: data.processingMethod,
        extractionQuality: data.extractionQuality
      },
      financialData: {
        cibilScore: { value: data.cibilScore, confidence: data.fieldConfidence.cibilScore },
        numberOfLoans: { value: data.numberOfLoans, confidence: data.fieldConfidence.numberOfLoans },
        totalLoanAmount: { value: data.totalLoanAmount, confidence: data.fieldConfidence.totalLoanAmount },
        amountOverdue: { value: data.amountOverdue, confidence: data.fieldConfidence.amountOverdue },
        suitFiledAndDefault: { value: data.suitFiledAndDefault, confidence: data.fieldConfidence.suitFiledAndDefault },
        settledAndWrittenOff: { value: data.settledAndWrittenOff, confidence: data.fieldConfidence.settledAndWrittenOff }
      },
      additionalInfo: {
        reportDate: { value: data.reportDate, confidence: data.fieldConfidence.reportDate },
        applicantName: { value: data.applicantName, confidence: data.fieldConfidence.applicantName },
        panNumber: { value: data.panNumber, confidence: data.fieldConfidence.panNumber },
        accountNumbers: { value: data.accountNumbers, confidence: data.fieldConfidence.accountNumbers }
      },
      analytics: {
        overallScore: data.extractionQuality.overallScore,
        fieldsExtracted: data.extractionQuality.fieldsExtracted,
        totalFields: data.extractionQuality.totalFields,
        qualityLevel: data.extractionQuality.qualityLevel,
        extractionTimestamp: data.extractionTimestamp,
        documentPages: data.documentPages,
        ocrConfidence: data.ocrConfidence
      },
      validationFlags: data.extractionQuality.validationFlags
    };

    downloadFile(JSON.stringify(exportData, null, 2), `${baseFileName}.json`, 'application/json');
  };

  const exportAsCSV = (baseFileName: string) => {
    const csvRows = [
      ['Field', 'Value', 'Confidence', 'Category'],
      ...tableData.map(item => [
        item.label.replace(' :', ''),
        item.value || '',
        `${Math.round(item.confidence * 100)}%`,
        'Primary Data'
      ]),
      ...additionalData.filter(item => item.value).map(item => [
        item.label,
        item.value,
        `${Math.round(item.confidence * 100)}%`,
        'Additional Info'
      ])
    ];

    const csvContent = csvRows.map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    downloadFile(csvContent, `${baseFileName}.csv`, 'text/csv');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Header with Report Type and Quality Indicators */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Enhanced CIBIL Report Analysis</CardTitle>
                  <p className="text-sm text-gray-600">Extractions from {fileName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {data.reportType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {data.processingMethod.join(', ')}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={data.extractionQuality.qualityLevel === 'HIGH' ? 'default' : 
                          data.extractionQuality.qualityLevel === 'MEDIUM' ? 'secondary' : 'destructive'}
                  className="text-sm"
                >
                  {data.extractionQuality.qualityLevel} Quality
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-sm">
                      {data.extractionQuality.overallScore}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overall extraction quality score</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Display Options and Enhanced Export/Copy Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-confidence"
                    checked={showConfidence}
                    onCheckedChange={setShowConfidence}
                  />
                  <label htmlFor="show-confidence" className="text-sm font-medium cursor-pointer">
                    Show Confidence Scores
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Display confidence scores for each extracted field</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-flags"
                    checked={showFlags}
                    onCheckedChange={setShowFlags}
                  />
                  <label htmlFor="show-flags" className="text-sm font-medium cursor-pointer">
                    Show Validation Flags
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Display validation warnings and errors</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Enhanced Copy Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Data
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard('simple')}>
                      <Copy className="h-4 w-4 mr-2" />
                      Simple Format
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard('detailed')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Detailed Format
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard('json')}>
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON Format
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Enhanced Export Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportData('txt')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Text Report (.txt)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportData('json')}>
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON Data (.json)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportData('csv')}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV Spreadsheet (.csv)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        const apiFormat = {
                          data: Object.fromEntries(
                            tableData.map(item => [item.key, item.value || null])
                          ),
                          metadata: {
                            fileName,
                            reportType: data.reportType,
                            quality: data.extractionQuality.qualityLevel,
                            confidence: data.extractionQuality.overallScore
                          }
                        };
                        copyToClipboard('json');
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy API Format
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Financial Data Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Extractions from report:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <tbody>
                  {tableData.map((item, index) => {
                    const fieldFlags = getFieldFlags(item.key);
                    const hasFlags = fieldFlags.length > 0;
                    const isEditing = editingField === item.key;
                    
                    return (
                      <tr key={index} className="border-b last:border-b-0 group">
                        <td className="px-4 py-3 bg-gray-50 font-medium text-sm border-r w-1/2">
                          <div className="flex items-center justify-between">
                            <span>{item.label}</span>
                            {showFlags && hasFlags && (
                              <Tooltip>
                                <TooltipTrigger>
                                  {fieldFlags.some(f => f.severity === 'ERROR') ? (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    {fieldFlags.map((flag, idx) => (
                                      <div key={idx} className="text-xs">
                                        <span className="font-medium">{flag.severity}:</span> {flag.issue}
                                        {flag.suggestion && (
                                          <div className="text-gray-600 mt-1">{flag.suggestion}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm w-1/2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {isEditing ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded text-sm"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleEditSave}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleEditCancel}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  {item.value ? (
                                    <span className="font-mono break-words">{item.value}</span>
                                  ) : (
                                    <span className="text-gray-400 italic">Not found</span>
                                  )}
                                  {item.editable && onFieldEdit && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditStart(item.key, item.value)}
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {showConfidence && (
                              <div className="ml-2 flex items-center space-x-1">
                                <Badge 
                                  variant={getConfidenceBadgeVariant(item.confidence)}
                                  className="text-xs"
                                >
                                  {Math.round(item.confidence * 100)}%
                                </Badge>
                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(item.confidence).split(' ')[1]}`} />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Method Effectiveness Recommendations */}
        {data.methodEffectiveness && data.methodEffectiveness.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span>Processing Method Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    Method Effectiveness: <span className="font-medium">{data.methodEffectiveness.effectiveness}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {data.methodEffectiveness.methodCount} method{data.methodEffectiveness.methodCount > 1 ? 's' : ''} used
                  </Badge>
                </div>
                
                {data.methodEffectiveness.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        {recommendation}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-700">
                    <strong>Primary Method:</strong> {data.methodEffectiveness.primaryMethod} • 
                    <strong> Average Confidence:</strong> {Math.round(data.methodEffectiveness.averageConfidence * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {additionalData.some(item => item.value) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalData.filter(item => item.value).map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-gray-600">
                        {item.label}
                      </div>
                      {showConfidence && (
                        <Badge 
                          variant={getConfidenceBadgeVariant(item.confidence)}
                          className="text-xs"
                        >
                          {Math.round(item.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm font-mono">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Quality Indicators and Analytics Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Extraction Quality Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Extraction Quality Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Quality Score */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{
                    color: data.extractionQuality.qualityLevel === 'HIGH' ? '#16a34a' :
                           data.extractionQuality.qualityLevel === 'MEDIUM' ? '#ca8a04' : '#dc2626'
                  }}>
                    {data.extractionQuality.overallScore}%
                  </div>
                  <Badge 
                    className={
                      data.extractionQuality.qualityLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                      data.extractionQuality.qualityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {data.extractionQuality.qualityLevel} QUALITY
                  </Badge>
                </div>

                {/* Quality Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Quality</span>
                    <span>{data.extractionQuality.overallScore}%</span>
                  </div>
                  <Progress 
                    value={data.extractionQuality.overallScore} 
                    className="h-3"
                  />
                </div>

                {/* Field Extraction Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.extractionQuality.fieldsExtracted}
                    </div>
                    <div className="text-sm text-blue-800">Fields Extracted</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {data.extractionQuality.totalFields}
                    </div>
                    <div className="text-sm text-gray-800">Total Fields</div>
                  </div>
                </div>

                {/* Quality Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        data.extractionQuality.validationFlags.filter(f => f.severity === 'ERROR').length === 0 
                          ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span>Validation Status</span>
                    </span>
                    <span className={
                      data.extractionQuality.validationFlags.filter(f => f.severity === 'ERROR').length === 0 
                        ? 'text-green-600' : 'text-red-600'
                    }>
                      {data.extractionQuality.validationFlags.filter(f => f.severity === 'ERROR').length === 0 
                        ? 'Passed' : `${data.extractionQuality.validationFlags.filter(f => f.severity === 'ERROR').length} Errors`}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        data.extractionQuality.validationFlags.filter(f => f.severity === 'WARNING').length === 0 
                          ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span>Warning Status</span>
                    </span>
                    <span className={
                      data.extractionQuality.validationFlags.filter(f => f.severity === 'WARNING').length === 0 
                        ? 'text-green-600' : 'text-yellow-600'
                    }>
                      {data.extractionQuality.validationFlags.filter(f => f.severity === 'WARNING').length === 0 
                        ? 'Clean' : `${data.extractionQuality.validationFlags.filter(f => f.severity === 'WARNING').length} Warnings`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field-by-Field Confidence Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span>Field Confidence Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tableData.map((item, index) => {
                  const confidencePercentage = Math.round(item.confidence * 100);
                  const confidenceColor = item.confidence >= 0.8 ? 'bg-green-500' :
                                        item.confidence >= 0.6 ? 'bg-yellow-500' :
                                        item.confidence >= 0.4 ? 'bg-orange-500' : 'bg-red-500';
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate flex-1 mr-2">
                          {item.label.replace(' :', '')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${
                            item.confidence >= 0.8 ? 'text-green-600' :
                            item.confidence >= 0.6 ? 'text-yellow-600' :
                            item.confidence >= 0.4 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {confidencePercentage}%
                          </span>
                          <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${confidenceColor}`}
                          style={{ width: `${confidencePercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confidence Legend */}
              <div className="mt-4 pt-3 border-t">
                <div className="text-xs text-gray-600 mb-2">Confidence Levels:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>High (80%+)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Medium (60-79%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Low (40-59%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Poor (&lt;40%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Analytics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Processing Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Processing Method with Effectiveness */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Processing Method</span>
                  {data.methodEffectiveness && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        data.methodEffectiveness.effectiveness === 'HIGH' ? 'bg-green-100 text-green-800' :
                        data.methodEffectiveness.effectiveness === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.methodEffectiveness.effectiveness}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-purple-700">
                  {data.processingMethod.join(', ')}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {data.processingMethod.includes('HYBRID') ? 'Multi-method approach' :
                   data.processingMethod.includes('OCR') ? 'OCR-based extraction' :
                   data.processingMethod.includes('TEXT_LAYER') ? 'Text layer extraction' :
                   'Pattern matching'}
                  {data.methodEffectiveness && (
                    <div className="mt-1">
                      Avg. Confidence: {Math.round(data.methodEffectiveness.averageConfidence * 100)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Document Info */}
              {data.documentPages && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Document Info</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {data.documentPages} page{data.documentPages > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {data.reportType} report
                  </div>
                </div>
              )}

              {/* OCR Quality */}
              {data.ocrConfidence && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">OCR Quality</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {Math.round(data.ocrConfidence * 100)}%
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {data.ocrConfidence >= 0.9 ? 'Excellent' :
                     data.ocrConfidence >= 0.7 ? 'Good' :
                     data.ocrConfidence >= 0.5 ? 'Fair' : 'Poor'} recognition
                  </div>
                </div>
              )}

              {/* Extraction Time */}
              {data.extractionTimestamp && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Processed</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {new Date(data.extractionTimestamp).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(data.extractionTimestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Summary with Severity Levels */}
        {showFlags && data.extractionQuality.validationFlags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Validation Summary</span>
                <Badge variant="outline" className="ml-2">
                  {data.extractionQuality.validationFlags.length} issue{data.extractionQuality.validationFlags.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Severity Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">Errors</span>
                      <Badge variant="destructive">
                        {data.extractionQuality.validationFlags.filter(f => f.severity === 'ERROR').length}
                      </Badge>
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Critical issues requiring attention
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800">Warnings</span>
                      <Badge variant="secondary">
                        {data.extractionQuality.validationFlags.filter(f => f.severity === 'WARNING').length}
                      </Badge>
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Potential issues to review
                    </div>
                  </div>
                </div>

                {/* Detailed Flags */}
                <div className="space-y-2">
                  {data.extractionQuality.validationFlags.map((flag, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      flag.severity === 'ERROR' 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-yellow-50 border-yellow-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge 
                              variant={flag.severity === 'ERROR' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {flag.severity}
                            </Badge>
                            <span className="text-sm font-medium">{flag.field}</span>
                          </div>
                          <div className="text-sm text-gray-700 mb-1">
                            {flag.issue}
                          </div>
                          {flag.suggestion && (
                            <div className="text-xs text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                              💡 <strong>Suggestion:</strong> {flag.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedCibilTable;