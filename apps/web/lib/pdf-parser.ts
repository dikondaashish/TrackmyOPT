import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Extract plain text and basic stats from a PDF buffer using PDF.js.
 * This is more robust than pdf-parse for complex layouts.
 */
export async function extractPdfText(buffer: Buffer) {
    try {
        console.log("📄 PDFJS: Starting extraction...", { size: buffer.length });

        if (!buffer || buffer.length === 0) {
            throw new Error("Invalid or empty PDF buffer");
        }

        // Load the PDF from in-memory buffer
        const uint8Array = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            disableFontFace: true,
            verbosity: 0,
            useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        console.log("📄 PDFJS: Document loaded", { pages: pdf.numPages });

        let text = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();

                const pageText = content.items
                    .filter((item: any) => item && typeof item === 'object' && 'str' in item)
                    .map((item: any) => item.str || "")
                    .filter(str => str.trim().length > 0)
                    .join(" ");

                if (pageText.trim()) {
                    text += pageText + "\n";
                }
            } catch (pageErr: any) {
                console.warn(`⚠️ PDFJS: Page ${pageNum} error:`, pageErr.message);
            }
        }

        const cleaned = text.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
        const isLikelyScanned = cleaned.length < 50 && pdf.numPages > 0;

        console.log("📄 PDFJS: Finished", {
            length: cleaned.length,
            scanned: isLikelyScanned
        });

        return {
            text: cleaned,
            numPages: pdf.numPages,
            isLikelyScanned,
        };
    } catch (err: any) {
        console.error("❌ PDFJS: Load error:", err);
        throw err;
    }
}
