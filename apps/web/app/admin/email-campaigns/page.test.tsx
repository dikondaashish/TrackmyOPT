import { beforeEach, expect, it, vi } from 'vitest';
import EmailCampaignsPage from './page';
const m = vi.hoisted(() => ({ admin: vi.fn(), client: vi.fn() }));
vi.mock('@/lib/auth/email-campaign-admin', () => ({
  getEmailCampaignAdmin: m.admin,
}));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: m.client }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
beforeEach(() => vi.clearAllMocks());
it.each(['signed_out', 'forbidden'])(
  'protects the server-rendered page for %s visitors before reading data',
  async (status) => {
    m.admin.mockResolvedValue({ status });
    await expect(EmailCampaignsPage()).rejects.toThrow('redirect:/admin/login');
    expect(m.client).not.toHaveBeenCalled();
  }
);
it('fails closed during authentication outages', async () => {
  m.admin.mockResolvedValue({ status: 'unavailable' });
  const element = await EmailCampaignsPage();
  expect(element.props.children[0].props.children).toBe('Sign-in unavailable');
  expect(m.client).not.toHaveBeenCalled();
});
