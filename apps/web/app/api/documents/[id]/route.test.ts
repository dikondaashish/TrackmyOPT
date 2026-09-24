import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { PATCH } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

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
