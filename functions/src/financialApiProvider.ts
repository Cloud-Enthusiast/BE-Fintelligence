import axios from "axios";
import FormData from "form-data";
import { logger } from "firebase-functions/v2";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Sends a CIBIL PDF to the Azapi.ai CIBIL Consumer OCR API and returns the parsed JSON.
 */
export const parseCibilWithAzapi = async (
    fileBase64: string,
    mimeType: string,
    apiKey: string
): Promise<any> => {
    // 1. Prepare the exact endpoint and headers
    const API_ENDPOINT = "https://api.azapi.ai/api/v1/ocr/cibil-consumer"; // Best guess path as per standard schema, if it fails backend will log 404
    
    // 2. Convert base64 to buffer for FormData
    const fileBuffer = Buffer.from(fileBase64, "base64");
    
    // 3. Prepare FormData
    const form = new FormData();
    // Use an arbitrary filename since it's from base64
    const filename = mimeType === "application/pdf" ? "document.pdf" : "document.png";
    form.append("file", fileBuffer, {
        filename,
        contentType: mimeType,
    });

    logger.info("Sending document to Azapi.ai", { 
        endpoint: API_ENDPOINT,
        fileSize: fileBuffer.length,
        mimeType
    });

    try {
        const response = await axios.post(API_ENDPOINT, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: apiKey, // Azapi uses "prod-key" or "sand-key" directly in Authorization header
            },
            // Azapi might take up to 60s for large PDFs
            timeout: 90000, 
        });

        if (response.data && response.data.status === "success") {
            logger.info("Azapi parsing successful");
            return response.data.data;
        } else {
            // Handle cases where response is HTTP 200 but status is failed/error
            logger.error("Azapi API returned logical error", { response: response.data });
            throw new HttpsError("internal", "Financial API failed to parse document");
        }
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            logger.error("Azapi API Network Error", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new HttpsError("internal", `Financial API Error: ${error.response?.data?.message || error.message}`);
        }
        throw new HttpsError("internal", "Unknown error while calling Financial API");
    }
};
