// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createCampaignToken } from '@/lib/notifications/campaign-tracking';
import { GET as open, HEAD as openHead } from './open/route';
import { GET as click, HEAD as clickHead } from './click/route';
import { GET as metrics } from '../../admin/email-campaigns/route';

const m = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn(), client: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: m.client }));
const messageId = '12345678-1234-4123-8123-123456789012';
function request(kind: 'open' | 'click', headers?: Record<string, string>) {
  const token = createCampaignToken({ messageId, kind, linkKey: kind === 'click' ? 'pro_intro' : '', expiresAt: Date.now() + 60000 }, 'test-secret');
  return new NextRequest(`https://www.trackmyopt.com/api/notifications/campaign/${kind}?token=${token}`, { headers });
}
function query(data: object) {
  return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data, error: null }) };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', 'test-secret');
  vi.stubEnv('ADMIN_SECRET', 'admin-secret');
  m.client.mockReturnValue(m);
  m.rpc.mockResolvedValue({ data: true, error: null });
});
afterEach(() => vi.unstubAllEnvs());

describe('public campaign events', () => {
  it('returns a non-cached pixel and records only a valid open token', async () => {
    const response = await open(request('open', { 'user-agent': 'Mozilla/5.0' }));
    expect(response.headers.get('content-type')).toBe('image/gif');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(m.rpc).toHaveBeenCalledWith('record_email_campaign_event', { p_message_id: messageId, p_event_type: 'open', p_link_key: '', p_known_automated: false });
    m.rpc.mockClear();
    const invalid = await open(new NextRequest('https://www.trackmyopt.com/api/notifications/campaign/open?token=invalid'));
    expect(Buffer.from(await invalid.arrayBuffer())).toEqual(Buffer.from(await response.arrayBuffer()));
    await open(request('click'));
    await openHead();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it('never uses a supplied redirect URL when a signature is invalid', async () => {
    const result = await click(new NextRequest('https://www.trackmyopt.com/api/notifications/campaign/click?token=invalid&url=https://evil.test'));
    expect(result.headers.get('location')).toBe('https://www.trackmyopt.com/');
    expect(m.client).not.toHaveBeenCalled();
    await clickHead();
    expect(m.rpc).not.toHaveBeenCalled();
  });
  it.each(['sent', 'campaign_unknown'])('redirects a valid CTA with %s status even if analytics fails', async status => {
    m.from.mockReturnValueOnce(query({ email_data: { campaign_id: 'campaign' }, status })).mockReturnValueOnce(query({ tracked_links: { pro_intro: 'https://www.trackmyopt.com/pricing' } }));
    m.rpc.mockResolvedValue({ error: { message: 'unavailable' } });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const result = await click(request('click', { 'user-agent': 'Proofpoint scanner' }));
      expect(result.status).toBe(302);
      expect(result.headers.get('location')).toBe('https://www.trackmyopt.com/pricing');
      expect(result.headers.get('cache-control')).toContain('no-store');
      expect(result.headers.get('referrer-policy')).toBe('no-referrer');
      expect(m.rpc).toHaveBeenCalledWith('record_email_campaign_event', expect.objectContaining({ p_known_automated: true, p_link_key: 'pro_intro' }));
    } finally { log.mockRestore(); }
  });
  it('rejects an unsafe destination stored in a campaign', async () => {
    m.from.mockReturnValueOnce(query({ email_data: { campaign_id: 'campaign' }, status: 'sent' })).mockReturnValueOnce(query({ tracked_links: { pro_intro: 'https://evil.test' } }));
    expect((await click(request('click'))).headers.get('location')).toBe('https://www.trackmyopt.com/');
    expect(m.rpc).not.toHaveBeenCalled();
  });
});

describe('private campaign report', () => {
  it('requires admin authorization before accessing metrics', async () => {
    expect((await metrics(new NextRequest('https://www.trackmyopt.com/api/admin/email-campaigns?id=campaign'))).status).toBe(401);
    expect(m.client).not.toHaveBeenCalled();
  });
  it('returns an aggregate without caching and rejects invalid IDs', async () => {
    m.rpc.mockResolvedValue({ data: { sent: 10, observedOpens: 4, links: [] }, error: null });
    const headers = { authorization: 'Bearer admin-secret' };
    const response = await metrics(new NextRequest('https://www.trackmyopt.com/api/admin/email-campaigns?id=campaign', { headers }));
    expect(await response.json()).toEqual({ sent: 10, observedOpens: 4, links: [] });
    expect(response.headers.get('cache-control')).toContain('no-store');
    m.rpc.mockClear();
    expect((await metrics(new NextRequest('https://www.trackmyopt.com/api/admin/email-campaigns?id=../invalid', { headers }))).status).toBe(400);
    expect(m.rpc).not.toHaveBeenCalled();
  });
});
