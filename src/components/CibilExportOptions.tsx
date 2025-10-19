import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Download, 
  Copy, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Database,
  Mail,
  Share2,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedCibilData } from '@/types/enhanced-cibil';

interface CibilExportOptionsProps {
  data: EnhancedCibilData;
  fileName: string;
}

interface ExportOptions {
  includeConfidenceScores: boolean;
  includeValidationFlags: boolean;
  includeAnalytics: boolean;
  includeMetadata: boolean;
  format: 'txt' | 'json' | 'csv' | 'xml';
  fieldsToInclude: string[];
}

const CibilExportOptions: React.FC<CibilExportOptionsProps> = ({ data, fileName }) => {
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeConfidenceScores: true,
    includeValidationFlags: true,
    includeAnalytics: true,
    includeMetadata: true,
    format: 'txt',
    fieldsToInclude: [
      'cibilScore',
      'numberOfLoans', 
      'totalLoanAmount',
      'amountOverdue',
      'suitFiledAndDefault',
      'settledAndWrittenOff'
    ]
  });

  const availableFields = [
    { key: 'cibilScore', label: 'CIBIL Score', core: true },
    { key: 'numberOfLoans', label: 'Number of Loans', core: true },
    { key: 'totalLoanAmount', label: 'Total Loan Amount', core: true },
    { key: 'amountOverdue', label: 'Amount Overdue', core: true },
    { key: 'suitFiledAndDefault', label: 'Suit Filed and Default', core: true },
    { key: 'settledAndWrittenOff', label: 'Settled and Written Off', core: true },
    { key: 'reportDate', label: 'Report Date', core: false },
    { key: 'applicantName', label: 'Applicant Name', core: false },
    { key: 'panNumber', label: 'PAN Number', core: false },
    { key: 'accountNumbers', label: 'Account Numbers', core: false }
  ];

  const formatOptions = [
    { value: 'txt', label: 'Text File (.txt)', icon: FileText, description: 'Human-readable text format' },
    { value: 'json', label: 'JSON (.json)', icon: Code, description: 'Structured data format for APIs' },
    { value: 'csv', label: 'CSV (.csv)', icon: FileSpreadsheet, description: 'Spreadsheet-compatible format' },
    { value: 'xml', label: 'XML (.xml)', icon: Database, description: 'Structured markup format' }
  ];

  // Generate export data based on options
  const generateExportData = (): string => {
    const timestamp = new Date().toISOString();
    const baseFileName = fileName.replace(/\.[^/.]+$/, '');

    switch (exportOptions.format) {
      case 'json':
        return generateJSONExport();
      case 'csv':
        return generateCSVExport();
      case 'xml':
        return generateXMLExport();
      default:
        return generateTextExport();
    }
  };

  const generateTextExport = (): string => {
    const sections = [];

    // Header
    sections.push(`Enhanced CIBIL Report Analysis - ${fileName}`);
    sections.push(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`);
    sections.push(`Report Type: ${data.reportType}`);
    sections.push(`Processing Methods: ${data.processingMethod.join(', ')}`);
    sections.push(`Extraction Quality: ${data.extractionQuality.qualityLevel} (${data.extractionQuality.overallScore}%)`);
    sections.push('');

    // Primary Financial Data
    sections.push('=== PRIMARY FINANCIAL DATA ===');
    exportOptions.fieldsToInclude.forEach(fieldKey => {
      const field = availableFields.find(f => f.key === fieldKey);
      if (field) {
        const value = data[fieldKey as keyof EnhancedCibilData] as string | string[];
        const displayValue = Array.isArray(value) ? value.join(', ') : value || 'Not found';
        let line = `${field.label}: ${displayValue}`;
        
        if (exportOptions.includeConfidenceScores) {
          const confidence = data.fieldConfidence[fieldKey as keyof typeof data.fieldConfidence];
          line += ` (Confidence: ${Math.round(confidence * 100)}%)`;
        }
        sections.push(line);
      }
    });
    sections.push('');

    // Analytics
    if (exportOptions.includeAnalytics) {
      sections.push('=== EXTRACTION ANALYTICS ===');
      sections.push(`Overall Quality Score: ${data.extractionQuality.overallScore}%`);
      sections.push(`Fields Extracted: ${data.extractionQuality.fieldsExtracted}/${data.extractionQuality.totalFields}`);
      sections.push(`Quality Level: ${data.extractionQuality.qualityLevel}`);
      sections.push(`Processing Methods: ${data.processingMethod.join(', ')}`);
      
      if (exportOptions.includeMetadata) {
        if (data.extractionTimestamp) sections.push(`Extraction Time: ${data.extractionTimestamp}`);
        if (data.documentPages) sections.push(`Document Pages: ${data.documentPages}`);
        if (data.ocrConfidence) sections.push(`OCR Confidence: ${Math.round(data.ocrConfidence * 100)}%`);
      }
      sections.push('');
    }

    // Validation Flags
    if (exportOptions.includeValidationFlags && data.extractionQuality.validationFlags.length > 0) {
      sections.push('=== VALIDATION FLAGS ===');
      data.extractionQuality.validationFlags.forEach(flag => {
        let flagLine = `[${flag.severity}] ${flag.field}: ${flag.issue}`;
        if (flag.suggestion) flagLine += ` - ${flag.suggestion}`;
        sections.push(flagLine);
      });
    } else if (exportOptions.includeValidationFlags) {
      sections.push('=== VALIDATION FLAGS ===');
      sections.push('No validation issues detected');
    }

    return sections.join('\n');
  };

  const generateJSONExport = (): string => {
    const exportData: any = {
      metadata: {
        fileName,
        exportTimestamp: new Date().toISOString(),
        reportType: data.reportType,
        processingMethod: data.processingMethod,
        extractionQuality: data.extractionQuality.qualityLevel,
        overallScore: data.extractionQuality.overallScore
      },
      data: {}
    };

    // Add selected fields
    exportOptions.fieldsToInclude.forEach(fieldKey => {
      const value = data[fieldKey as keyof EnhancedCibilData];
      exportData.data[fieldKey] = {
        value: value,
        confidence: exportOptions.includeConfidenceScores ? data.fieldConfidence[fieldKey as keyof typeof data.fieldConfidence] : undefined
      };
    });

    // Add analytics if requested
    if (exportOptions.includeAnalytics) {
      exportData.analytics = {
        extractionQuality: data.extractionQuality,
        fieldConfidence: exportOptions.includeConfidenceScores ? data.fieldConfidence : undefined
      };
    }

    // Add metadata if requested
    if (exportOptions.includeMetadata) {
      exportData.metadata = {
        ...exportData.metadata,
        extractionTimestamp: data.extractionTimestamp,
        documentPages: data.documentPages,
        ocrConfidence: data.ocrConfidence
      };
    }

    // Add validation flags if requested
    if (exportOptions.includeValidationFlags) {
      exportData.validationFlags = data.extractionQuality.validationFlags;
    }

    return JSON.stringify(exportData, null, 2);
  };

  const generateCSVExport = (): string => {
    const headers = ['Field', 'Value'];
    if (exportOptions.includeConfidenceScores) headers.push('Confidence');
    
    const rows = [headers.join(',')];

    exportOptions.fieldsToInclude.forEach(fieldKey => {
      const field = availableFields.find(f => f.key === fieldKey);
      if (field) {
        const value = data[fieldKey as keyof EnhancedCibilData] as string | string[];
        const displayValue = Array.isArray(value) ? value.join('; ') : value || 'Not found';
        
        let row = [`"${field.label}"`, `"${displayValue}"`];
        if (exportOptions.includeConfidenceScores) {
          const confidence = data.fieldConfidence[fieldKey as keyof typeof data.fieldConfidence];
          row.push(`${Math.round(confidence * 100)}%`);
        }
        rows.push(row.join(','));
      }
    });

    // Add analytics row if requested
    if (exportOptions.includeAnalytics) {
      rows.push(''); // Empty row
      rows.push('"Analytics","","');
      rows.push(`"Overall Quality","${data.extractionQuality.overallScore}%",""`);
      rows.push(`"Quality Level","${data.extractionQuality.qualityLevel}",""`);
      rows.push(`"Fields Extracted","${data.extractionQuality.fieldsExtracted}/${data.extractionQuality.totalFields}",""`);
    }

    return rows.join('\n');
  };

  const generateXMLExport = (): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<cibilReport>\n';
    xml += `  <metadata>\n`;
    xml += `    <fileName>${fileName}</fileName>\n`;
    xml += `    <exportTimestamp>${new Date().toISOString()}</exportTimestamp>\n`;
    xml += `    <reportType>${data.reportType}</reportType>\n`;
    xml += `    <processingMethod>${data.processingMethod.join(', ')}</processingMethod>\n`;
    xml += `    <extractionQuality>${data.extractionQuality.qualityLevel}</extractionQuality>\n`;
    xml += `    <overallScore>${data.extractionQuality.overallScore}</overallScore>\n`;
    xml += `  </metadata>\n`;

    xml += `  <financialData>\n`;
    exportOptions.fieldsToInclude.forEach(fieldKey => {
      const field = availableFields.find(f => f.key === fieldKey);
      if (field) {
        const value = data[fieldKey as keyof EnhancedCibilData] as string | string[];
        const displayValue = Array.isArray(value) ? value.join(', ') : value || '';
        
        xml += `    <field name="${fieldKey}">\n`;
        xml += `      <label>${field.label}</label>\n`;
        xml += `      <value>${displayValue}</value>\n`;
        if (exportOptions.includeConfidenceScores) {
          const confidence = data.fieldConfidence[fieldKey as keyof typeof data.fieldConfidence];
          xml += `      <confidence>${Math.round(confidence * 100)}</confidence>\n`;
        }
        xml += `    </field>\n`;
      }
    });
    xml += `  </financialData>\n`;

    if (exportOptions.includeValidationFlags && data.extractionQuality.validationFlags.length > 0) {
      xml += `  <validationFlags>\n`;
      data.extractionQuality.validationFlags.forEach(flag => {
        xml += `    <flag severity="${flag.severity}" field="${flag.field}">\n`;
        xml += `      <issue>${flag.issue}</issue>\n`;
        if (flag.suggestion) xml += `      <suggestion>${flag.suggestion}</suggestion>\n`;
        xml += `    </flag>\n`;
      });
      xml += `  </validationFlags>\n`;
    }

    xml += '</cibilReport>';
    return xml;
  };

  // Handle export
  const handleExport = () => {
    try {
      const exportData = generateExportData();
      const blob = new Blob([exportData], { 
        type: exportOptions.format === 'json' ? 'application/json' :
              exportOptions.format === 'csv' ? 'text/csv' :
              exportOptions.format === 'xml' ? 'application/xml' : 'text/plain'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced_cibil_analysis_${fileName.replace(/\.[^/.]+$/, '')}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Data exported as ${exportOptions.format.toUpperCase()} file`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export data",
        variant: "destructive"
      });
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const exportData = generateExportData();
      await navigator.clipboard.writeText(exportData);
      toast({
        title: "Copied to clipboard",
        description: "Data has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy data to clipboard",
        variant: "destructive"
      });
    }
  };

  // Handle field selection
  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      fieldsToInclude: checked 
        ? [...prev.fieldsToInclude, fieldKey]
        : prev.fieldsToInclude.filter(f => f !== fieldKey)
    }));
  };

  // Select all core fields
  const selectCoreFields = () => {
    const coreFields = availableFields.filter(f => f.core).map(f => f.key);
    setExportOptions(prev => ({ ...prev, fieldsToInclude: coreFields }));
  };

  // Select all fields
  const selectAllFields = () => {
    const allFields = availableFields.map(f => f.key);
    setExportOptions(prev => ({ ...prev, fieldsToInclude: allFields }));
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Export & Share Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.value}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      exportOptions.format === format.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-sm">{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Fields to Include</label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectCoreFields}>
                  Core Fields
                </Button>
                <Button variant="outline" size="sm" onClick={selectAllFields}>
                  All Fields
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={exportOptions.fieldsToInclude.includes(field.key)}
                    onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  />
                  <label htmlFor={field.key} className="text-sm cursor-pointer flex items-center space-x-1">
                    <span>{field.label}</span>
                    {field.core && <Badge variant="outline" className="text-xs">Core</Badge>}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Additional Options</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidence-scores"
                  checked={exportOptions.includeConfidenceScores}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeConfidenceScores: checked as boolean }))
                  }
                />
                <label htmlFor="confidence-scores" className="text-sm cursor-pointer">
                  Include confidence scores
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validation-flags"
                  checked={exportOptions.includeValidationFlags}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeValidationFlags: checked as boolean }))
                  }
                />
                <label htmlFor="validation-flags" className="text-sm cursor-pointer">
                  Include validation flags
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={exportOptions.includeAnalytics}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeAnalytics: checked as boolean }))
                  }
                />
                <label htmlFor="analytics" className="text-sm cursor-pointer">
                  Include extraction analytics
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={exportOptions.includeMetadata}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                  }
                />
                <label htmlFor="metadata" className="text-sm cursor-pointer">
                  Include processing metadata
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {exportOptions.fieldsToInclude.length} field{exportOptions.fieldsToInclude.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCopyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export {exportOptions.format.toUpperCase()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default CibilExportOptions;