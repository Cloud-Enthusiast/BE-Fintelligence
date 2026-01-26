/**
 * AI Document Parser Service
 * Uses Gemini AI to extract structured data from raw document text.
 * Enterprise-ready: Handles complex financial reports with context-awareness.
 */

import { MSMEDocumentType, ExtractedMSMEData } from '@/types/msmeDocuments';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export interface AIParseResult {
    data: any;
    confidence: 'high' | 'medium' | 'low';
    analysis: string;
}

export const parseDocumentWithAI = async (
    type: MSMEDocumentType,
    rawText: string
): Promise<AIParseResult> => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Please check your .env file.');
    }

    const prompt = getPromptForType(type, rawText);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    response_mime_type: "application/json",
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'AI extraction failed');
        }

        const result = await response.json();
        const jsonResponse = JSON.parse(result.candidates[0].content.parts[0].text);

        return {
            data: jsonResponse.data,
            confidence: jsonResponse.confidence || 'medium',
            analysis: jsonResponse.analysis || 'Analysis completed by AI engine.'
        };
    } catch (error) {
        console.error('AI Parse Error:', error);
        throw error;
    }
};

const getPromptForType = (type: MSMEDocumentType, text: string): string => {
    const baseInstructions = `
    You are an expert financial analyst. Extract the following information from the provided text of a ${type}.
    Return the result strictly as a JSON object with the following structure:
    {
      "data": { ...field values... },
      "confidence": "high" | "medium" | "low",
      "analysis": "A brief summary of key findings (e.g., defaults, trends)"
    }
  `;

    switch (type) {
        case 'cibil_report':
            return `
        ${baseInstructions}
        Extract:
        - creditScore (number)
        - activeLoans (number)
        - defaults (number of default accounts)
        - overdueAmount (total overdue amount in INR)
        - suitFiled (boolean - true if "Suit Filed" or "Wilful Default" mention found)
        - wilfulDefault (boolean)
        - writtenOffAccounts (number)
        - paymentHistoryGood (boolean)
        - panNumber (string)
        - reportDate (string)
        - dpdStrings (array of strings found in payment history resembling '000', '030', 'XXX', 'STD', 'SUB', 'DBT')
        
        CRITICAL: 
        1. Identify "Suit Filed" OR "Wilful Default".
        2. Look for "DPD" (Days Past Due) matrix. valid values like 000, 055, 900.
        3. Look for "Written Off" or "Settled".
        
        Text: ${text.slice(0, 300000)}
      `;
        case 'bank_statement':
            return `
        ${baseInstructions}
        Extract:
        - averageMonthlyBalance (INR)
        - totalCredits (INR)
        - totalDebits (INR)
        - chequeBounces (number of occurrences)
        - accountNumber (string)
        - bankName (string)
        - cashFlowPattern (string: 'positive', 'negative', 'mixed')
        
        CRITICAL: Count all instances of 'CHQ RTN', 'Dishonour', 'Stop Payment' or similar bounce indicators.
        
        Text: ${text.slice(0, 10000)}
      `;
        default:
            return `${baseInstructions}\nText: ${text.slice(0, 10000)}`;
    }
};
