import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight,
    Shield, CreditCard, AlertTriangle, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EligibilityFormData } from '@/hooks/useEligibilityForm';
import { extractCibilReport, ExtractedCibilData, formatINR } from '@/services/cibilService';

interface CibilUploadProps {
    onDataExtracted: (data: Partial<EligibilityFormData>) => void;
}

export const CibilUpload: React.FC<CibilUploadProps> = ({ onDataExtracted }) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState<ExtractedCibilData | null>(null);
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
        maxSize: 15 * 1024 * 1024, // 15MB
        disabled: status === 'uploading' || status === 'processing'
    });

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus('uploading');
            setProgress(10);

            // Simulate initial upload progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 40) {
                        clearInterval(progressInterval);
                        return 40;
                    }
                    return prev + 5;
                });
            }, 200);

            setProgress(50);
            setStatus('processing');
            clearInterval(progressInterval);

            // Call the real Gemini extraction via Cloud Function
            const data = await extractCibilReport(file);

            setProgress(100);
            setExtractedData(data);
            setStatus('success');
        } catch (err: any) {
            console.error('CIBIL extraction error:', err);
            setStatus('error');
            setErrorMsg(
                err?.message?.includes('unauthenticated')
                    ? 'Please log in to extract CIBIL reports.'
                    : err?.message?.includes('Unsupported file type')
                        ? 'Unsupported file type. Please upload a PDF or image.'
                        : 'Failed to process document. Please try again or use a clearer document.'
            );
        }
    };

    const handleApply = () => {
        if (extractedData) {
            const formData: Partial<EligibilityFormData> = {
                creditScore: extractedData.cibilScore || 600,
                existingLoanAmount: extractedData.totalCurrentBalance || 0,
            };

            // Auto-fill name if available
            if (extractedData.name) {
                formData.fullName = extractedData.name;
            }

            onDataExtracted(formData);
        }
    };

    // Get score color
    const getScoreColor = (score: number) => {
        if (score >= 750) return 'text-green-600';
        if (score >= 650) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 750) return { label: 'Excellent', className: 'bg-green-100 text-green-700' };
        if (score >= 700) return { label: 'Good', className: 'bg-blue-100 text-blue-700' };
        if (score >= 650) return { label: 'Fair', className: 'bg-yellow-100 text-yellow-700' };
        return { label: 'Poor', className: 'bg-red-100 text-red-700' };
    };

    return (
        <div className="mb-6">
            <Card className="border-dashed border-2 border-primary-200 bg-primary-50/10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">

                        {/* Drop Zone */}
                        <div className="flex-1 w-full">
                            {!file ? (
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer transition-colors border-2 border-dashed",
                                        isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-white/50"
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-10 h-10 text-primary/40 mb-3" />
                                    <p className="text-sm font-medium text-gray-700 text-center">
                                        {isDragActive ? "Drop the CIBIL report here" : "Drag & drop CIBIL report or click to browse"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 15MB</p>
                                </div>
                            ) : (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded">
                                                <FileText className="w-5 h-5 text-primary" />
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
                                                <span>{status === 'uploading' ? 'Uploading...' : 'AI is analyzing your report...'}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                    )}

                                    {status === 'error' && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-red-500">{errorMsg}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setStatus('idle'); setErrorMsg(''); }}
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    )}

                                    {status === 'idle' && (
                                        <Button onClick={handleUpload} className="w-full bg-primary hover:bg-primary/90">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Extract with AI
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Extraction Results */}
                        {status === 'success' && extractedData && (
                            <div className="w-full md:w-80 bg-white p-4 rounded-lg border border-green-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                    <CheckCircle className="w-4 h-4 text-secondary" />
                                    <h4 className="font-semibold text-sm text-gray-800">Extraction Complete</h4>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {/* Name */}
                                    {extractedData.name && (
                                        <div>
                                            <span className="text-xs text-gray-500 block">Name</span>
                                            <span className="text-sm font-medium text-gray-900">{extractedData.name}</span>
                                        </div>
                                    )}

                                    {/* CIBIL Score */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-gray-500 block">CIBIL Score</span>
                                            <span className={cn("text-2xl font-bold", getScoreColor(extractedData.cibilScore))}>
                                                {extractedData.cibilScore || 'N/A'}
                                            </span>
                                        </div>
                                        {extractedData.cibilScore > 0 && (
                                            <span className={cn(
                                                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                                getScoreBadge(extractedData.cibilScore).className
                                            )}>
                                                {getScoreBadge(extractedData.cibilScore).label}
                                            </span>
                                        )}
                                    </div>

                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <CreditCard className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] text-gray-500">Accounts</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">
                                                {extractedData.totalAccounts}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <TrendingUp className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] text-gray-500">Outstanding</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">
                                                {formatINR(extractedData.totalCurrentBalance)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Risk flags */}
                                    {(extractedData.hasOverdue || extractedData.hasSettlement || extractedData.hasWrittenOff || extractedData.hasSuitFiled) && (
                                        <div className="bg-red-50 p-2 rounded border border-red-100">
                                            <div className="flex items-center gap-1 mb-1">
                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                                <span className="text-[10px] font-semibold text-red-600">Risk Flags</span>
                                            </div>
                                            <div className="space-y-0.5 text-[10px] text-red-600">
                                                {extractedData.hasOverdue && (
                                                    <p>• Overdue: {formatINR(extractedData.totalOverdueAmount)}</p>
                                                )}
                                                {extractedData.hasSettlement && (
                                                    <p>• Settlement found</p>
                                                )}
                                                {extractedData.hasWrittenOff && (
                                                    <p>• Default / Written-off account found</p>
                                                )}
                                                {extractedData.hasSuitFiled && (
                                                    <p>• Suit filed against account</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Summary */}
                                    {extractedData.reportSummary && (
                                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                            <span className="text-[10px] font-semibold text-blue-600 block mb-0.5">AI Summary</span>
                                            <p className="text-[10px] text-blue-800 leading-relaxed">
                                                {extractedData.reportSummary}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button onClick={handleApply} size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-white gap-2">
                                    Auto-fill Form <ArrowRight className="w-3 h-3" />
                                </Button>
                            </div>
                        )}

                        {status === 'processing' && (
                            <div className="w-full md:w-80 flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-gray-200">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                <p className="text-sm font-medium text-gray-700">Analyzing with Gemini AI</p>
                                <p className="text-xs text-gray-500 mt-1">Extracting score, accounts, and risk flags...</p>
                            </div>
                        )}

                        {(status === 'idle' || status === 'uploading') && !file && (
                            <div className="hidden md:block w-64 p-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                <p><strong>AI-Powered Extraction</strong></p>
                                <p className="text-xs mt-1">Upload your CIBIL report (PDF or screenshot) and our AI will extract your credit score, loan details, and risk flags automatically.</p>
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
