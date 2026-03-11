import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { VertexAI } from "@google-cloud/vertexai";
import { extractStructuredText } from "./documentAIProcessor";
import { validateCibilData } from "./cibilSchema";

// ────────────────────────────────────────────────────
// Shared Types
// ────────────────────────────────────────────────────

type DocumentType =
    | "cibil_report"
    | "balance_sheet"
    | "profit_loss"
    | "bank_statement"
    | "gst_returns"
    | "itr_document";

// ────────────────────────────────────────────────────
// Prompts per document type
// ────────────────────────────────────────────────────

const PROMPTS: Record<DocumentType, string> = {
    cibil_report: `You are an expert Indian credit report data extraction engine. Extract structured data from the provided structured markdown text of a TransUnion CIBIL Consumer Credit Report.
The text contains key-value pairs and tables extracted from a document.

CRITICAL RULES:
1. Extract EVERY piece of information. Do NOT skip any accounts or enquiries.
2. All monetary amounts: numeric only in INR, no commas/symbols (e.g. 5000000).
3. Dates: DD-MM-YYYY format.
4. Missing field: null for numbers, "" for strings.
5. Payment status codes: STD=Standard, SMA=Special Mention, SUB=Sub-standard, DBT=Doubtful, LSS=Loss, XXX=Not reported. Numeric DPD: "000"=0 days, "030"=30 days past due.
6. Account status: "Active", "Closed", "Written-off", "Settled".
7. hasSuitFiled: true if ANY account shows "Suit Filed" or "Wilful Default".
8. hasWrittenOff: true if ANY account is written off.
9. hasSettlement: true if ANY account is settled.
10. hasOverdue: true if ANY account has overdue amount > 0.

Return ONLY valid JSON (no markdown fences):
{
  "name": "", "dateOfBirth": "", "gender": "", "panNumber": "", "aadharNumber": "",
  "passportNumber": "", "voterId": "", "drivingLicense": "",
  "emails": [], "phones": [], "addresses": [],
  "cibilScore": 0, "scoreDate": "",
  "totalAccounts": 0, "totalActiveAccounts": 0, "totalClosedAccounts": 0,
  "totalOverdueAccounts": 0, "zeroBalanceAccounts": 0,
  "totalSanctionedAmount": 0, "totalCurrentBalance": 0, "totalOutstandingAmount": 0,
  "totalOverdueAmount": 0, "totalCreditLimit": 0, "totalEmiAmount": 0,
  "totalWrittenOffAmount": 0, "totalSettlementAmount": 0, "maxDaysPastDue": 0,
  "accounts": [{
    "accountType": "", "accountNumber": "", "ownershipIndicator": "",
    "dateOpened": "", "dateOfLastPayment": "",
    "sanctionedAmount": 0, "currentBalance": 0, "amountOverdue": 0,
    "creditLimit": 0, "emiAmount": 0,
    "paymentStatus": "", "accountStatus": "", "suitFiledStatus": "",
    "writtenOffAmount": 0, "settlementAmount": 0, "paymentHistoryPattern": ""
  }],
  "enquiries": [{ "enquiryDate": "", "memberName": "", "enquiryPurpose": "", "enquiryAmount": 0 }],
  "totalEnquiriesLast30Days": 0, "totalEnquiriesLast12Months": 0,
  "hasSettlement": false, "hasWrittenOff": false, "hasSuitFiled": false, "hasOverdue": false,
  "reportDate": "", "reportSummary": ""
}`,

    // ─── Balance Sheet ───────────────────────────────
    balance_sheet: `You are an expert Indian financial analyst. Extract structured data from a Balance Sheet document (PDF or image). This could be an MSME, SME, or corporate balance sheet in any format.

CRITICAL RULES:
1. All monetary amounts: numeric only in INR, no commas/symbols.
2. Dates: DD-MM-YYYY format. Missing field: null for numbers, "" for strings.
3. Liabilities = Source of funds; Assets = Application of funds.
4. Calculate ratios accurately from the extracted numbers.
5. If financial year is mentioned (e.g. FY 2023-24), extract it.

Return ONLY valid JSON (no markdown fences):
{
  "companyName": "",
  "reportingDate": "",
  "financialYear": "",
  "auditorName": "",
  "totalAssets": 0,
  "totalLiabilities": 0,
  "netWorth": 0,
  "paidUpCapital": 0,
  "reservesAndSurplus": 0,
  "longTermBorrowings": 0,
  "shortTermBorrowings": 0,
  "totalBorrowings": 0,
  "tradePayables": 0,
  "otherCurrentLiabilities": 0,
  "deferredTaxLiability": 0,
  "fixedAssets": 0,
  "investments": 0,
  "inventory": 0,
  "tradeReceivables": 0,
  "cashAndCashEquivalents": 0,
  "otherCurrentAssets": 0,
  "totalCurrentAssets": 0,
  "totalCurrentLiabilities": 0,
  "workingCapital": 0,
  "debtToEquityRatio": 0,
  "currentRatio": 0,
  "analysis": "Brief 2-3 sentence professional analysis of the financial position."
}`,

    // ─── Profit & Loss ───────────────────────────────
    profit_loss: `You are an expert Indian financial analyst. Extract structured data from a Profit & Loss Statement (also called Income Statement) document (PDF or image).

CRITICAL RULES:
1. All monetary amounts: numeric only in INR, no commas/symbols.
2. Dates: DD-MM-YYYY. Missing field: null for numbers, "" for strings.
3. Gross Profit = Revenue - Cost of Goods Sold/Cost of Revenue.
4. EBITDA = Operating Profit before interest, tax, depreciation, amortization.
5. PAT = Profit After Tax (Net Profit).
6. If multiple years are shown, extract the most recent year's data.

Return ONLY valid JSON (no markdown fences):
{
  "companyName": "",
  "financialYear": "",
  "periodFrom": "",
  "periodTo": "",
  "totalRevenue": 0,
  "revenueFromOperations": 0,
  "otherIncome": 0,
  "costOfGoodsSold": 0,
  "grossProfit": 0,
  "grossProfitMargin": 0,
  "employeeBenefitExpense": 0,
  "depreciationAndAmortization": 0,
  "financeCharges": 0,
  "otherExpenses": 0,
  "totalExpenses": 0,
  "ebitda": 0,
  "ebitdaMargin": 0,
  "operatingProfit": 0,
  "profitBeforeTax": 0,
  "taxExpense": 0,
  "profitAfterTax": 0,
  "netProfitMargin": 0,
  "earningsPerShare": 0,
  "analysis": "Brief 2-3 sentence analysis of the profitability trends."
}`,

    // ─── Bank Statement ──────────────────────────────
    bank_statement: `You are an expert financial analyst specializing in bank statement analysis for loan underwriting. Extract structured data from a bank statement (PDF or image).

CRITICAL RULES:
1. All monetary amounts: numeric only in INR, no commas/symbols.
2. Dates: DD-MM-YYYY. Missing field: null for numbers, "" for strings.
3. Count cheque bounces / return charges / ECS returns precisely — look for "CHQ RTN", "INSTRUMENTS RETURNED", "ECS DISHO", "NACH RETURN", "DISHONOUR".
4. Average Monthly Balance = sum of daily closing balances / number of days.
5. Cash Flow Pattern: "positive" if credits > debits, "negative" if debits > credits, "mixed" otherwise.
6. If multiple months shown, report period-level aggregates.

Return ONLY valid JSON (no markdown fences):
{
  "accountHolderName": "",
  "bankName": "",
  "branchName": "",
  "accountNumber": "",
  "accountType": "",
  "ifscCode": "",
  "statementFromDate": "",
  "statementToDate": "",
  "openingBalance": 0,
  "closingBalance": 0,
  "totalCredits": 0,
  "totalDebits": 0,
  "averageMonthlyBalance": 0,
  "minimumBalance": 0,
  "maximumBalance": 0,
  "numberOfCreditTransactions": 0,
  "numberOfDebitTransactions": 0,
  "chequeBounces": 0,
  "nachEcsReturns": 0,
  "inwardTransfers": 0,
  "outwardTransfers": 0,
  "salaryCredits": 0,
  "cashWithdrawals": 0,
  "cashDeposits": 0,
  "cashFlowPattern": "",
  "analysis": "Brief 2-3 sentence analysis of cash flow health, bounce history, and banking behaviour."
}`,

    // ─── GST Returns ────────────────────────────────
    gst_returns: `You are an expert Indian GST and tax analyst. Extract structured data from GST Return documents (GSTR-1, GSTR-3B, GSTR-2A, or Annual Return GSTR-9) — PDF or image.

CRITICAL RULES:
1. All monetary amounts: numeric only in INR, no commas/symbols.
2. Dates: DD-MM-YYYY. Missing field: null for numbers, "" for strings.
3. GSTIN format: 22AAAAA0000A1Z5 (15 characters).
4. Tax period: monthly (MM-YYYY) or quarterly (Q1/Q2/Q3/Q4 YYYY).
5. ITC = Input Tax Credit.

Return ONLY valid JSON (no markdown fences):
{
  "businessName": "",
  "gstin": "",
  "returnType": "",
  "taxPeriod": "",
  "filingDate": "",
  "totalTurnover": 0,
  "taxableTurnover": 0,
  "exemptTurnover": 0,
  "exportTurnover": 0,
  "totalOutputTax": 0,
  "cgst": 0,
  "sgst": 0,
  "igst": 0,
  "cess": 0,
  "totalITCClaimed": 0,
  "itcCgst": 0,
  "itcSgst": 0,
  "itcIgst": 0,
  "netTaxPayable": 0,
  "taxPaid": 0,
  "lateFee": 0,
  "outstandingTax": 0,
  "numberOfInvoices": 0,
  "isRegularFiler": true,
  "analysis": "Brief 2-3 sentence analysis of GST compliance, turnover trends, and tax health."
}`,

    // ─── ITR Document ────────────────────────────────
    itr_document: `You are an expert Indian income tax analyst. Extract structured data from an Income Tax Return (ITR) document or ITR Acknowledgement (PDF or image).

CRITICAL RULES:
1. All monetary amounts: numeric only in INR, no commas/symbols.
2. Dates: DD-MM-YYYY. Missing field: null for numbers, "" for strings.
3. ITR forms: ITR-1 (Sahaj), ITR-2, ITR-3, ITR-4 (Sugam), ITR-5, ITR-6.
4. Assessment Year format: YYYY-YY (e.g. 2024-25).
5. If refund is due, refundAmount > 0. If tax is payable, taxPayable > 0.

Return ONLY valid JSON (no markdown fences):
{
  "taxpayerName": "",
  "panNumber": "",
  "assessmentYear": "",
  "filingDate": "",
  "itrForm": "",
  "acknowledgementNumber": "",
  "filingStatus": "",
  "grossTotalIncome": 0,
  "salaryIncome": 0,
  "businessIncome": 0,
  "capitalGains": 0,
  "housePropertyIncome": 0,
  "otherSourcesIncome": 0,
  "totalDeductions": 0,
  "section80C": 0,
  "section80D": 0,
  "otherDeductions": 0,
  "netTaxableIncome": 0,
  "totalTaxPayable": 0,
  "advanceTaxPaid": 0,
  "tdsPaid": 0,
  "selfAssessmentTax": 0,
  "taxPaid": 0,
  "refundAmount": 0,
  "taxPayable": 0,
  "analysis": "Brief 2-3 sentence summary of income profile, tax compliance, and financial capacity."
}`
};

