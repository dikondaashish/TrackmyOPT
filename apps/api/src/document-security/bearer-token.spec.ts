import { bearerMatches } from './bearer-token';

describe('bearerMatches', () => {
  it('accepts the matching Bearer token', () => {
    expect(bearerMatches('Bearer secret-token', 'secret-token')).toBe(true);
  });

  it('rejects missing, mismatched, or unconfigured tokens', () => {
    expect(bearerMatches(undefined, 'secret-token')).toBe(false);
    expect(bearerMatches('Bearer other', 'secret-token')).toBe(false);
    expect(bearerMatches('Bearer secret-token', '')).toBe(false);
  });
});
