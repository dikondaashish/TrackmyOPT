// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { easternDateParts, isLinkedInAdmin, linkedInAppConfig } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isLinkedInAdmin', () => {
  const confirmed = { email_confirmed_at: '2026-01-01T00:00:00Z', is_anonymous: false };

  it('allows only the confirmed owner account by default', () => {
    expect(isLinkedInAdmin({ ...confirmed, email: 'DikondaAshish@gmail.com' })).toBe(true);
    expect(isLinkedInAdmin({ ...confirmed, email: 'someone@example.com' })).toBe(false);
    expect(isLinkedInAdmin({ email: 'dikondaashish@gmail.com', email_confirmed_at: undefined, is_anonymous: false })).toBe(false);
    expect(isLinkedInAdmin({ ...confirmed, email: 'dikondaashish@gmail.com', is_anonymous: true })).toBe(false);
  });

  it('uses LINKEDIN_ADMIN_EMAILS when set', () => {
    vi.stubEnv('LINKEDIN_ADMIN_EMAILS', 'ops@example.com, owner@example.com');
    expect(isLinkedInAdmin({ ...confirmed, email: 'owner@example.com' })).toBe(true);
    expect(isLinkedInAdmin({ ...confirmed, email: 'dikondaashish@gmail.com' })).toBe(false);
  });
});

describe('linkedInAppConfig', () => {
  it('is null until both keys are set and validates optional values', () => {
    expect(linkedInAppConfig()).toBeNull();
    vi.stubEnv('LINKEDIN_CLIENT_ID', 'id');
    vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'secret');
    vi.stubEnv('LINKEDIN_API_VERSION', 'latest');
    vi.stubEnv('LINKEDIN_ORGANIZATION_ID', '12345');
    expect(linkedInAppConfig()).toEqual({ clientId: 'id', clientSecret: 'secret', apiVersion: '202609', organizationId: '12345' });
  });
});

describe('easternDateParts', () => {
  it('uses the New York calendar day and hour', () => {
    expect(easternDateParts(new Date('2026-10-19T03:30:00Z'))).toEqual({ date: '2026-10-18', hour: 23 });
    expect(easternDateParts(new Date('2026-12-07T19:30:00Z'))).toEqual({ date: '2026-12-07', hour: 14 });
  });
});
