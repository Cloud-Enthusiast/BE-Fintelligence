
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useDocuments, StoredDocument } from '@/contexts/DocumentContext';
import { ExtractedMSMEData } from '@/types/msmeDocuments';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, FileText, ShieldCheck, UserCheck } from 'lucide-react';
import type { Customer } from '@/services/customerService';

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema
// ─────────────────────────────────────────────────────────────────────────────

const formSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    fullName: z.string().min(2, 'Applicant name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    businessType: z.string().min(1, 'Business type is required'),
    annualRevenue: z.preprocess(
        (val) => Number(val),
        z.number().min(0, 'Revenue must be positive')
    ),
    monthlyIncome: z.preprocess(
        (val) => Number(val),
        z.number().min(0, 'Income must be positive')
    ),
    existingLoanAmount: z.preprocess(
        (val) => Number(val),
        z.number().min(0)
    ).default(0),
    loanAmount: z.preprocess(
        (val) => Number(val),
        z.number().min(1000, 'Minimum loan amount is ₹1,000')
    ),
    loanTerm: z.preprocess(
        (val) => Number(val),
        z.number().min(3, 'Minimum term is 3 months')
    ),
    /**
     * CIBIL credit score (300–900).
     * No default is provided — the officer must enter or auto-populate
     * from an uploaded CIBIL report. An empty / missing value fails
     * validation so fabricated scores can't slip through silently.
     */
    creditScore: z.preprocess(
        (val) => {
            if (val === '' || val === undefined || val === null) return undefined;
            const n = Number(val);
            return isNaN(n) ? undefined : n;
        },
        z.number({
            required_error: 'CIBIL score is required (300–900)',
            invalid_type_error: 'Enter a valid CIBIL score',
        })
        .min(300, 'CIBIL score must be at least 300')
        .max(900, 'CIBIL score cannot exceed 900')
    ),
});

export type MSMEApplicationFormValues = z.infer<typeof formSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface MSMEApplicationFormProps {
    onSubmit: (values: MSMEApplicationFormValues) => void;
    isSubmitting?: boolean;
    /** Pre-fill form fields from a customer record navigated from Customers page */
    prefilledCustomer?: Customer;
}