// ────────────────────────────────────────────────────
// Helper: Init Vertex AI and get model
// ────────────────────────────────────────────────────

const getModel = () => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!projectId) throw new HttpsError("internal", "GCP project ID not found.");

    const vertexAI = new VertexAI({ project: projectId, location: "us-central1" });

    return vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash-001",
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        },
    });
};

// ────────────────────────────────────────────────────
// Shared extraction logic
// ────────────────────────────────────────────────────

const extractWithGeminiVision = async (
    fileBase64OrText: string,
    mimeType: string,
    docType: DocumentType,
    isTextInput: boolean = false
) => {
    const model = getModel();
    const prompt = PROMPTS[docType];

    const userParts: any[] = [{ text: prompt }];

    if (isTextInput) {
        // We pre-processed it and extracted text
        userParts.push({ text: `\\n--- EXTRACTED DOCUMENT TEXT ---\\n${fileBase64OrText}` });
    } else {
        // Raw image / PDF
        userParts.push({ inlineData: { mimeType, data: fileBase64OrText } });
    }

    const result = await model.generateContent({
        contents: [{
            role: "user",
            parts: userParts
        }]
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new HttpsError("internal", "Empty response from AI model.");

    try {
        const cleaned = responseText.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
        return JSON.parse(cleaned);
    } catch {
        logger.error("JSON parse failure", { preview: responseText.substring(0, 500) });
        throw new HttpsError("internal", "AI returned invalid JSON. Please try again.");
    }
};

// ────────────────────────────────────────────────────
// Validate shared inputs
// ────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_DOC_TYPES: DocumentType[] = [
    "cibil_report", "balance_sheet", "profit_loss",
    "bank_statement", "gst_returns", "itr_document"
];

const validateRequest = (request: any) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const { fileBase64, mimeType, documentType } = request.data;

    if (!fileBase64 || !mimeType || !documentType) {
        throw new HttpsError("invalid-argument", "fileBase64, mimeType, and documentType are required.");
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new HttpsError("invalid-argument", `Unsupported file type: ${mimeType}.`);
    }

    if (!ALLOWED_DOC_TYPES.includes(documentType)) {
        throw new HttpsError("invalid-argument", `Unknown document type: ${documentType}.`);
    }

    const fileSizeBytes = Buffer.from(fileBase64, "base64").length;
    if (fileSizeBytes > MAX_SIZE_BYTES) {
        throw new HttpsError("invalid-argument", `File too large (${(fileSizeBytes / 1024 / 1024).toFixed(1)}MB). Maximum is 15MB.`);
    }

    return { fileBase64, mimeType, documentType: documentType as DocumentType, fileSizeBytes };
};

