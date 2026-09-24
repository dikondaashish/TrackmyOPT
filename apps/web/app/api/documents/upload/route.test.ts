// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { uploadToS3, deleteFromS3 } from '@/lib/aws/s3';
import { analyzeDocument } from '@/lib/ai/gemini-ai';
import { checkDocumentUploadRateLimit } from '@/lib/auth/rate-limit';
import { scanFileForViruses } from '@/lib/aws/virus-scan';
import { POST } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/aws/s3', () => ({ uploadToS3: vi.fn(), deleteFromS3: vi.fn(), generateS3Key: () => 'documents/user-1/synthetic.pdf' }));
vi.mock('@/lib/ai/gemini-ai', () => ({ analyzeDocument: vi.fn(), normalizeText: (text: string) => text }));
vi.mock('@/lib/auth/rate-limit', () => ({ checkDocumentUploadRateLimit: vi.fn(), getTimeUntilReset: () => '24 hours' }));
vi.mock('@/lib/notifications/reminders', () => ({ generateRemindersForDocument: vi.fn() }));
vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: vi.fn() }));
vi.mock('@/lib/aws/virus-scan', async importOriginal => ({ ...await importOriginal<typeof import('@/lib/aws/virus-scan')>(), scanFileForViruses: vi.fn() }));

const analysis = { documentType: 'other', issueDate: null, expiryDate: null, extractedText: 'Synthetic', extractedFields: {}, confidence: 40, summary: 'Test document' };
function database({ user = true, premium = true, failInsert = false } = {}) {
  const insert = vi.fn().mockReturnValue({ select: () => ({ single: async () => ({ data: failInsert ? null : { id: 'doc-1', filename: 'sample.pdf', document_type: 'other' }, error: failInsert ? new Error('Database unavailable') : null }) }) });
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: user ? { id: 'user-1' } : null }, error: null }) },
    from: (table: string) => table === 'profiles'
      ? { select: () => ({ eq: () => ({ single: async () => ({ data: { premium_status: premium }, error: null }) }) }) }
      : { insert },
  } as never);
  return insert;
}
function request(content = '%PDF-1.4\nSynthetic', filename = 'sample.pdf') {
  const form = new FormData();
  form.append('file', new File([content], filename, { type: 'application/pdf' }));
  return new NextRequest('https://example.com/api/documents/upload', { method: 'POST', body: form });
}

beforeEach(() => {
  vi.clearAllMocks();
  database();
  vi.mocked(checkDocumentUploadRateLimit).mockResolvedValue({ allowed: true, remaining: 19, resetAt: new Date('2030-01-01') });
  vi.mocked(scanFileForViruses).mockResolvedValue({ safe: true, scanTime: 1, scanner: 'test' });
  vi.mocked(analyzeDocument).mockResolvedValue(analysis as never);
});

describe('document upload pipeline', () => {
  it.each([{ user: false, expected: 401 }, { premium: false, expected: 403 }])('rejects unavailable account access: $expected', async options => {
    database(options);
    expect((await POST(request())).status).toBe(options.expected);
    expect(uploadToS3).not.toHaveBeenCalled();
  });
  it('rejects uploads after the daily limit before sending a file to storage', async () => {
    vi.mocked(checkDocumentUploadRateLimit).mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date('2030-01-01') });
    expect((await POST(request())).status).toBe(429);
    expect(uploadToS3).not.toHaveBeenCalled();
  });
  it.each([['not a PDF', 'sample.pdf'], ['%PDF-1.4', 'sample.jpg'], ['', 'sample.pdf']])('rejects mismatched or empty file content', async (content, filename) => {
    expect((await POST(request(content, filename))).status).toBe(400);
    expect(uploadToS3).not.toHaveBeenCalled();
  });
  it('fails closed when the malware scanner is unavailable', async () => {
    vi.mocked(scanFileForViruses).mockResolvedValue({ safe: false, unavailable: true, scanTime: 1, scanner: 'test' });
    expect((await POST(request())).status).toBe(503);
    expect(uploadToS3).not.toHaveBeenCalled();
    expect(analyzeDocument).not.toHaveBeenCalled();
  });
  it('saves an owned document and asks the user to review uncertain analysis', async () => {
    const insert = database();
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', file_type: 'application/pdf', filename: 'sample.pdf' }));
    expect(await response.json()).toMatchObject({ success: true, needsManualExpiry: true, document: { id: 'doc-1' } });
  });
  it('cleans up storage if the database cannot save the document', async () => {
    database({ failInsert: true });
    expect((await POST(request())).status).toBe(500);
    expect(deleteFromS3).toHaveBeenCalledWith('documents/user-1/synthetic.pdf');
  });
});
