import { describe, expect, it } from 'vitest';
import { isMissingPkceVerifier, isStaleAuthLink } from './pkce-callback';

describe('isMissingPkceVerifier', () => {
  it('matches the Supabase missing-verifier exchange error (TRACKMYOPT-2V)', () => {
    expect(
      isMissingPkceVerifier({
        message: 'invalid request: both auth code and code verifier should be non-empty',
      })
    ).toBe(true);
    expect(
      isMissingPkceVerifier(new Error('invalid request: both auth code and code verifier should be non-empty'))
    ).toBe(true);
  });

  it('does not match other exchange failures', () => {
    expect(isMissingPkceVerifier({ message: 'invalid flow state, no valid flow state found' })).toBe(false);
    expect(isMissingPkceVerifier(new Error('fetch failed'))).toBe(false);
    expect(isMissingPkceVerifier(null)).toBe(false);
    expect(isMissingPkceVerifier('code verifier should be non-empty')).toBe(false);
  });
});

describe('isStaleAuthLink', () => {
  it('matches a used or expired sign-in link (TRACKMYOPT-2V regression)', () => {
    expect(isStaleAuthLink({ message: 'invalid flow state, no valid flow state found' })).toBe(true);
    expect(isStaleAuthLink(new Error('invalid flow state, no valid flow state found'))).toBe(true);
  });

  it('does not match other exchange failures', () => {
    expect(isStaleAuthLink({ message: 'both auth code and code verifier should be non-empty' })).toBe(false);
    expect(isStaleAuthLink(new Error('fetch failed'))).toBe(false);
    expect(isStaleAuthLink(null)).toBe(false);
  });
});
