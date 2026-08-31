/**
 * Scan an upload for the Document Vault allowlist.
 *
 * Always-on check: magic-byte type + reject executables/archives.
 * If `clamscan` is on PATH (Dockerfile), that runs next.
 *
 * ponytail: heuristic gate is O(header bytes). ClamAV is the upgrade when
 * virus definitions are installed on the Render image.
 */

export type ScanResult = { safe: true } | { safe: false; threat: string };

const MAX_BYTES = 10 * 1024 * 1024;
const EXECUTABLE_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.zip',
  '.rar',
  '.7z',
  '.sh',
];

function hasPrefix(buffer: Buffer, prefix: number[] | Buffer): boolean {
  const expected = Buffer.isBuffer(prefix) ? prefix : Buffer.from(prefix);
  return (
    buffer.length >= expected.length &&
    buffer.subarray(0, expected.length).equals(expected)
  );
}

export function detectAllowedDocumentType(
  buffer: Buffer,
): 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (hasPrefix(buffer, Buffer.from('%PDF-'))) return 'application/pdf';
  if (hasPrefix(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (
    hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
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

function looksLikeExecutable(buffer: Buffer): string | null {
  if (hasPrefix(buffer, Buffer.from('MZ'))) return 'windows-executable';
  if (hasPrefix(buffer, [0x7f, 0x45, 0x4c, 0x46])) return 'elf-executable';
  if (
    hasPrefix(buffer, [0xfe, 0xed, 0xfa, 0xce]) ||
    hasPrefix(buffer, [0xfe, 0xed, 0xfa, 0xcf]) ||
    hasPrefix(buffer, [0xca, 0xfe, 0xba, 0xbe])
  ) {
    return 'mach-o-executable';
  }
  if (hasPrefix(buffer, [0x50, 0x4b, 0x03, 0x04])) return 'zip-archive';
  if (hasPrefix(buffer, Buffer.from('Rar!'))) return 'rar-archive';
  return null;
}

function extensionOf(filename: string): string {
  const name = filename.toLowerCase().trim();
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot) : '';
}

export function scanUploadBytes(
  buffer: Buffer,
  filename: string,
): ScanResult {
  if (!buffer.length) return { safe: false, threat: 'empty-file' };
  if (buffer.length > MAX_BYTES) return { safe: false, threat: 'too-large' };

  const ext = extensionOf(filename);
  if (EXECUTABLE_EXTENSIONS.includes(ext)) {
    return { safe: false, threat: 'blocked-extension' };
  }

  const executable = looksLikeExecutable(buffer);
  if (executable) return { safe: false, threat: executable };

  if (!detectAllowedDocumentType(buffer)) {
    return { safe: false, threat: 'unrecognized-document' };
  }

  return { safe: true };
}
