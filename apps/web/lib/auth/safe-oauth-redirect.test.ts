import { describe, expect, it } from 'vitest';
import { loginRedirectTarget, safeInternalRedirectTarget } from './safe-oauth-redirect';

const baseUrl = 'https://www.trackmyopt.com';

describe('safeInternalRedirectTarget', () => {
  it('keeps an allowed internal path and its query string', () => {
    const result = safeInternalRedirectTarget(
      '/dashboard/case-status?source=login',
      baseUrl
    );

    expect(result.href).toBe(
      'https://www.trackmyopt.com/dashboard/case-status?source=login'
    );
  });

  it.each([
    'https://attacker.example',
    '//attacker.example',
    '/%2f%2fattacker.example',
    '/dashboard\\attacker.example',
    'javascript:alert(1)',
  ])('rejects an unsafe redirect target: %s', (candidate) => {
    const result = safeInternalRedirectTarget(candidate, baseUrl);

    expect(result.href).toBe(
      'https://www.trackmyopt.com/dashboard'
    );
  });
});

describe('login destination continuity', () => {
  it.each(['next', 'redirect', 'returnTo'])('preserves the %s destination', key => {
    expect(loginRedirectTarget(new URLSearchParams({ [key]: '/dashboard/case-status' }), baseUrl).pathname).toBe('/dashboard/case-status');
  });
  it('rejects an external next destination even when another alias is present', () => {
    expect(loginRedirectTarget(new URLSearchParams({ next: '//evil.example', returnTo: '/dashboard/case-status' }), baseUrl).pathname).toBe('/dashboard');
  });
});
