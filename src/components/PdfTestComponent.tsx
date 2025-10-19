import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useFileExtraction } from '@/hooks/useFileExtraction';

const PdfTestComponent: React.FC = () => {
    const { isProcessing, extractedData, processFile } = useFileExtraction();
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                processFile(file);
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        PDF Extraction Test
                    </CardTitle>
                    <CardDescription>
                        Test the PDF extraction functionality with improved error handling and fallback methods
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">
                            {isProcessing ? 'Processing PDF...' : 'Drop a PDF file here or click to browse'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Test PDF extraction with enhanced error handling
                        </p>
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileInput}
                            className="hidden"
                            id="pdf-upload"
                            disabled={isProcessing}
                        />
                        <Button asChild disabled={isProcessing}>
                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                Choose PDF File
                            </label>
                        </Button>
                    </div>

                    {/* Results */}
                    {extractedData && (
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Extraction Results</h3>
                                <div className="flex items-center space-x-2">
                                    {extractedData.error ? (
                                        <Badge variant="destructive" className="flex items-center space-x-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>Error</span>
                                        </Badge>
                                    ) : (
                                        <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Success</span>
                                        </Badge>
                                    )}
                                    {extractedData.metadata?.fallbackUsed && (
                                        <Badge variant="outline" className="flex items-center space-x-1">
                                            <Info className="h-3 w-3" />
                                            <span>Fallback Used</span>
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* File Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">File Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium">Name:</span> {extractedData.fileName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Size:</span> {Math.round(extractedData.fileSize / 1024)} KB
                                        </div>
                                        <div>
                                            <span className="font-medium">Type:</span> {extractedData.fileType}
                                        </div>
                                        {extractedData.metadata?.totalPages && (
                                            <div>
                                                <span className="font-medium">Pages:</span> {extractedData.metadata.totalPages}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Error Display */}
                            {extractedData.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Extraction Error:</strong> {extractedData.error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Extraction Method Info */}
                            {extractedData.metadata && (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Method:</strong> {extractedData.metadata.extractionMethod || 'Standard'}
                                        {extractedData.metadata.fallbackUsed && (
                                            <span className="ml-2 text-orange-600">
                                                (Fallback method used due to PDF.js issues)
                                            </span>
                                        )}
                                        {extractedData.metadata.primaryError && (
                                            <div className="mt-1 text-xs text-gray-600">
                                                Primary error: {extractedData.metadata.primaryError}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Extracted Text */}
                            {extractedData.extractedText && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Extracted Text</CardTitle>
                                        <CardDescription>
                                            {extractedData.extractedText.length} characters extracted
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                                            <pre className="text-sm whitespace-pre-wrap font-mono">
                                                {extractedData.extractedText}
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Metadata */}
                            {extractedData.metadata && Object.keys(extractedData.metadata).length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Metadata</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            {Object.entries(extractedData.metadata).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="font-medium capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
                                                    </span>
                                                    <span className="text-right max-w-64 break-words font-mono">
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value, null, 2)
                                                            : String(value)
                                                        }
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PdfTestComponent;