import { describe, expect, it } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { shouldUploadPostHogSourcemaps } = require('./posthog-sourcemaps.js') as {
  shouldUploadPostHogSourcemaps(env: Record<string, string | undefined>): boolean;
};

const credentials = {
  POSTHOG_SOURCEMAPS_ENABLED: 'true',
  POSTHOG_PERSONAL_API_KEY: 'test-key',
  POSTHOG_PROJECT_ID: '123',
};

describe('PostHog source-map build gate', () => {
  it('skips uploads during local builds even if a developer has credentials', () => {
    expect(shouldUploadPostHogSourcemaps(credentials)).toBe(false);
  });

  it('skips uploads when production credentials are absent', () => {
    expect(shouldUploadPostHogSourcemaps({ VERCEL_ENV: 'production' })).toBe(false);
  });

  it('uploads during a credentialed Vercel production deployment', () => {
    expect(shouldUploadPostHogSourcemaps({ ...credentials, VERCEL_ENV: 'production' })).toBe(true);
  });

  it('allows an explicitly trusted non-Vercel release runner', () => {
    expect(shouldUploadPostHogSourcemaps({
      ...credentials,
      POSTHOG_SOURCEMAPS_FORCE_UPLOAD: 'true',
    })).toBe(true);
  });
});
