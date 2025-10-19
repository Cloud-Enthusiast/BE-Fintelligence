import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Activity,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info
} from 'lucide-react';
import { EnhancedCibilData, FieldConfidenceMap } from '@/types/enhanced-cibil';

interface CibilAnalyticsProps {
    data: EnhancedCibilData;
}

const CibilAnalytics: React.FC<CibilAnalyticsProps> = ({ data }) => {
    // Calculate field-level analytics
    const calculateFieldAnalytics = () => {
        const confidenceValues = Object.values(data.fieldConfidence);
        const highConfidenceFields = confidenceValues.filter(c => c >= 0.8).length;
        const mediumConfidenceFields = confidenceValues.filter(c => c >= 0.6 && c < 0.8).length;
        const lowConfidenceFields = confidenceValues.filter(c => c < 0.6).length;

        return {
            highConfidence: highConfidenceFields,
            mediumConfidence: mediumConfidenceFields,
            lowConfidence: lowConfidenceFields,
            averageConfidence: confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length
        };
    };

    // Get confidence distribution for visualization
    const getConfidenceDistribution = () => {
        const fieldAnalytics = calculateFieldAnalytics();
        const total = fieldAnalytics.highConfidence + fieldAnalytics.mediumConfidence + fieldAnalytics.lowConfidence;

        return {
            high: Math.round((fieldAnalytics.highConfidence / total) * 100),
            medium: Math.round((fieldAnalytics.mediumConfidence / total) * 100),
            low: Math.round((fieldAnalytics.lowConfidence / total) * 100)
        };
    };

    // Calculate extraction completeness
    const getExtractionCompleteness = () => {
        const coreFields = ['cibilScore', 'numberOfLoans', 'totalLoanAmount', 'amountOverdue'];
        const extractedCoreFields = coreFields.filter(field => {
            const value = data[field as keyof EnhancedCibilData] as string;
            return value && value.trim() !== '' && value !== 'Not found';
        }).length;

        return Math.round((extractedCoreFields / coreFields.length) * 100);
    };

    // Get processing method insights
    const getProcessingInsights = () => {
        const methods = data.processingMethod;
        const insights = [];

        if (methods.includes('TEXT_LAYER')) {
            insights.push({
                method: 'Text Layer',
                description: 'Direct text extraction from PDF',
                reliability: 'High',
                color: 'text-green-600'
            });
        }

        if (methods.includes('OCR')) {
            insights.push({
                method: 'OCR',
                description: 'Optical Character Recognition used',
                reliability: data.ocrConfidence && data.ocrConfidence > 0.8 ? 'High' : 'Medium',
                color: data.ocrConfidence && data.ocrConfidence > 0.8 ? 'text-green-600' : 'text-yellow-600'
            });
        }

        if (methods.includes('HYBRID')) {
            insights.push({
                method: 'Hybrid',
                description: 'Combined text layer and OCR processing',
                reliability: 'Very High',
                color: 'text-blue-600'
            });
        }

        if (methods.includes('PATTERN_MATCH')) {
            insights.push({
                method: 'Pattern Matching',
                description: 'CIBIL-specific pattern recognition',
                reliability: 'High',
                color: 'text-purple-600'
            });
        }

        return insights;
    };

    // Get validation summary
    const getValidationSummary = () => {
        const flags = data.extractionQuality.validationFlags;
        const errors = flags.filter(f => f.severity === 'ERROR').length;
        const warnings = flags.filter(f => f.severity === 'WARNING').length;

        return { errors, warnings, total: flags.length };
    };

    const fieldAnalytics = calculateFieldAnalytics();
    const confidenceDistribution = getConfidenceDistribution();
    const extractionCompleteness = getExtractionCompleteness();
    const processingInsights = getProcessingInsights();
    const validationSummary = getValidationSummary();

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Quality Score */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <span>Overall Quality</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">
                                    {data.extractionQuality.overallScore}%
                                </span>
                                <Badge
                                    variant={
                                        data.extractionQuality.qualityLevel === 'HIGH' ? 'default' :
                                            data.extractionQuality.qualityLevel === 'MEDIUM' ? 'secondary' : 'destructive'
                                    }
                                >
                                    {data.extractionQuality.qualityLevel}
                                </Badge>
                            </div>
                            <Progress value={data.extractionQuality.overallScore} className="h-2" />
                            <div className="text-sm text-gray-600">
                                {data.extractionQuality.fieldsExtracted} of {data.extractionQuality.totalFields} fields extracted
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Confidence Distribution */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                            <PieChart className="h-5 w-5 text-green-600" />
                            <span>Confidence Distribution</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">High (≥80%)</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-12 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${confidenceDistribution.high}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{fieldAnalytics.highConfidence}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm">Medium (60-79%)</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-12 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{ width: `${confidenceDistribution.medium}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{fieldAnalytics.mediumConfidence}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm">Low (&lt;60%)</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-12 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${confidenceDistribution.low}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{fieldAnalytics.lowConfidence}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Average Confidence:</span>
                                    <span className="font-medium">{Math.round(fieldAnalytics.averageConfidence * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Extraction Completeness */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            <span>Core Data Completeness</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">{extractionCompleteness}%</span>
                                {extractionCompleteness >= 75 ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : extractionCompleteness >= 50 ? (
                                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-500" />
                                )}
                            </div>
                            <Progress value={extractionCompleteness} className="h-2" />
                            <div className="text-sm text-gray-600">
                                Core fields: CIBIL Score, Loan Count, Total Amount, Overdue Amount
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Processing Methods */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <span>Processing Methods Used</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {processingInsights.map((insight, index) => (
                                <div key={index} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{insight.method}</span>
                                        <Badge variant="outline" className={insight.color}>
                                            {insight.reliability}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{insight.description}</p>
                                </div>
                            ))}
                        </div>

                        {data.ocrConfidence && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">OCR Confidence Level:</span>
                                    <span className="text-sm">{Math.round(data.ocrConfidence * 100)}%</span>
                                </div>
                                <Progress value={data.ocrConfidence * 100} className="h-1 mt-2" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Validation Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span>Validation Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {validationSummary.total === 0 ? (
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="text-sm">No issues detected</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {validationSummary.errors > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-red-600">
                                                <XCircle className="h-4 w-4" />
                                                <span className="text-sm">Errors</span>
                                            </div>
                                            <Badge variant="destructive">{validationSummary.errors}</Badge>
                                        </div>
                                    )}

                                    {validationSummary.warnings > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-yellow-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="text-sm">Warnings</span>
                                            </div>
                                            <Badge variant="secondary">{validationSummary.warnings}</Badge>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2 border-t text-xs text-gray-500">
                                Total validation checks: {validationSummary.total}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Field-by-Field Confidence */}
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <span>Field-by-Field Confidence Analysis</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(data.fieldConfidence).map(([field, confidence]) => {
                                const fieldValue = data[field as keyof EnhancedCibilData] as string | string[];
                                const hasValue = Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue && fieldValue.trim() !== '';

                                return (
                                    <div key={field} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium capitalize">
                                                {field.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                {hasValue ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-gray-400" />
                                                )}
                                                <Badge
                                                    variant={
                                                        confidence >= 0.8 ? 'default' :
                                                            confidence >= 0.6 ? 'secondary' :
                                                                confidence >= 0.4 ? 'outline' : 'destructive'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {Math.round(confidence * 100)}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <Progress value={confidence * 100} className="h-1" />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {hasValue ? 'Extracted' : 'Not found'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
};

export default CibilAnalytics;