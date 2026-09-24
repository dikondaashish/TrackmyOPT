import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { deleteManyFromS3 } from '@/lib/aws/s3';
import { POST } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/aws/s3', () => ({ deleteManyFromS3: vi.fn() }));
vi.mock('@/lib/auth/passcode', () => ({
  hashPasscode: vi.fn().mockResolvedValue('new-hash'),
  isValidPasscode: (value: string) => /^\d{6}$/.test(value),
}));
vi.mock('bcryptjs', () => ({ default: { compare: vi.fn().mockResolvedValue(true) } }));

function request() {
  return new NextRequest('https://www.trackmyopt.com/api/documents/passcode/forgot/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ otp: '123456', newPasscode: '654321' }),
  });
}

describe('POST /api/documents/passcode/forgot/verify-otp', () => {
  const removeDocuments = vi.fn();
  const updatePasscode = vi.fn();
  let vaultKeys: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    vaultKeys = ['vault/file-1'];
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    removeDocuments.mockResolvedValue({ error: null });
    updatePasscode.mockResolvedValue({ error: null });
    vi.mocked(deleteManyFromS3).mockResolvedValue();
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
      from: (table: string) => {
        if (table === 'passcode_otps') return {
          select: () => ({ eq: () => ({ single: async () => ({ data: {
            purpose: 'reset', otp_hash: 'otp-hash', expires_at: '2099-01-01', attempts: 0, locked_until: null,
          }, error: null }) }) }),
          delete: () => ({ eq: async () => ({ error: null }) }),
        };
        if (table === 'documents') return {
          select: () => ({ eq: () => ({ order: () => ({ range: async (start: number, end: number) => ({
            data: vaultKeys.slice(start, end + 1).map(s3_key => ({ s3_key })),
            count: vaultKeys.length,
            error: null,
          }) }) }) }),
          delete: () => ({ eq: removeDocuments }),
        };
        if (table === 'document_reminders') return { delete: () => ({ eq: async () => ({ error: null }) }) };
        if (table === 'document_passcodes') return { upsert: updatePasscode };
        throw new Error(`Unexpected table: ${table}`);
      },
    } as never);
  });

  it('removes stored files and records before completing reset', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(deleteManyFromS3).toHaveBeenCalledWith(['vault/file-1']);
    expect(removeDocuments).toHaveBeenCalled();
    expect(updatePasscode).toHaveBeenCalled();
    expect(vi.mocked(deleteManyFromS3).mock.invocationCallOrder[0]).toBeLessThan(removeDocuments.mock.invocationCallOrder[0]);
  });

  it('keeps the database records and old passcode if storage deletion fails', async () => {
    vi.mocked(deleteManyFromS3).mockRejectedValueOnce(new Error('S3 unavailable'));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(removeDocuments).not.toHaveBeenCalled();
    expect(updatePasscode).not.toHaveBeenCalled();
  });

  it('collects every page before removing a large vault', async () => {
    vaultKeys = Array.from({ length: 1001 }, (_, index) => `vault/file-${index}`);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(deleteManyFromS3).toHaveBeenCalledWith(vaultKeys);
  });
});
