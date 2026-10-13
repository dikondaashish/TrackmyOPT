import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  acquireUSCISRequest,
  deferUSCISRequests,
  providerRetryAfter,
} from './request-governor';
it('fails closed on datastore errors without allowing an upstream request', async () => {
  const rpc = vi.fn().mockResolvedValue({ error: { message: 'private' } });
  await expect(
    acquireUSCISRequest({ rpc } as unknown as SupabaseClient, 'production')
  ).rejects.toThrow('governor unavailable');
  expect(rpc).toHaveBeenCalledTimes(1);
});
it('propagates a long shared cooldown without sleeping past the request budget', async () => {
  const rpc = vi
    .fn()
    .mockResolvedValue({ data: { allowed: false, retry_after_ms: 60000 } });
  await expect(
    acquireUSCISRequest({ rpc } as unknown as SupabaseClient, 'production')
  ).rejects.toMatchObject({ retryAfter: 60 });
});
it('persists provider Retry-After so worker and manual traffic respect it', async () => {
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const response = new Response(null, {
    status: 429,
    headers: { 'Retry-After': '120' },
  });
  await deferUSCISRequests(
    { rpc } as unknown as SupabaseClient,
    'production',
    providerRetryAfter(response)
  );
  expect(rpc).toHaveBeenCalledWith('defer_uscis_requests', {
    p_environment: 'production',
    p_seconds: 120,
  });
});
