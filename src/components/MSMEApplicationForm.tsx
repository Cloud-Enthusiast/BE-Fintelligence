
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDocuments, StoredDocument } from '@/contexts/DocumentContext';
import { ExtractedMSMEData } from '@/types/msmeDocuments';
import { RefreshCw, FileText } from 'lucide-react';

const formSchema = z.object({
    businessName: z.string().min(2, "Business name is required"),
    fullName: z.string().min(2, "Applicant name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    businessType: z.string().min(1, "Business type is required"),
    annualRevenue: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Revenue must be positive")
    ),
    monthlyIncome: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Income must be positive")
    ),
    existingLoanAmount: z.preprocess(
        (val) => Number(val),
        z.number().min(0)
    ).default(0),
    loanAmount: z.preprocess(
        (val) => Number(val),
        z.number().min(1000, "Minimum loan amount is 1000")
    ),
    loanTerm: z.preprocess(
        (val) => Number(val),
        z.number().min(3, "Minimum term is 3 months")
    ),
    creditScore: z.preprocess(
        (val) => Number(val),
        z.number().min(300).max(900)
    ).default(700), // Defaulting for now
});

export type MSMEApplicationFormValues = z.infer<typeof formSchema>;

interface MSMEApplicationFormProps {
    onSubmit: (values: MSMEApplicationFormValues) => void;
    isSubmitting?: boolean;
}

export const MSMEApplicationForm = ({ onSubmit, isSubmitting = false }: MSMEApplicationFormProps) => {
    const { documents } = useDocuments();

    const form = useForm<MSMEApplicationFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            businessName: '',
            fullName: '',
            email: '',
            phone: '',
            businessType: '',
            annualRevenue: 0,
            monthlyIncome: 0,
            existingLoanAmount: 0,
            loanAmount: 0,
            loanTerm: 12,
            creditScore: 700,
        },
    });

    // Helper to extract data from documents
    const populateFromDocuments = (selectedDocs: StoredDocument[]) => {
        let revenue = 0;
        let businessName = '';

        selectedDocs.forEach(doc => {
            const data = doc.extractedData.data as any;
            if (doc.documentType === 'profit_loss') {
                if (data.revenue) {
                    // Simple parsing logic, assuming clean numbers or simple strings
                    const parsed = parseFloat(String(data.revenue).replace(/[^0-9.]/g, ''));
                    if (!isNaN(parsed)) revenue = parsed;
                }
            }
            if (doc.documentType === 'gst_returns') {
                if (data.monthlyTurnover && !revenue) {
                    const parsed = parseFloat(String(data.monthlyTurnover).replace(/[^0-9.]/g, ''));
                    if (!isNaN(parsed)) revenue = parsed * 12; // Estimate annual
                }
            }
            // Try to find business entity name if available (mock logic for now as extractor doesn't explicitly guarantee it)
        });

        if (revenue > 0) {
            form.setValue('annualRevenue', revenue);
            form.setValue('monthlyIncome', Math.round(revenue / 12));
        }
        // Could add toaster here
    };

    const handleAutoPopulate = () => {
        populateFromDocuments(documents);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-blue-800 font-medium">Use data from {documents.length} uploaded documents?</span>
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
                    {/* Basic Info */}
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
                        {isSubmitting ? "Creating Application..." : "Submit Application"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
