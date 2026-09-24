import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { deleteFromS3, generateSignedUrl } from '@/lib/aws/s3';
import { DELETE, GET, PATCH } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/aws/s3', () => ({ deleteFromS3: vi.fn(), generateSignedUrl: vi.fn() }));
vi.mock('@/lib/notifications/reminders', () => ({ generateRemindersForDocument: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('owned document preview and deletion', () => {
  function database({ user = true, found = true, dbError = false } = {}) {
    const eq = vi.fn().mockReturnThis();
    const builder = { select: vi.fn().mockReturnThis(), eq, single: vi.fn().mockResolvedValue({ data: found ? { id: 'doc-1', s3_key: 'documents/user-1/sample.png', filename: 'Sample.png', file_type: 'image/png' } : null, error: null }) };
    const deleteEq = vi.fn();
    deleteEq.mockReturnValueOnce({ eq: deleteEq }).mockResolvedValueOnce({ error: dbError ? new Error('Database unavailable') : null });
    const remove = vi.fn().mockReturnValue({ eq: deleteEq });
    vi.mocked(createClient).mockResolvedValue({ auth: { getUser: async () => ({ data: { user: user ? { id: 'user-1' } : null }, error: null }) }, from: () => ({ ...builder, delete: remove }) } as never);
    return { eq, remove, deleteEq };
  }
  const request = () => new NextRequest('https://example.com/api/documents/doc-1');
  const context = { params: Promise.resolve({ id: 'doc-1' }) };

  it('previews only the signed-in user’s document', async () => {
    const { eq } = database();
    vi.mocked(generateSignedUrl).mockResolvedValue('https://storage.example.com/signed');
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect((await response.json()).document.viewUrl).toBe('https://storage.example.com/signed');
  });

  it('refuses unauthenticated deletion before accessing storage', async () => {
    const { remove } = database({ user: false });
    expect((await DELETE(request(), context)).status).toBe(401);
    expect(deleteFromS3).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not delete another user’s or missing document', async () => {
    const { eq, remove } = database({ found: false });
    expect((await DELETE(request(), context)).status).toBe(404);
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(deleteFromS3).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('keeps the database record when storage deletion fails', async () => {
    const { remove } = database();
    vi.mocked(deleteFromS3).mockRejectedValueOnce(new Error('Storage unavailable'));
    expect((await DELETE(request(), context)).status).toBe(502);
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes the owned record only after storage confirms deletion', async () => {
    const { remove, deleteEq } = database();
    vi.mocked(deleteFromS3).mockResolvedValueOnce(undefined);
    expect((await DELETE(request(), context)).status).toBe(200);
    expect(deleteFromS3).toHaveBeenCalledWith('documents/user-1/sample.png');
    expect(remove).toHaveBeenCalledOnce();
    expect(deleteEq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('does not report success when the database deletion fails', async () => {
    database({ dbError: true });
    vi.mocked(deleteFromS3).mockResolvedValueOnce(undefined);
    expect((await DELETE(request(), context)).status).toBe(500);
  });
});

describe('PATCH /api/documents/[id]', () => {
  it('clears an expiry date and its scheduled reminders', async () => {
    const update = vi.fn();
    const deleteReminders = vi.fn();
    update.mockReturnValue({
      eq: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'doc-1' }, error: null }) }) }) }),
    });
    deleteReminders.mockReturnValue({
      eq: () => ({ eq: async () => ({ error: null }) }),
    });
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
      from: (table: string) => table === 'documents' ? { update } : { delete: deleteReminders },
    } as never);

    const response = await PATCH(new NextRequest('https://www.trackmyopt.com/api/documents/doc-1', {
      method: 'PATCH',
      body: JSON.stringify({ expiryDate: null }),
    }), { params: Promise.resolve({ id: 'doc-1' }) });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ expiry_date: null });
    expect(deleteReminders).toHaveBeenCalledOnce();
  });
});
