import { onObjectFinalized } from "firebase-functions/v2/storage";
import { logger } from "firebase-functions/v2";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { VertexAI } from "@google-cloud/vertexai";
import * as admin from "firebase-admin";
import { validateCibilData } from "./cibilSchema";
import { HttpsError } from "firebase-functions/v2/https";
import path from "path";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// ────────────────────────────────────────────────────
// Prompts per document type (Same as index.ts)
// ────────────────────────────────────────────────────
const CIBIL_PROMPT = `You are an expert Indian credit report data extraction engine. Extract structured data from the provided structured markdown text of a TransUnion CIBIL Consumer Credit Report.
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
}`;

// ────────────────────────────────────────────────────
// Helper: Init Vertex AI and get model
// ────────────────────────────────────────────────────
const getModel = () => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG as string).projectId : undefined;
    if (!projectId) throw new Error("GCP project ID not found.");

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

/**
 * Helper to extract text from a Document AI layout text anchor
 */
const getText = (textAnchor: any, text: string): string => {
    if (!textAnchor || !textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        return '';
    }
    return textAnchor.textSegments.map((segment: any) => {
        const startIndex = segment.startIndex || 0;
        const endIndex = segment.endIndex;
        return text.substring(Number(startIndex), Number(endIndex));
    }).join('');
};

/**
 * Helper to clean up extracted text
 */