// ────────────────────────────────────────────────────
// Cloud Function: extractCibilReport (backwards compat)
// ────────────────────────────────────────────────────

export const extractCibilReport = onCall(
    { region: "us-central1", timeoutSeconds: 120, memory: "512MiB", maxInstances: 10 },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "You must be logged in to extract CIBIL reports.");
        }

        const { fileBase64, mimeType } = request.data;

        if (!fileBase64 || !mimeType) {
            throw new HttpsError("invalid-argument", "fileBase64 and mimeType are required.");
        }

        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            throw new HttpsError("invalid-argument", `Unsupported file type: ${mimeType}.`);
        }

        const fileSizeBytes = Buffer.from(fileBase64, "base64").length;
        if (fileSizeBytes > MAX_SIZE_BYTES) {
            throw new HttpsError("invalid-argument", `File too large.`);
        }

        logger.info("extractCibilReport called", {
            userId: request.auth.uid,
            mimeType,
            fileSizeMB: (fileSizeBytes / 1024 / 1024).toFixed(2),
        });

        try {
            let structuredText: string;

            try {
                // Phase 1: Use Document AI to get structured markdown tables and form fields
                structuredText = await extractStructuredText(fileBase64, mimeType);
                logger.info("Document AI extraction successful for CIBIL");
            } catch (docAIError) {
                logger.warn("Document AI extraction failed, falling back to raw Gemini Vision processing", { error: docAIError });
                // Fallback to exactly what the code did before: pass base64 directly to Gemini
                const rawData = await extractWithGeminiVision(fileBase64, mimeType, "cibil_report");
                const validatedFallback = validateCibilData(rawData);
                return { success: true, data: validatedFallback };
            }

            // Phase 2: Use Gemini to reason over the structured text and extract the exact fields
            const extractedJson = await extractWithGeminiVision(structuredText, "text/plain", "cibil_report", true);

            // Phase 3: Validate the JSON with Zod
            const validatedData = validateCibilData(extractedJson);

            logger.info("CIBIL extracted & validated", { userId: request.auth.uid, score: validatedData.cibilScore });
            return { success: true, data: validatedData };
        } catch (error: any) {
            if (error instanceof HttpsError) throw error;
            logger.error("extractCibilReport error", { error: error.message });
            throw new HttpsError("internal", `Failed to process CIBIL report: ${error.message}`);
        }
    }
);

