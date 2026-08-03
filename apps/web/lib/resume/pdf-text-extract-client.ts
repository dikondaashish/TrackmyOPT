/**
 * Client-side PDF text extraction smoke test (ATS parse risk).
 * Uses pdfjs-dist legacy build for browser compatibility.
 */

interface PdfParseResult {
    ok: boolean;
    charCount: number;
    containsName: boolean;
    warning?: string;
}

const MIN_CHARS = 500;

export async function extractPdfTextFromBlob(
    blob: Blob,
    expectedName?: string
): Promise<PdfParseResult> {
    try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/legacy/build/pdf.worker.mjs",
            import.meta.url
        ).toString();

        const buffer = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buffer }).promise;
        const pages: string[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item) => ("str" in item ? item.str : ""))
                .join(" ");
            pages.push(pageText);
        }

        const fullText = pages.join("\n").replace(/\s+/g, " ").trim();
        const charCount = fullText.length;

        let containsName = true;
        if (expectedName?.trim()) {
            const first = expectedName.trim().split(/\s+/)[0];
            containsName = first.length > 1 && fullText.toLowerCase().includes(first.toLowerCase());
        }

        const ok = charCount >= MIN_CHARS && containsName;

        return {
            ok,
            charCount,
            containsName,
            warning: ok
                ? undefined
                : charCount < MIN_CHARS
                  ? `Extracted only ${charCount} characters — ATS may fail to parse`
                  : "Candidate name not found in PDF text",
        };
    } catch {
        return {
            ok: false,
            charCount: 0,
            containsName: false,
            warning: "Could not extract text from PDF",
        };
    }
}
