import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  detectDocumentMimeType,
  hasMatchingDocumentExtension,
  scanFileForViruses,
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

describe('scanFileForViruses retries (TRACKMYOPT-3B)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  const scan = () =>
    scanFileForViruses(Buffer.from('%PDF-1.4'), 'a.pdf', 'application/pdf');
  const ok = () =>
    new Response(JSON.stringify({ safe: true }), { status: 200 });

  function setup(...replies: Array<Response | Error>) {
    vi.stubEnv('MALWARE_SCAN_URL', 'https://scanner.example.com/scan');
    const fetchMock = vi.fn(async () => {
      const next = replies.shift()!;
      if (next instanceof Error) throw next;
      return next;
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('retries once after a dropped connection or a 503', async () => {
    let fetchMock = setup(new TypeError('fetch failed'), ok());
    expect(await scan()).toMatchObject({ safe: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock = setup(new Response('', { status: 503 }), ok());
    expect(await scan()).toMatchObject({ safe: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a static reason when both attempts fail', async () => {
    setup(new Response('', { status: 503 }), new Response('', { status: 503 }));
    expect(await scan()).toMatchObject({
      safe: false,
      unavailable: true,
      scanner: 'scanner-http-503',
    });
    setup(new TypeError('fetch failed'), new TypeError('fetch failed'));
    expect(await scan()).toMatchObject({ scanner: 'scanner-network' });
  });

  it('does not retry a client error', async () => {
    const fetchMock = setup(new Response('', { status: 401 }));
    expect(await scan()).toMatchObject({ scanner: 'scanner-http-401' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
