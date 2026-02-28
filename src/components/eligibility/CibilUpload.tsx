import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EligibilityFormData } from '@/hooks/useEligibilityForm';

interface CibilUploadProps {
    onDataExtracted: (data: Partial<EligibilityFormData>) => void;
}

export const CibilUpload: React.FC<CibilUploadProps> = ({ onDataExtracted }) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState<Partial<EligibilityFormData> | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setStatus('idle');
            setExtractedData(null);
            setErrorMsg('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 1,
        disabled: status === 'uploading' || status === 'processing'
    });

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus('uploading');

            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setProgress(i);
                await new Promise(r => setTimeout(r, 100));
            }

            setStatus('processing');
            // Simulate processing/extraction delay
            await new Promise(r => setTimeout(r, 1500));

            // Mock Extracted Data (In future, this comes from backend loop)
            const mockData: Partial<EligibilityFormData> = {
                creditScore: 785,
                existingLoanAmount: 1250000,
                // Mocking inputs implies we parsed obligations and converted to total principal proxy or similar
                // For CIBIL, mostly we get Credit Score and Obligations.
            };

            setExtractedData(mockData);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMsg('Failed to process document. Please try again.');
        }
    };

    const handleApply = () => {
        if (extractedData) {
            onDataExtracted(extractedData);
        }
    };

    return (
        <div className="mb-6">
            <Card className="border-dashed border-2 border-indigo-200 bg-indigo-50/30">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">

                        {/* Drop Zone */}
                        <div className="flex-1 w-full">
                            {!file ? (
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer transition-colors border-2 border-dashed",
                                        isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-white/50"
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-10 h-10 text-indigo-400 mb-3" />
                                    <p className="text-sm font-medium text-gray-700 text-center">
                                        {isDragActive ? "Drop the CIBIL report here" : "Drag & drop CIBIL report or click to browse"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PDF, JPG up to 10MB</p>
                                </div>
                            ) : (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 rounded">
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        {status === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : status === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        ) : status === 'idle' ? (
                                            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change</Button>
                                        ) : null}
                                    </div>

                                    {(status === 'uploading' || status === 'processing') && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{status === 'uploading' ? 'Uploading...' : 'Extracting data...'}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                    )}

                                    {status === 'error' && (
                                        <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
                                    )}

                                    {status === 'idle' && (
                                        <Button onClick={handleUpload} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                            Process Report
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Extraction Results */}
                        {status === 'success' && extractedData && (
                            <div className="w-full md:w-64 bg-white p-4 rounded-lg border border-green-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <h4 className="font-semibold text-sm text-gray-800">Extraction Success</h4>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Credit Score</span>
                                        <span className="text-lg font-bold text-gray-900">{extractedData.creditScore}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Existing Debt</span>
                                        <span className="text-sm font-medium text-gray-900">₹{extractedData.existingLoanAmount?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button onClick={handleApply} size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                                    Auto-fill Form <ArrowRight className="w-3 h-3" />
                                </Button>
                            </div>
                        )}

                        {status === 'processing' && (
                            <div className="w-full md:w-64 flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-gray-200">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                <p className="text-sm text-gray-600">Analyzing report structure...</p>
                            </div>
                        )}

                        {(status === 'idle' || status === 'uploading') && !file && (
                            <div className="hidden md:block w-64 p-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                <p><strong>Did you know?</strong> Uploading a CIBIL report can auto-fill up to 40% of this form and improve approval chances.</p>
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
