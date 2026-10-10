/**
 * Pure helpers for the side panel's "Upload résumé" affordance.
 *
 * Kept dependency-free (no chrome.*, no jsdom-only APIs beyond ArrayBuffer) so
 * the validation and encoding logic can be unit tested directly. sidepanel.ts
 * wires these into the file input and the UPLOAD_RESUME_FILE message that
 * background.ts forwards to the website's own upload endpoint — no PDF/DOCX
 * parsing or OCR is implemented here or anywhere in the extension.
 */

export const SUPPORTED_RESUME_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;

/** Mirrors the 10MB cap enforced server-side in api/resume-generator/upload. */
export const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function isSupportedResumeFileName(filename: string): boolean {
    const lower = filename.trim().toLowerCase();
    return SUPPORTED_RESUME_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function describeUnsupportedResumeFile(filename: string): string {
    return `"${filename}" is not a supported format. Upload a PDF, DOCX, or TXT file.`;
}

export function isResumeFileSizeAllowed(sizeBytes: number): boolean {
    return sizeBytes > 0 && sizeBytes <= MAX_RESUME_FILE_SIZE_BYTES;
}

export function describeOversizedResumeFile(sizeBytes: number): string {
    const megabytes = (sizeBytes / (1024 * 1024)).toFixed(1);
    return `That file is ${megabytes}MB. The maximum is 10MB.`;
}

/** ArrayBuffer -> base64, chunked to avoid call-stack limits on large files. */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

/** base64 -> Uint8Array, the inverse of arrayBufferToBase64. */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
