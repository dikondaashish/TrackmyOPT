// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import {
  canReadEmailCampaigns,
  getEmailCampaignAdmin,
} from './email-campaign-admin';
const m = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: m.getUser } }),
}));
const user = {
  email: 'admin@example.invalid',
  email_confirmed_at: '2026-09-29T10:00:00Z',
  is_anonymous: false,
  app_metadata: { email_campaign_admin: true },
};
beforeEach(() => vi.clearAllMocks());
it('requires a verified account and a strict service-assigned permission', () => {
  expect(canReadEmailCampaigns(user)).toBe(true);
  expect(
    canReadEmailCampaigns({ ...user, email_confirmed_at: undefined })
  ).toBe(false);
  expect(canReadEmailCampaigns({ ...user, is_anonymous: true })).toBe(false);
  expect(
    canReadEmailCampaigns({
      ...user,
      app_metadata: { email_campaign_admin: 'true' },
    })
  ).toBe(false);
  const forged = {
    ...user,
    app_metadata: {},
    user_metadata: { email_campaign_admin: true, role: 'admin' },
  };
  expect(canReadEmailCampaigns(forged)).toBe(false);
});
it('checks current permissions on every request, including revocation', async () => {
  m.getUser
    .mockResolvedValueOnce({ data: { user }, error: null })
    .mockResolvedValueOnce({
      data: { user: { ...user, app_metadata: {} } },
      error: null,
    });
  expect(await getEmailCampaignAdmin()).toEqual({
    status: 'admin',
    email: user.email,
  });
  expect(await getEmailCampaignAdmin()).toEqual({ status: 'forbidden' });
  expect(m.getUser).toHaveBeenCalledTimes(2);
});
it('does not authorize missing sessions or provider failures', async () => {
  m.getUser
    .mockResolvedValueOnce({
      data: { user: null },
      error: { name: 'AuthSessionMissingError' },
    })
    .mockResolvedValueOnce({ data: { user: null }, error: { status: 503 } });
  expect(await getEmailCampaignAdmin()).toEqual({ status: 'signed_out' });
  expect(await getEmailCampaignAdmin()).toEqual({ status: 'unavailable' });
});
