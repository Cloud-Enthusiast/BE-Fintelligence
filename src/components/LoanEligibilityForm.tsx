
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { calculateEligibility, EligibilityInput, EligibilityResult } from '@/utils/MSMEEligibilityCalculator';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Building2,
    IndianRupee,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    FileText,
    CreditCard,
    HelpCircle,
    Calculator
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Utility function for Indian number formatting
const formatIndianNumber = (num: number | string): string => {
    const numStr = num.toString().replace(/,/g, '');
    if (!numStr || isNaN(Number(numStr))) return '';

    const [integer, decimal] = numStr.split('.');
    const lastThree = integer.slice(-3);
    const otherNumbers = integer.slice(0, -3);

    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (otherNumbers ? ',' : '') + lastThree;
    return decimal ? `${formatted}.${decimal}` : formatted;
};

const parseIndianNumber = (formattedNum: string): number => {
    return Number(formattedNum.replace(/,/g, ''));
};

const formSchema = z.object({
    // Step 1: Personal Details
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Invalid PAN format (e.g., ABCDE1234F)" }),
    address: z.string().min(10, { message: "Address must be at least 10 characters." }),

    // Step 2: Business Details
    businessName: z.string().min(2, { message: "Business name must be at least 2 characters." }),
    businessType: z.string().min(1, { message: "Please select a business type." }),
    yearsInBusiness: z.coerce.number().min(0, { message: "Years in business must be positive." }),
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: "Invalid GST format" }).optional().or(z.literal('')),
    gstFilingRegularity: z.enum(['regular', 'mostly_regular', 'irregular', 'not_applicable'], { message: "Please select GST filing regularity." }),

    // Step 3: Financial Metrics
    annualRevenue: z.coerce.number().min(0, { message: "Revenue must be positive." }),
    monthlyProfit: z.coerce.number().min(0, { message: "Profit must be positive." }),
    existingLoanAmount: z.coerce.number().min(0),
    monthlyEMI: z.coerce.number().min(0),
    creditScore: z.coerce.number().min(300).max(900),
    bankAccountNumber: z.string().min(9, { message: "Invalid bank account number." }),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: "Invalid IFSC code format." }),
    averageMonthlyBalance: z.coerce.number().min(0),

    // Step 4: Loan Requirements
    loanAmount: z.coerce.number().min(100000, { message: "Minimum loan amount is ₹1,00,000." }),
    loanTerm: z.coerce.number().min(3).max(120),
    loanPurpose: z.string().min(10, { message: "Please describe the loan purpose (min 10 characters)." }),
    collateralAvailable: z.enum(['yes', 'no']),
    collateralValue: z.coerce.number().min(0).optional(),
    loanType: z.enum(['business_loan', 'working_capital', 'home_loan'], {
        required_error: "Please select a loan type.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
    { id: 1, title: 'Personal Info', icon: User, color: 'finance' },
    { id: 2, title: 'Business Details', icon: Building2, color: 'indigo' },
    { id: 3, title: 'Financial Metrics', icon: TrendingUp, color: 'emerald' },
    { id: 4, title: 'Loan Requirements', icon: CreditCard, color: 'violet' },
];

import { useAuth } from '@/contexts/AuthContext';
import { submitLoanApplication } from '@/services/loanService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// ... (existing imports)

export const LoanEligibilityForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            panNumber: '',
            address: '',
            businessName: '',
            businessType: 'Services',
            yearsInBusiness: 1,
            gstNumber: '',
            gstFilingRegularity: 'not_applicable',
            annualRevenue: 0,
            monthlyProfit: 0,
            existingLoanAmount: 0,
            monthlyEMI: 0,
            creditScore: 750,
            bankAccountNumber: '',
            ifscCode: '',
            averageMonthlyBalance: 0,
            loanAmount: 100000,
            loanTerm: 12,
            loanPurpose: '',
            collateralAvailable: 'no',
            collateralValue: 0,
            loanType: 'business_loan',
        },
    });

    const watchAllFields = form.watch();

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        console.log("Form Submitted:", values);

        // Calculate eligibility on submit
        const input: EligibilityInput = {
            annualRevenue: Number(values.annualRevenue) || 0,
            monthlyIncome: Number(values.monthlyProfit) || 0,
            existingLoanAmount: Number(values.existingLoanAmount) || 0,
            loanAmount: Number(values.loanAmount) || 0,
            loanTerm: Number(values.loanTerm) || 12,
            creditScore: Number(values.creditScore) || 300,
            businessType: values.businessType || 'Services',
            loanType: values.loanType || 'business_loan',
        };

        const result = calculateEligibility(input);
        setEligibility(result);
        setShowResults(true);

        const monthlyIncome = values.monthlyProfit;
        const debtToIncomeRatio = monthlyIncome > 0 ? (values.monthlyEMI / monthlyIncome) * 100 : 0;
        console.log("Debt-to-Income Ratio:", debtToIncomeRatio.toFixed(2) + "%");
        console.log("Eligibility Result:", result);

        try {
            if (user) {
                await submitLoanApplication({
                    userId: user.uid,
                    ...values,
                    eligibilityResult: result
                } as any);
                toast({
                    title: "Application Submitted",
                    description: "Your loan application has been saved securely.",
                });
            } else {
                toast({
                    title: "Application Calculated",
                    description: "Sign in to save your application.",
                    variant: "default"
                });
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast({
                title: "Error",
                description: "Failed to save application.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep);
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getFieldsForStep = (step: number): (keyof FormValues)[] => {
        switch (step) {
            case 1:
                return ['fullName', 'email', 'phone', 'panNumber', 'address'];
            case 2:
                return ['businessName', 'businessType', 'yearsInBusiness', 'gstNumber', 'gstFilingRegularity'];
            case 3:
                return ['annualRevenue', 'monthlyProfit', 'existingLoanAmount', 'monthlyEMI', 'creditScore', 'bankAccountNumber', 'ifscCode', 'averageMonthlyBalance'];
            case 4:
                return ['loanAmount', 'loanTerm', 'loanPurpose', 'collateralAvailable', 'loanType'];
            default:
                return [];
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'bg-emerald-500';
        if (score >= 40) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getScoreText = (score: number) => {
        if (score >= 70) return 'text-emerald-700';
        if (score >= 40) return 'text-amber-700';
        return 'text-red-700';
    };

    const getStatusBadge = (score: number) => {
        if (score >= 70) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">High Eligibility</Badge>;
        if (score >= 40) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Medium Eligibility</Badge>;
        return <Badge className="bg-red-100 text-red-700 border-red-200">Low Eligibility</Badge>;
    };

    const debtToIncomeRatio = watchAllFields.monthlyProfit > 0
        ? ((watchAllFields.monthlyEMI / watchAllFields.monthlyProfit) * 100).toFixed(2)
        : '0.00';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {/* Progress Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                                            ? 'bg-finance-600 text-white shadow-lg scale-110'
                                            : isCompleted
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            <StepIcon className="h-5 w-5" />
                                        </div>
                                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-finance-700' : 'text-gray-500'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 rounded transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <Card className="border-none shadow-md overflow-hidden bg-white">
                                <div className="h-2 bg-finance-600" />
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 text-finance-700 mb-1">
                                        <User className="h-5 w-5" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Step 1 of 4</span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900">Personal Information</CardTitle>
                                    <CardDescription>Enter the applicant's personal and contact details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name (as per PAN)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="john@example.com" {...field} />
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
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+91 98765 43210" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="panNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PAN Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ABCDE1234F" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                                                </FormControl>
                                                <FormDescription>10-character alphanumeric PAN card number</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Residential Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Main Street, City, State - 400001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Business Details */}
                        {currentStep === 2 && (
                            <Card className="border-none shadow-md overflow-hidden bg-white">
                                <div className="h-2 bg-indigo-600" />
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 text-indigo-700 mb-1">
                                        <Building2 className="h-5 w-5" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Step 2 of 4</span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900">Business Details</CardTitle>
                                    <CardDescription>Information about the business entity.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="businessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registered Business Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Acme Corporation Pvt Ltd" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="businessType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Industry Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select industry" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Services">Services</SelectItem>
                                                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                                            <SelectItem value="Retail">Retail</SelectItem>
                                                            <SelectItem value="Trading">Trading</SelectItem>
                                                            <SelectItem value="Technology">Technology</SelectItem>
                                                            <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="yearsInBusiness"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Years in Operation</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="gstNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="22AAAAA0000A1Z5" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                                                </FormControl>
                                                <FormDescription>15-character GST identification number</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="gstFilingRegularity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST Filing Regularity</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select filing status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="regular">Regular (All returns filed on time)</SelectItem>
                                                        <SelectItem value="mostly_regular">Mostly Regular (1-2 delays)</SelectItem>
                                                        <SelectItem value="irregular">Irregular (Multiple delays)</SelectItem>
                                                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Financial Metrics */}
                        {currentStep === 3 && (
                            <Card className="border-none shadow-md overflow-hidden bg-white">
                                <div className="h-2 bg-emerald-600" />
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                                        <TrendingUp className="h-5 w-5" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Step 3 of 4</span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900">Financial Metrics</CardTitle>
                                    <CardDescription>Detailed financial information for eligibility assessment.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="annualRevenue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Annual Revenue (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                className="pl-9"
                                                                type="text"
                                                                placeholder="50,00,000"
                                                                value={field.value ? formatIndianNumber(field.value) : ''}
                                                                onChange={(e) => {
                                                                    const parsed = parseIndianNumber(e.target.value);
                                                                    field.onChange(parsed);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Total revenue for the last financial year</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="monthlyProfit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Average Monthly Profit (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                className="pl-9"
                                                                type="text"
                                                                placeholder="50,000"
                                                                value={field.value ? formatIndianNumber(field.value) : ''}
                                                                onChange={(e) => {
                                                                    const parsed = parseIndianNumber(e.target.value);
                                                                    field.onChange(parsed);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Net profit after expenses</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="existingLoanAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Existing Loan Amount (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                className="pl-9"
                                                                type="text"
                                                                placeholder="0"
                                                                value={field.value ? formatIndianNumber(field.value) : ''}
                                                                onChange={(e) => {
                                                                    const parsed = parseIndianNumber(e.target.value);
                                                                    field.onChange(parsed);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Total outstanding loan balance</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="monthlyEMI"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Monthly EMI (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                className="pl-9"
                                                                type="text"
                                                                placeholder="0"
                                                                value={field.value ? formatIndianNumber(field.value) : ''}
                                                                onChange={(e) => {
                                                                    const parsed = parseIndianNumber(e.target.value);
                                                                    field.onChange(parsed);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Total monthly EMI payments</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Debt-to-Income Ratio Display */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-900">Debt-to-Income Ratio</p>
                                                <p className="text-xs text-blue-700">Lower is better (Ideal: &lt;40%)</p>
                                            </div>
                                            <div className={`text-2xl font-bold ${parseFloat(debtToIncomeRatio) < 40 ? 'text-emerald-600' :
                                                parseFloat(debtToIncomeRatio) < 60 ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                {debtToIncomeRatio}%
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <FormField
                                        control={form.control}
                                        name="creditScore"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CIBIL Credit Score</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="750" {...field} />
                                                </FormControl>
                                                <FormDescription>Score range: 300-900 (Higher is better)</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="bankAccountNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bank Account Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="1234567890" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ifscCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>IFSC Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="SBIN0001234" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="averageMonthlyBalance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Average Monthly Bank Balance (₹)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            className="pl-9"
                                                            type="text"
                                                            placeholder="1,00,000"
                                                            value={field.value ? formatIndianNumber(field.value) : ''}
                                                            onChange={(e) => {
                                                                const parsed = parseIndianNumber(e.target.value);
                                                                field.onChange(parsed);
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>Average balance over last 6 months</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4: Loan Requirements */}
                        {currentStep === 4 && (
                            <Card className="border-none shadow-md overflow-hidden bg-white">
                                <div className="h-2 bg-violet-600" />
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 text-violet-700 mb-1">
                                        <CreditCard className="h-5 w-5" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Step 4 of 4</span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900">Loan Requirements</CardTitle>
                                    <CardDescription>Specify the loan details and purpose.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="loanType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Loan Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select loan type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="business_loan">Business Turn-over Loan</SelectItem>
                                                            <SelectItem value="working_capital">Working Capital (CC/OD)</SelectItem>
                                                            <SelectItem value="home_loan">Home Loan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Select the specific product to check eligibility for</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="loanAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-finance-900 font-bold">Requested Loan Amount (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-finance-600" />
                                                            <Input
                                                                className="pl-9 border-finance-200 bg-finance-50 text-lg font-semibold"
                                                                type="text"
                                                                placeholder="5,00,000"
                                                                value={field.value ? formatIndianNumber(field.value) : ''}
                                                                onChange={(e) => {
                                                                    const parsed = parseIndianNumber(e.target.value);
                                                                    field.onChange(parsed);
                                                                }}
                                                            />
                                                        </div>
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
                                                    <FormLabel>Loan Term (Months)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="24" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Repayment period: 3-120 months</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="loanPurpose"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Loan Purpose</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Working capital, equipment purchase, business expansion, etc." {...field} />
                                                </FormControl>
                                                <FormDescription>Describe how the loan will be used</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    <FormField
                                        control={form.control}
                                        name="collateralAvailable"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Collateral Available?</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select option" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Property, equipment, or other assets as security</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {watchAllFields.collateralAvailable === 'yes' && (
                                        <FormField
                                            control={form.control}
                                            name="collateralValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estimated Collateral Value (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                className="pl-9"
                                                                type="text"
                                                                placeholder="10,00,000"
                                                                value={field.value ? formatIndianNumber(field.value) : ''}
                                                                onChange={(e) => {
                                                                    const parsed = parseIndianNumber(e.target.value);
                                                                    field.onChange(parsed);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Market value of the collateral</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="min-w-[120px]"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.reset()}
                                >
                                    Reset Form
                                </Button>

                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-finance-600 hover:bg-finance-700 min-w-[120px]"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Submit Application
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </div>

            {/* Real-time Eligibility Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <Card className="border-none shadow-lg overflow-hidden bg-white">
                        <CardHeader className="bg-gray-50 border-b">
                            <div className="flex items-center gap-2 text-gray-900">
                                <ShieldCheck className="h-5 w-5 text-finance-600" />
                                <CardTitle className="text-xl">Eligibility Result</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {eligibility && showResults ? (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <span className={`text-5xl font-extrabold ${getScoreText(eligibility.overallScore)}`}>
                                            {eligibility.overallScore}
                                        </span>
                                        <span className="text-gray-400 text-lg ml-1">/ 100</span>
                                        <div className="mt-4 flex justify-center uppercase tracking-widest text-xs font-bold text-gray-500">
                                            Overall Score
                                        </div>
                                        <div className="mt-2 text-center">
                                            <EligibilityBreakdownDialog eligibility={eligibility} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Credit Preparedness</span>
                                            <span>{eligibility.overallScore}%</span>
                                        </div>
                                        <Progress
                                            value={eligibility.overallScore}
                                            className="h-3"
                                            indicatorClassName={getScoreColor(eligibility.overallScore)}
                                        />
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>High Risk</span>
                                            <span>Medium</span>
                                            <span>Safe</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        {getStatusBadge(eligibility.overallScore)}
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Key Metrics</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <MetricItem
                                                label="DSCR"
                                                value={eligibility.metrics.dscr || 0}
                                                score={eligibility.breakdown.dscrScore}
                                            />
                                            <MetricItem
                                                label="Industry Risk"
                                                value={watchAllFields.businessType}
                                                score={eligibility.breakdown.industryRiskScore}
                                            />
                                            <MetricItem
                                                label="Credit Score"
                                                value={watchAllFields.creditScore}
                                                score={eligibility.breakdown.creditScore}
                                            />
                                            <MetricItem
                                                label="GST Compliance"
                                                value={watchAllFields.gstFilingRegularity.replace('_', ' ')}
                                                score={eligibility.breakdown.gstComplianceScore}
                                            />
                                        </div>
                                    </div>

                                    {!eligibility.isEligible && (
                                        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100 flex gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-bold text-red-800">Ineligible for direct approval</p>
                                                <p className="text-red-700 mt-1">{eligibility.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {eligibility.isEligible && (
                                        <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-3">
                                            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-bold text-emerald-800">Qualified for MSME Loan</p>
                                                <p className="text-emerald-700 mt-1">
                                                    {eligibility.eligibilityNote || "This application meets the minimum criteria for standard processing."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Start filling the form to see real-time eligibility</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-finance-900 text-white">
                        <CardContent className="p-6">
                            <h4 className="font-bold mb-2">Loan Officer Tip</h4>
                            <p className="text-sm text-finance-100 leading-relaxed">
                                Ensure all financial figures are cross-verified with Bank Statements and GST Returns for higher scoring accuracy.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const EligibilityBreakdownDialog = ({ eligibility }: { eligibility: EligibilityResult }) => {
    // Helper to format score with color
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 font-bold";
        if (score >= 60) return "text-amber-600 font-bold";
        return "text-red-600 font-bold";
    };

    const breakdownItems = [
        {
            category: "Repayment Capacity (DSCR)",
            weight: "25%",
            score: eligibility.breakdown.dscrScore,
            value: eligibility.metrics.dscr?.toString() || "N/A",
            explanation: "Measures ability to pay EMI from operating income. Ratio > 1.25 is excellent."
        },
        {
            category: "Credit History",
            weight: "10%",
            score: eligibility.breakdown.creditScore,
            value: "CIBIL Score",
            explanation: "Personal credit behavior. Score > 750 is ideal."
        },
        {
            category: "Liquidity (Current Ratio)",
            weight: "15%",
            score: eligibility.breakdown.currentRatioScore,
            value: eligibility.metrics.currentRatio?.toString() || "N/A",
            explanation: "Ability to pay short-term debts. Ratio > 1.5 is standard."
        },
        {
            category: "Banking Behavior",
            weight: "15%",
            score: eligibility.breakdown.bankingRelationshipScore,
            value: eligibility.metrics.bankingRelationship || "N/A",
            explanation: "Checks for cheque bounces and balance maintenance."
        },
        {
            category: "GST Compliance",
            weight: "15%",
            score: eligibility.breakdown.gstComplianceScore,
            value: eligibility.metrics.gstCompliance || "N/A",
            explanation: "Regularity of government tax filings."
        },
        {
            category: "Business Growth",
            weight: "10%",
            score: eligibility.breakdown.revenueGrowthScore,
            value: (eligibility.metrics.revenueGrowth?.toString() || "0") + "%",
            explanation: "Year-over-year revenue growth percentage."
        },
        {
            category: "Industry Risk",
            weight: "10%",
            score: eligibility.breakdown.industryRiskScore,
            value: "Sector Risk",
            explanation: "Base risk associated with the specific business sector."
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className="text-finance-600 h-auto p-0 hover:text-finance-800">
                    <Calculator className="w-3 h-3 mr-1" />
                    How is this calculated?
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Calculator className="w-5 h-5 text-finance-600" />
                        Eligibility Score Breakdown
                    </DialogTitle>
                    <DialogDescription>
                        Detailed analysis of how the overall score of <span className="font-bold text-finance-700">{eligibility.overallScore}/100</span> was derived.
                    </DialogDescription>
                </DialogHeader>

                <div className="border rounded-md mt-2">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[200px]">Criteria</TableHead>
                                <TableHead>Your Value</TableHead>
                                <TableHead className="text-center">Weightage</TableHead>
                                <TableHead className="text-center">Score</TableHead>
                                <TableHead>Explanation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {breakdownItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.category}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell className="text-center text-gray-500">{item.weight}</TableCell>
                                    <TableCell className={`text-center ${getScoreColor(item.score)}`}>
                                        {item.score}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">{item.explanation}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-blue-50 p-4 rounded-md mt-4 text-sm text-blue-800 border border-blue-100 flex gap-3">
                    <HelpCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <span className="font-bold block mb-1">Understanding the Calculation:</span>
                        The final score is a <strong>Weighted Average</strong>. We multiply each individual score (0-100) by its weightage and sum them up.
                        For example, if your <strong>DSCR Score is 80</strong> (weight 25%) and <strong>Credit Score is 90</strong> (weight 10%), they contribute
                        20 points and 9 points to the total respectively.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


interface MetricItemProps {
    label: string;
    value: string | number;
    score: number;
}

const MetricItem = ({ label, value, score }: MetricItemProps) => {
    const getStatusColor = (s: number) => {
        if (s >= 70) return 'text-emerald-600';
        if (s >= 40) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
            <div>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm font-bold text-gray-900">{value}</div>
            </div>
            <div className={`text-sm font-bold ${getStatusColor(score)}`}>
                {score}
            </div>
        </div>
    );
};
