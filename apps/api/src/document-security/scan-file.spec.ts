import { detectAllowedDocumentType, scanUploadBytes } from './scan-file';

describe('scanUploadBytes', () => {
  it('allows a PDF signature', () => {
    expect(scanUploadBytes(Buffer.from('%PDF-1.7\n'), 'ead.pdf')).toEqual({
      safe: true,
    });
    expect(detectAllowedDocumentType(Buffer.from('%PDF-1.7\n'))).toBe(
      'application/pdf',
    );
  });

  it('rejects an executable disguised as a PDF', () => {
    expect(scanUploadBytes(Buffer.from('MZ\0\0'), 'ead.pdf')).toEqual({
      safe: false,
      threat: 'windows-executable',
    });
  });

  it('rejects zip archives', () => {
    expect(
      scanUploadBytes(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]), 'ead.zip'),
    ).toEqual({ safe: false, threat: 'blocked-extension' });
  });
});