const cleanText = (text: string): string => {
    return text.replace(/\n|:/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Converts Document AI Form Fields into a readable key-value string
 */
const formFieldsToText = (formFields: any[], fullText: string): string => {
    if (!formFields || formFields.length === 0) return '';
    let textBlocks: string[] = [];
    formFields.forEach((field) => {
        const fieldName = field.fieldName ? cleanText(getText(field.fieldName.textAnchor, fullText)) : '';
        const fieldValue = field.fieldValue ? cleanText(getText(field.fieldValue.textAnchor, fullText)) : '';
        if (fieldName && fieldValue) {
            textBlocks.push(`${fieldName}: ${fieldValue}`);
        }
    });
    return textBlocks.join('\n');
};

/**
 * Converts a Document AI Table into a Markdown Table string
 */
const tablesToMarkdown = (tables: any[], fullText: string): string => {
    if (!tables || tables.length === 0) return '';
    let markdown = '';
    tables.forEach((table, index) => {
        markdown += `\n### Table ${index + 1}\n\n`;
        if (table.headerRows && table.headerRows.length > 0) {
            const headerRow = table.headerRows[0];
            const headers = headerRow.cells.map((cell: any) =>
                cleanText(getText(cell?.layout?.textAnchor, fullText))
            );
            markdown += `| ${headers.join(' | ')} |\n`;
            markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        }
        if (table.bodyRows && table.bodyRows.length > 0) {
            table.bodyRows.forEach((row: any) => {
                const rowCells = row.cells.map((cell: any) =>
                    cleanText(getText(cell?.layout?.textAnchor, fullText))
                );
                markdown += `| ${rowCells.join(' | ')} |\n`;
            });
        }
        markdown += '\n';
    });
    return markdown;
};

// ────────────────────────────────────────────────────
// Cloud Function: processLargeDocument (Async Storage Trigger)
// ────────────────────────────────────────────────────
// This function triggers whenever a new file is uploaded to `reports/{userId}/{uuid}.pdf`
export const processLargeDocument = onObjectFinalized(
    { 
        region: "us-central1", 
        timeoutSeconds: 3600,  // Max timeout for v2 background functions 
        memory: "2GiB"
    },
    async (event) => {
        const fileBucket = event.data.bucket;
        const filePath = event.data.name; // e.g. "reports/USER_ID/UUID.pdf"

        // Only process files in the `reports/` folder
        if (!filePath.startsWith("reports/")) {
            return;
        }

        const pathParts = filePath.split("/");
        if (pathParts.length < 3) return; // Must be reports/userId/filename

        const userId = pathParts[1];
        const fileName = pathParts[pathParts.length - 1];
        const uuid = path.parse(fileName).name; // e.g. "uuid"

        const mimeType = event.data.contentType;
        if (!["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(mimeType || "")) {
            logger.warn(`Unsupported file type: ${mimeType} for ${filePath}`);
            return;
        }

        logger.info(`Starting async extraction pipeline for user ${userId}, file ${fileName}`);

        // Update Firestore status to "processing" early
        const reportRef = db.collection("users").doc(userId).collection("cibilReports").doc(uuid);
        await reportRef.set({
            status: "processing",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            fileName,
            downloadUrl: `gs://${fileBucket}/${filePath}`
        }, { merge: true });

        const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG as string).projectId : undefined;
        if (!projectId) {
            logger.error("GCP project ID not found.");
            await reportRef.set({ status: "error", error: "Configuration Error" }, { merge: true });
            return;
        }

        const processorId = process.env.DOCUMENT_AI_CIBIL_PROCESSOR_ID;
        if (!processorId) {
            logger.error("Missing DOCUMENT_AI_CIBIL_PROCESSOR_ID environment variable.");
            await reportRef.set({ status: "error", error: "Processor Configuration Error" }, { merge: true });
            return;
        }

        try {
            // STEP 1: Call Document AI Batch Processing
            const client = new DocumentProcessorServiceClient();
            const location = "us";
            const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

            // Define GCS input/output URIs
            const gcsInputUri = `gs://${fileBucket}/${filePath}`;
            const outputPrefix = `parsed-reports/${userId}/${uuid}/`;
            const gcsOutputUri = `gs://${fileBucket}/${outputPrefix}`;

            const request = {
                name,
                inputDocuments: {
                    gcsDocuments: {
                        documents: [{
                            gcsUri: gcsInputUri,
                            mimeType: mimeType,
                        }],
                    },
                },
                documentOutputConfig: {
                    gcsOutputConfig: {
                        gcsUri: gcsOutputUri,
                    },
                },
            };

            logger.info(`Triggering batchProcessDocuments for ${gcsInputUri}`);
            const [operation] = await client.batchProcessDocuments(request);

            // Wait for the long-running operation to complete. Max 3600 seconds.
            await operation.promise();
            logger.info(`Document AI Batch processing completed for ${uuid}`);

            // STEP 2: Aggregate the output shards
            const bucket = admin.storage().bucket(fileBucket);
            const [files] = await bucket.getFiles({ prefix: outputPrefix });
            
            // Filter only to actual JSON shard files
            const jsonFiles = files.filter(f => f.name.endsWith(".json"));
            
            if (jsonFiles.length === 0) {
                throw new Error("Document AI returned no JSON shards.");
            }

            // Since it could be many shards, process them in order by name suffix (e.g. -0.json, -1.json)
            jsonFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            let fullStructuredMarkdown = `# Async Document AI Structure Extraction\n\n`;

            for (const file of jsonFiles) {
                const [content] = await file.download();
                const jsonContent = JSON.parse(content.toString('utf-8'));
                
                const document = jsonContent; // Assuming direct object based on new Document AI output format
                
                if (document.text) {
                    // Extract text specifically for this shard
                    const pages = document.pages || [];
                    for (const page of pages) {
                        fullStructuredMarkdown += `## Page ${page.pageNumber || 'Unknown'}\n\n`;
                        
                        // Grab raw text chunk for this page if possible
                        if (page.layout?.textAnchor) {
                             fullStructuredMarkdown += `### Raw Text:\n${cleanText(getText(page.layout.textAnchor, document.text)).substring(0, 1500)}...\n\n`;
                        }

                        if (page.formFields && page.formFields.length > 0) {
                            fullStructuredMarkdown += `### Key-Value Pairs\n`;
                            fullStructuredMarkdown += formFieldsToText(page.formFields, document.text);
                            fullStructuredMarkdown += `\n\n`;
                        }
                        if (page.tables && page.tables.length > 0) {
                            fullStructuredMarkdown += tablesToMarkdown(page.tables, document.text);
                        }
                    }
                }
            }

            logger.info(`Aggregated Markdown size: ${fullStructuredMarkdown.length} characters`);

            // STEP 3: Pass Aggregated Markdown to Gemini 2.0 Flash
            const model = getModel();
            const userParts = [
                { text: CIBIL_PROMPT },
                { text: `\\n--- EXTRACTED DOCUMENT TEXT ---\\n${fullStructuredMarkdown}` }
            ];

            logger.info(`Sending aggregated text to Gemini for reasoning...`);
            const geminiResult = await model.generateContent({
                contents: [{ role: "user", parts: userParts }]
            });

            const responseText = geminiResult.response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) throw new Error("Empty response from AI model.");

            // STEP 4: Parse and Validate
            let extractedJson;
            try {
                const cleaned = responseText.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
                extractedJson = JSON.parse(cleaned);
            } catch (err) {
                logger.error("JSON parse failure", { preview: responseText.substring(0, 500) });
                throw new Error("AI returned invalid JSON.");
            }

            const validatedData = validateCibilData(extractedJson);

            // STEP 5: Save to Firestore
            await reportRef.set({
                status: "completed",
                data: validatedData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            logger.info(`Successfully stored parsed data in Firestore for ${uuid}`);

        } catch (error: any) {
            logger.error(`Error in async pipeline for ${uuid}`, { error: error.message || error });
            await reportRef.set({
                status: "error",
                error: `Failed to process document: ${error.message || "Unknown Error"}`,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    }
);
