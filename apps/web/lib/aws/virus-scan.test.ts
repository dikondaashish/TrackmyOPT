import { describe, expect, it } from 'vitest';
import {
  detectDocumentMimeType,
  hasMatchingDocumentExtension,
} from './virus-scan';

describe('document content validation', () => {
  it.each([
    ['PDF', Buffer.from('%PDF-1.7\n'), 'application/pdf'],
    ['JPEG', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg'],
    ['PNG', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png'],
    ['WebP', Buffer.from('RIFF0000WEBPVP8 ', 'ascii'), 'image/webp'],
  ] as const)('recognizes %s bytes', (_name, bytes, expected) => {
    expect(detectDocumentMimeType(bytes)).toBe(expected);
  });

  it('rejects a browser MIME type without a valid document signature', () => {
    expect(detectDocumentMimeType(Buffer.from('not a pdf'))).toBeNull();
  });

  it('requires the filename extension to match the detected content', () => {
    expect(hasMatchingDocumentExtension('case-notice.pdf', 'application/pdf')).toBe(true);
    expect(hasMatchingDocumentExtension('case-notice.jpg', 'application/pdf')).toBe(false);
  });
});
