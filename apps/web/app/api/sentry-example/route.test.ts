// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as nodeError } from './route';
import { GET as edgeError } from './edge/route';

afterEach(() => vi.unstubAllEnvs());

describe.each([
  ['server', nodeError],
  ['edge', edgeError],
] as const)('%s Sentry verification', (_runtime, handler) => {
  it.each(['production', 'test'])(
    'does not throw a test error in %s',
    (environment) => {
      vi.stubEnv('NODE_ENV', environment);
      expect(handler().status).toBe(404);
    }
  );

  it('throws a synthetic error during local development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(handler).toThrow(/TrackMyOPT Sentry .* verification/);
  });
});

it('returns a synthetic handled failure only in development', () => {
  vi.stubEnv('NODE_ENV', 'development');
  const request = new Request(
    'https://example.test/api/sentry-example?handled=1'
  );
  expect(nodeError(request).status).toBe(503);
  vi.stubEnv('NODE_ENV', 'production');
  expect(nodeError(request).status).toBe(404);
});
