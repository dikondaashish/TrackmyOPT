/**
 * Document malware scanning and content-signature validation.
 *
 * Production uploads are deliberately fail-closed. Configure MALWARE_SCAN_URL
 * to a private scanning service that accepts multipart `file` uploads and
 * responds with `{ safe: boolean, threat?: string }`.
 */

export type SafeDocumentMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

interface VirusScanResult {
  safe: boolean;
  unavailable?: boolean;
  threat?: string;
  scanTime: number;
  scanner: string;
}

const SCAN_TIMEOUT_MS = 30_000;

function unavailable(startTime: number, scanner: string): VirusScanResult {
  return {
    safe: false,
    unavailable: true,
    scanner,
    scanTime: Date.now() - startTime,
  };
}

function normalizeDocumentMimeType(value: string): SafeDocumentMimeType | null {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'application/pdf') return 'application/pdf';
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'image/jpeg';
  if (normalized === 'image/png') return 'image/png';
  if (normalized === 'image/webp') return 'image/webp';
  return null;
}

/** Determine the actual type from the bytes, never the browser supplied MIME. */
export function detectDocumentMimeType(buffer: Buffer): SafeDocumentMimeType | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export function isValidDocumentType(contentType: string): boolean {
  return normalizeDocumentMimeType(contentType) !== null;
}

export function hasMatchingDocumentExtension(
  filename: string,
  contentType: SafeDocumentMimeType,
): boolean {
  const extension = filename.toLowerCase().trim().split('.').pop();
  const expected = {
    'application/pdf': ['pdf'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
  }[contentType];
  return extension != null && expected.includes(extension);
}

/**
 * Scan an upload through the configured private malware-scanning service.
 * Local development may opt out explicitly; production never may.
 */
export async function scanFileForViruses(
  fileBuffer: Buffer,
  filename: string,
  contentType: SafeDocumentMimeType,
): Promise<VirusScanResult> {
  const startTime = Date.now();

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.DOCUMENT_SCAN_MODE === 'disabled'
  ) {
    return { safe: true, scanner: 'development-disabled', scanTime: Date.now() - startTime };
  }

  const endpoint = process.env.MALWARE_SCAN_URL?.trim();
  if (!endpoint) return unavailable(startTime, 'not-configured');

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return unavailable(startTime, 'invalid-configuration');
  }
  if (url.protocol !== 'https:') return unavailable(startTime, 'invalid-configuration');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);
  try {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(fileBuffer)], { type: contentType }),
      filename,
    );
    const token = process.env.MALWARE_SCAN_TOKEN?.trim();
    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) return unavailable(startTime, 'scanner-unavailable');

    const result: unknown = await response.json();
    if (
      typeof result !== 'object' ||
      result === null ||
      !('safe' in result) ||
      typeof result.safe !== 'boolean'
    ) {
      return unavailable(startTime, 'invalid-scanner-response');
    }

    return {
      safe: result.safe,
      threat:
        'threat' in result && typeof result.threat === 'string'
          ? result.threat.slice(0, 200)
          : undefined,
      scanner: 'private-malware-scanner',
      scanTime: Date.now() - startTime,
    };
  } catch {
    return unavailable(startTime, 'scanner-unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

/** Reject executable/archive extensions before any upload or scanner call. */
export function checkSuspiciousFileType(filename: string, mimeType: string): boolean {
  const suspiciousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.zip', '.rar', '.7z',
  ];
  const normalizedName = filename.toLowerCase().trim();
  const extension = normalizedName.includes('.')
    ? normalizedName.slice(normalizedName.lastIndexOf('.'))
    : '';
  if (suspiciousExtensions.includes(extension)) return true;

  return [
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-sh',
  ].includes(mimeType.toLowerCase());
}
