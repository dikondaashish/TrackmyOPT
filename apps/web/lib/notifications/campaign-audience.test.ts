// @vitest-environment node
import { expect, it } from 'vitest';
import { isInactiveAccount } from './campaign-audience';
const cutoff = Date.parse('2026-09-15T00:00:00Z');
const base = { email: 'fictional@example.invalid', email_confirmed_at: '2026-08-01T00:00:00Z', created_at: '2026-08-01T00:00:00Z' };
it('includes verified accounts without a recent sign-in', () => {
  expect(isInactiveAccount(base, cutoff)).toBe(true);
  expect(isInactiveAccount({ ...base, last_sign_in_at: '2026-09-01T00:00:00Z' }, cutoff)).toBe(true);
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