export const MSMEApplicationForm = ({ onSubmit, isSubmitting = false, prefilledCustomer }: MSMEApplicationFormProps) => {
    const { documents } = useDocuments();
    const [cibilAutoFilled, setCibilAutoFilled] = useState(false);

    const form = useForm<MSMEApplicationFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Pre-fill from customer record if navigated from Customers page
            businessName: prefilledCustomer?.businessName ?? '',
            fullName: prefilledCustomer?.fullName ?? '',
            email: prefilledCustomer?.email ?? '',
            phone: prefilledCustomer?.phone ?? '',
            businessType: prefilledCustomer?.businessType ?? '',
            annualRevenue: 0,
            monthlyIncome: 0,
            existingLoanAmount: 0,
            loanAmount: 0,
            loanTerm: 12,
            // creditScore intentionally has NO default — forces real entry
        },
    });

    // ── Auto-populate from uploaded documents ──────────────────────────────

    const populateFromDocuments = (selectedDocs: StoredDocument[]) => {
        let revenue = 0;
        let monthlyIncome = 0;
        let creditScore: number | undefined;
        let existingLoanAmount = 0;
        let businessName = '';
        const filled: string[] = [];

        selectedDocs.forEach(doc => {
            const data = doc.extractedData.data as Record<string, unknown>;

            if (doc.documentType === 'profit_loss') {
                const raw = String(data.revenue ?? data.totalRevenue ?? '').replace(/[^0-9.]/g, '');
                const parsed = parseFloat(raw);
                if (!isNaN(parsed) && parsed > 0) revenue = parsed;

                const rawMonthly = String(data.monthlyRevenue ?? '').replace(/[^0-9.]/g, '');
                const parsedMonthly = parseFloat(rawMonthly);
                if (!isNaN(parsedMonthly) && parsedMonthly > 0) monthlyIncome = parsedMonthly;
            }

            if (doc.documentType === 'balance_sheet') {
                if (!revenue) {
                    const raw = String(data.totalRevenue ?? data.revenue ?? '').replace(/[^0-9.]/g, '');
                    const parsed = parseFloat(raw);
                    if (!isNaN(parsed) && parsed > 0) revenue = parsed;
                }
                const entityName = String(data.entityName ?? data.businessName ?? data.companyName ?? '').trim();
                if (entityName && !businessName) businessName = entityName;
            }

            if (doc.documentType === 'gst_returns') {
                if (!revenue) {
                    const raw = String(data.monthlyTurnover ?? '').replace(/[^0-9.]/g, '');
                    const parsed = parseFloat(raw);
                    if (!isNaN(parsed)) revenue = parsed * 12; // annualise
                }
                const tradeName = String(data.tradeName ?? data.businessName ?? '').trim();
                if (tradeName && !businessName) businessName = tradeName;
            }

            if (doc.documentType === 'cibil_report') {
                // Credit score from CIBIL
                const rawScore = String(data.creditScore ?? '').replace(/[^0-9]/g, '');
                const score = parseInt(rawScore, 10);
                if (!isNaN(score) && score >= 300 && score <= 900) creditScore = score;

                // Outstanding loans from CIBIL
                const rawOutstanding = String(
                    data.currentBalance ?? data.totalOutstanding ?? data.outstandingAmount ?? '0'
                ).replace(/[^0-9.]/g, '');
                const outstanding = parseFloat(rawOutstanding);
                if (!isNaN(outstanding) && outstanding > 0) existingLoanAmount = outstanding;
            }

            if (doc.documentType === 'bank_statement') {
                if (!monthlyIncome) {
                    const raw = String(data.averageBalance ?? data.monthlyAverageBalance ?? '').replace(/[^0-9.]/g, '');
                    const parsed = parseFloat(raw);
                    if (!isNaN(parsed) && parsed > 0) monthlyIncome = parsed;
                }
            }
        });

        // Apply extracted values
        if (businessName) { form.setValue('businessName', businessName); filled.push('business name'); }
        if (revenue > 0) { form.setValue('annualRevenue', revenue); filled.push('annual revenue'); }
        if (monthlyIncome > 0) {
            form.setValue('monthlyIncome', monthlyIncome);
            filled.push('monthly income');
        } else if (revenue > 0) {
            form.setValue('monthlyIncome', Math.round(revenue / 12));
        }
        if (existingLoanAmount > 0) { form.setValue('existingLoanAmount', existingLoanAmount); filled.push('existing loans'); }
        if (creditScore !== undefined) {
            form.setValue('creditScore', creditScore);
            setCibilAutoFilled(true);
            filled.push('CIBIL score');
        }

        return filled;
    };

    const handleAutoPopulate = () => {
        if (documents.length === 0) return;
        const filled = populateFromDocuments(documents);
        if (filled.length > 0) {
            toast({
                title: 'Form Auto-Populated',
                description: `Extracted: ${filled.join(', ')} from your uploaded documents.`,
            });
        } else {
            toast({
                title: 'No Data Found',
                description: 'Could not extract matching fields from the uploaded documents.',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Customer prefill notice */}
                {prefilledCustomer && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-2 text-sm text-emerald-800">
                        <UserCheck className="h-4 w-4 shrink-0" />
                        <span>
                            Contact details pre-filled from customer record:{' '}
                            <strong>{prefilledCustomer.businessName}</strong>. Review and complete the financial fields below.
                        </span>
                    </div>
                )}

                {/* Auto-populate banner */}
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-blue-800 font-medium">
                            Use data from {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}?
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                        onClick={handleAutoPopulate}
                        disabled={documents.length === 0}
                        data-tour="auto-populate-btn"
                    >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Auto-Populate
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Business Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Business Information</h3>
                        <Separator />

                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter business name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="businessType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select business type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Retail">Retail</SelectItem>
                                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                            <SelectItem value="Services">Services</SelectItem>
                                            <SelectItem value="Trading">Trading</SelectItem>
                                            <SelectItem value="Agriculture">Agriculture</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Applicant Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Applicant Details</h3>
                        <Separator />

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold">Financial & Loan Details</h3>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="annualRevenue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Annual Revenue (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="monthlyIncome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monthly Income (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="existingLoanAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Existing Loans (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* CIBIL Score — required, no default */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-700">CIBIL Credit Score</span>
                            {cibilAutoFilled && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs ml-1">
                                    Auto-filled from CIBIL report
                                </Badge>
                            )}
                        </div>
                        <FormField
                            control={form.control}
                            name="creditScore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter CIBIL score (300–900)"
                                            min={300}
                                            max={900}
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs text-slate-500">
                                        Upload a CIBIL report in the Document Hub and use Auto-Populate to fill this automatically.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <FormField
                            control={form.control}
                            name="loanAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Requested Loan Amount (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="text-lg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="loanTerm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Loan Term (Months)</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="text-lg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto min-w-[200px]">
                        {isSubmitting ? 'Creating Application…' : 'Submit Application'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
