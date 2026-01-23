/**
 * PDF parser using pdfjs-dist for reliable serverless PDF text extraction
 * Works in Vercel/Node.js without DOM or canvas requirements
 */

// Use the legacy build which is better for Node.js/serverless environments
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface PdfParseResult {
    text: string;
    numPages: number;
    isLikelyScanned: boolean;
}

/**
 * Extract plain text from a PDF buffer
 * Uses pdfjs-dist legacy build for Node.js compatibility
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfParseResult> {
    try {
        console.info("[PDF Parser] Starting extraction", { bufferSize: buffer.length });

        if (!buffer || buffer.length === 0) {
            throw new Error("Invalid or empty PDF buffer");
        }

        // Convert Buffer to Uint8Array as required by pdf.js
        const uint8Array = new Uint8Array(buffer);

        // Load PDF with options optimized for serverless
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            disableFontFace: true,
            verbosity: 0,
            useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        console.info("[PDF Parser] PDF loaded", { numPages: pdf.numPages });

        let text = "";

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();

                // Extract text items
                const pageText = content.items
                    .filter((item: any) => item && typeof item === 'object' && 'str' in item)
                    .map((item: any) => item.str || "")
                    .filter((str: string) => str.trim().length > 0)
                    .join(" ");

                if (pageText.trim()) {
                    text += pageText + "\n";
                }
            } catch (pageErr: any) {
                console.warn(`[PDF Parser] Page ${pageNum} extraction error:`, pageErr?.message);
                // Continue with other pages
            }
        }

        // Clean up text
        const cleanedText = text
            .replace(/\u0000/g, "") // Remove null characters
            .replace(/\s+/g, " ")   // Normalize whitespace
            .trim();

        // Detect if this is likely a scanned PDF (has pages but little/no text)
        const isLikelyScanned = cleanedText.length < 50 && pdf.numPages > 0;

        console.info("[PDF Parser] Extraction complete", {
            totalChars: cleanedText.length,
            isLikelyScanned,
            preview: cleanedText.substring(0, 100) + "..."
        });

        return {
            text: cleanedText,
            numPages: pdf.numPages,
            isLikelyScanned,
        };

    } catch (error: any) {
        console.error("[PDF Parser] Error:", error?.message);
        throw error;
    }
}