// ────────────────────────────────────────────────────
// Cloud Function: extractMsmeDocument (all 6 types)
// ────────────────────────────────────────────────────

export const extractMsmeDocument = onCall(
    { region: "us-central1", timeoutSeconds: 120, memory: "512MiB", maxInstances: 10 },
    async (request) => {
        const { fileBase64, mimeType, documentType, fileSizeBytes } = validateRequest(request);

        logger.info("extractMsmeDocument called", {
            userId: request.auth!.uid,
            documentType,
            mimeType,
            fileSizeMB: (fileSizeBytes / 1024 / 1024).toFixed(2),
        });

        try {
            if (documentType === "cibil_report") {
                let structuredText: string;

                try {
                    structuredText = await extractStructuredText(fileBase64, mimeType);
                } catch (docAIError) {
                    logger.warn("Document AI failed for generic extractMsmeDocument, falling back to Vision", { error: docAIError });
                    const rawData = await extractWithGeminiVision(fileBase64, mimeType, "cibil_report");
                    const validatedFallbackData = validateCibilData(rawData);
                    return { success: true, documentType, data: validatedFallbackData };
                }

                const rawExtracted = await extractWithGeminiVision(structuredText, "text/plain", "cibil_report", true);
                const data = validateCibilData(rawExtracted);
                logger.info("Document extracted (hybrid CIBIL)", { userId: request.auth!.uid, documentType });
                return { success: true, documentType, data };
            }

            // For non-CIBIL documents, continue using pure Gemini Vision
            const data = await extractWithGeminiVision(fileBase64, mimeType, documentType);
            logger.info("Document extracted (vision)", { userId: request.auth!.uid, documentType });
            return { success: true, documentType, data };
        } catch (error: any) {
            if (error instanceof HttpsError) throw error;
            logger.error("extractMsmeDocument error", { documentType, error: error.message });
            throw new HttpsError("internal", `Failed to process ${documentType}: ${error.message}`);
        }
    }
);
