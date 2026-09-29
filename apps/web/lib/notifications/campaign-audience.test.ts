// @vitest-environment node
import { expect, it } from 'vitest';
import { isInactiveAccount, selectFreeCampaignRecipients } from './campaign-audience';
const cutoff = Date.parse('2026-09-15T00:00:00Z');
const base = { email: 'fictional@example.invalid', email_confirmed_at: '2026-08-01T00:00:00Z', created_at: '2026-08-01T00:00:00Z' };
it('includes verified accounts without a recent sign-in', () => {
  expect(isInactiveAccount(base, cutoff)).toBe(true);
  expect(isInactiveAccount({ ...base, last_sign_in_at: '2026-09-01T00:00:00Z' }, cutoff)).toBe(true);
});

it('selects verified Free accounts from Auth while honoring opt-outs and bounces', () => {
  const profiles = [
    { user_id: 'free', email: null, first_name: 'A', premium_status: false, pro_free_trial_consumed: false },
    { user_id: 'used', email: null, first_name: null, premium_status: false, pro_free_trial_consumed: true },
    { user_id: 'paid', email: null, first_name: null, premium_status: true, pro_free_trial_consumed: false },
    { user_id: 'opted', email: null, first_name: null, premium_status: false, pro_free_trial_consumed: false },
    { user_id: 'bounced', email: null, first_name: null, premium_status: false, pro_free_trial_consumed: false },
    { user_id: 'mismatch', email: 'wrong@example.com', first_name: null, premium_status: false, pro_free_trial_consumed: false },
    { user_id: 'unverified', email: null, first_name: null, premium_status: false, pro_free_trial_consumed: false },
  ];
  const accounts = [...profiles.map(profile => ({ id: profile.user_id, email: `${profile.user_id}@example.com`, email_confirmed_at: profile.user_id === 'unverified' ? null : '2026-01-01' })),
    { id: 'no-profile', email: 'no-profile@example.com', email_confirmed_at: '2026-01-01' },
    { id: 'no-profile-paid', email: 'no-profile-paid@example.com', email_confirmed_at: '2026-01-01' }];
  expect(selectFreeCampaignRecipients(profiles, accounts, new Set(['opted']), new Set(['bounced@example.com'])))
    .toEqual([
      { userId: 'free', email: 'free@example.com', firstName: 'A', introUsed: false, hasProfile: true },
      { userId: 'no-profile', email: 'no-profile@example.com', firstName: null, introUsed: false, hasProfile: false },
      { userId: 'no-profile-paid', email: 'no-profile-paid@example.com', firstName: null, introUsed: false, hasProfile: false },
      { userId: 'used', email: 'used@example.com', firstName: null, introUsed: true, hasProfile: true },
    ]);
  expect(selectFreeCampaignRecipients(profiles, accounts, new Set(['opted']),
    new Set(['bounced@example.com']), new Set(['no-profile-paid'])).map(recipient => recipient.userId))
    .toEqual(['free', 'no-profile', 'used']);
});
it('excludes recent, unverified, deleted, and invalid accounts', () => {
  for (const user of [
    { ...base, last_sign_in_at: '2026-09-20T00:00:00Z' },
    { ...base, created_at: '2026-09-20T00:00:00Z' },
    { ...base, email_confirmed_at: null },
    { ...base, deleted_at: '2026-09-01T00:00:00Z' },
    { ...base, last_sign_in_at: 'invalid' },
  ]) expect(isInactiveAccount(user, cutoff)).toBe(false);
});
