import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FinancialData } from '@/utils/financialDataExtractor';

interface FinancialDataTableProps {
  data: FinancialData;
  fileName: string;
}

const FinancialDataTable: React.FC<FinancialDataTableProps> = ({ data, fileName }) => {
  const { toast } = useToast();

  const tableData = [
    { label: 'CIBIL Score :', value: data.cibilScore },
    { label: 'Number of loans in report :', value: data.numberOfLoans },
    { label: 'Total Amount of Loan', value: data.totalLoanAmount },
    { label: 'Amount overdue :', value: data.amountOverdue },
    { label: 'Suit filed and Default :', value: data.suitFiledAndDefault },
    { label: 'Settled and Written off amount :', value: data.settledAndWrittenOff }
  ];

  const additionalData = [
    { label: 'Report Date', value: data.reportDate },
    { label: 'Applicant Name', value: data.applicantName },
    { label: 'PAN Number', value: data.panNumber },
    { label: 'Account Numbers', value: data.accountNumbers.join(', ') }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const exportData = () => {
    const exportText = `CIBIL Report Analysis - ${fileName}
Generated on: ${new Date().toLocaleDateString()}

=== PRIMARY FINANCIAL DATA ===
${tableData.map(item => `${item.label} ${item.value || 'Not found'}`).join('\n')}

=== ADDITIONAL INFORMATION ===
${additionalData.filter(item => item.value).map(item => `${item.label}: ${item.value}`).join('\n')}
`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_analysis_${fileName.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTableText = () => {
    return tableData.map(item => `${item.label} ${item.value || ''}`).join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-2">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">CIBIL Report Analysis</CardTitle>
                <p className="text-sm text-gray-600">Extractions from {fileName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Analyzed
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Financial Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Extractions from report:</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formatTableText())}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <tbody>
                {tableData.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="px-4 py-3 bg-gray-50 font-medium text-sm border-r w-1/2">
                      {item.label}
                    </td>
                    <td className="px-4 py-3 text-sm w-1/2">
                      {item.value ? (
                        <span className="font-mono break-words">{item.value}</span>
                      ) : (
                        <span className="text-gray-400 italic">Not found</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {item.label}
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

      {/* Data Quality Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Data Extraction Quality:</span>
            <div className="flex items-center space-x-2">
              {(() => {
                const filledFields = tableData.filter(item => item.value).length;
                const totalFields = tableData.length;
                const percentage = Math.round((filledFields / totalFields) * 100);
                
                let badgeColor = "bg-red-100 text-red-800";
                let quality = "Low";
                
                if (percentage >= 80) {
                  badgeColor = "bg-green-100 text-green-800";
                  quality = "High";
                } else if (percentage >= 50) {
                  badgeColor = "bg-yellow-100 text-yellow-800";
                  quality = "Medium";
                }
                
                return (
                  <>
                    <Badge className={badgeColor}>
                      {quality} ({percentage}%)
                    </Badge>
                    <span className="text-gray-500">
                      {filledFields}/{totalFields} fields extracted
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDataTable;