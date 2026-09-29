// @vitest-environment node
import type { SupabaseClient } from '@supabase/supabase-js';
import { expect, it, vi } from 'vitest';
import { filterRapidMultiLinkClicks, listEmailCampaigns } from './campaign-reports';

it('separates rapid dual-link scans from the raw click totals', () => {
  const report = { campaignId: 'test', subject: 'Test', sent: 3, failed: 0,
    needsReview: 0, observedOpens: 3, recordedClickers: 3, knownAutomatedRequests: 0,
    links: [
      { key: 'pro_intro', url: 'https://www.trackmyopt.com/pricing', clickers: 2, knownAutomatedClickers: 0 },
      { key: 'free_dashboard', url: 'https://www.trackmyopt.com/dashboard', clickers: 3, knownAutomatedClickers: 0 },
    ] };
  const events = [
    { message_id: 'scanner', link_key: 'pro_intro', first_seen_at: '2026-09-29T18:00:00Z' },
    { message_id: 'scanner', link_key: 'free_dashboard', first_seen_at: '2026-09-29T18:00:01Z' },
    { message_id: 'reader', link_key: 'pro_intro', first_seen_at: '2026-09-29T18:00:00Z' },
    { message_id: 'reader', link_key: 'free_dashboard', first_seen_at: '2026-09-29T18:01:00Z' },
    { message_id: 'free', link_key: 'free_dashboard', first_seen_at: '2026-09-29T18:00:00Z' },
  ];
  expect(filterRapidMultiLinkClicks(report, events)).toMatchObject({
    recordedClickers: 3, rapidMultiLinkClickers: 1, clickersAfterRapidLinkFilter: 2,
    links: [{ clickers: 2, clickersAfterRapidLinkFilter: 1 },
      { clickers: 3, clickersAfterRapidLinkFilter: 2 }],
  });
});
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
