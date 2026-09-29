// @vitest-environment node
import type { SupabaseClient } from '@supabase/supabase-js';
import { expect, it, vi } from 'vitest';
import { listEmailCampaigns } from './campaign-reports';
it('includes campaigns beyond the default database page size', async () => {
  const campaigns = Array.from({ length: 1001 }, (_, i) => ({
    id: `test-${i}`,
    subject: 'Synthetic campaign',
    created_at: '2026-09-29',
  }));
  const range = vi
    .fn()
    .mockResolvedValueOnce({ data: campaigns.slice(0, 1000), error: null })
    .mockResolvedValueOnce({ data: campaigns.slice(1000), error: null });
  const q = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range,
  };
  expect(
    await listEmailCampaigns({ from: () => q } as unknown as SupabaseClient)
  ).toHaveLength(1001);
  expect(range).toHaveBeenNthCalledWith(2, 1000, 1999);
});
